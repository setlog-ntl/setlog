import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, validationError, serverError, apiError, notFoundError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { checkHomepageDeployQuota } from '@/lib/quota';
import { forkRepo, GitHubApiError } from '@/lib/github/api';
import { decrypt } from '@/lib/crypto';
import { forkRequestSchema } from '@/lib/validations/oneclick';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-fork:${user.id}`, 5, 300_000); // 5 per 5 min
  if (!success) return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });

  const body = await request.json();
  const parsed = forkRequestSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { template_id, site_name, github_service_account_id } = parsed.data;

  // 1. Quota check
  const quotaCheck = await checkHomepageDeployQuota(user.id);
  if (!quotaCheck.allowed) {
    return apiError(
      `무료 배포 한도에 도달했습니다 (${quotaCheck.current}/${quotaCheck.max}). Pro 플랜으로 업그레이드하세요.`,
      403
    );
  }

  // 2. Get template
  const { data: template } = await supabase
    .from('homepage_templates')
    .select('*')
    .eq('id', template_id)
    .eq('is_active', true)
    .single();

  if (!template) return notFoundError('템플릿');

  // 3. Get GitHub service account (find any active GitHub OAuth across user's projects)
  const { data: githubService } = await supabase
    .from('services')
    .select('id')
    .eq('slug', 'github')
    .single();

  if (!githubService) {
    return serverError('GitHub 서비스 설정을 찾을 수 없습니다');
  }

  let ghQuery = supabase
    .from('service_accounts')
    .select('id, project_id, encrypted_access_token, encrypted_refresh_token, token_expires_at, oauth_scopes, oauth_provider_user_id, oauth_metadata')
    .eq('user_id', user.id)
    .eq('service_id', githubService.id)
    .eq('connection_type', 'oauth')
    .eq('status', 'active');

  if (github_service_account_id) {
    ghQuery = ghQuery.eq('id', github_service_account_id);
  }

  // Prefer user-level accounts (project_id IS NULL) first
  const { data: ghAccount } = await ghQuery
    .order('project_id', { ascending: true, nullsFirst: true })
    .limit(1)
    .single();
  if (!ghAccount) {
    return apiError('GitHub 계정이 연결되어 있지 않습니다. 먼저 GitHub를 연결해주세요.', 404);
  }

  let githubToken: string;
  try {
    githubToken = decrypt(ghAccount.encrypted_access_token);
  } catch {
    return apiError('GitHub 토큰이 유효하지 않습니다. 다시 연결해주세요.', 401);
  }

  // 4. Create Linkmap project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: site_name,
      description: `${template.name_ko} 템플릿으로 생성된 홈페이지`,
    })
    .select()
    .single();

  if (projectError) return serverError(projectError.message);

  // 4.5. If user-level account (project_id = null), create project-level copy
  let projectServiceAccountId = ghAccount.id;
  if (!ghAccount.project_id) {
    const { data: copiedAccount } = await supabase.from('service_accounts').insert({
      project_id: project.id,
      service_id: githubService.id,
      user_id: user.id,
      connection_type: 'oauth',
      encrypted_access_token: ghAccount.encrypted_access_token,
      encrypted_refresh_token: ghAccount.encrypted_refresh_token,
      token_expires_at: ghAccount.token_expires_at,
      oauth_scopes: ghAccount.oauth_scopes,
      oauth_provider_user_id: ghAccount.oauth_provider_user_id,
      oauth_metadata: ghAccount.oauth_metadata,
      status: 'active',
      last_verified_at: new Date().toISOString(),
    }).select('id').single();

    if (copiedAccount) {
      projectServiceAccountId = copiedAccount.id;
    }
  }

  // 5. Fork the template repo on GitHub
  let forkResult;
  try {
    forkResult = await forkRepo(
      githubToken,
      template.github_owner,
      template.github_repo,
      site_name
    );
  } catch (err) {
    // Clean up the created project
    await supabase.from('projects').delete().eq('id', project.id);

    if (err instanceof GitHubApiError) {
      if (err.status === 422) {
        return apiError(`'${site_name}' 이름의 레포지토리가 이미 존재합니다. 다른 이름을 사용해주세요.`, 409);
      }
      return apiError(`GitHub Fork 실패: ${err.message}`, 502);
    }
    return serverError('GitHub Fork 중 오류가 발생했습니다');
  }

  // 6. Link repo to project
  await supabase.from('project_github_repos').insert({
    project_id: project.id,
    service_account_id: projectServiceAccountId,
    owner: forkResult.owner.login,
    repo_name: forkResult.name,
    repo_full_name: forkResult.full_name,
    default_branch: forkResult.default_branch,
    auto_sync_enabled: false,
  });

  // 7. Create homepage_deploys record
  const { data: deploy, error: deployError } = await supabase
    .from('homepage_deploys')
    .insert({
      user_id: user.id,
      project_id: project.id,
      template_id: template.id,
      site_name,
      forked_repo_full_name: forkResult.full_name,
      forked_repo_url: forkResult.html_url,
      fork_status: 'forked',
    })
    .select()
    .single();

  if (deployError) return serverError(deployError.message);

  // 8. Auto-create project_services entries (GitHub + Vercel)
  // Reuse githubService.id from step 3
  const { data: vercelServiceForLink } = await supabase
    .from('services')
    .select('id')
    .eq('slug', 'vercel')
    .single();

  const serviceEntries = [];
  serviceEntries.push({ project_id: project.id, service_id: githubService.id });
  if (vercelServiceForLink) {
    serviceEntries.push({ project_id: project.id, service_id: vercelServiceForLink.id });
  }
  await supabase.from('project_services').insert(serviceEntries);

  await logAudit(user.id, {
    action: 'oneclick.fork',
    resourceType: 'homepage_deploy',
    resourceId: deploy.id,
    details: {
      template_slug: template.slug,
      site_name,
      forked_repo: forkResult.full_name,
      project_id: project.id,
    },
  });

  return NextResponse.json(
    {
      deploy_id: deploy.id,
      project_id: project.id,
      forked_repo: forkResult.full_name,
      forked_repo_url: forkResult.html_url,
    },
    { status: 201 }
  );
}

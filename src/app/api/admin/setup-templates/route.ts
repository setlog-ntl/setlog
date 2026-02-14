import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { unauthorizedError, apiError, serverError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { decrypt } from '@/lib/crypto';
import {
  createRepo,
  pushFilesAtomically,
  updateRepoSettings,
  GitHubApiError,
} from '@/lib/github/api';
import { homepageTemplates } from '@/data/homepage-template-content';

interface TemplateResult {
  slug: string;
  repoName: string;
  status: 'created' | 'already_exists' | 'error';
  repoUrl?: string;
  error?: string;
}

export async function POST() {
  // 1. Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  // 2. Rate limit: 1 per 10 minutes
  const { success } = rateLimit(`admin-setup-templates:${user.id}`, 1, 600_000);
  if (!success) {
    return NextResponse.json(
      { error: '이 작업은 10분에 1번만 실행할 수 있습니다.' },
      { status: 429 }
    );
  }

  // 3. Get user's GitHub token from service_accounts
  const { data: githubService } = await supabase
    .from('services')
    .select('id')
    .eq('slug', 'github')
    .single();

  if (!githubService) {
    return serverError('GitHub 서비스 설정을 찾을 수 없습니다');
  }

  const { data: ghAccount } = await supabase
    .from('service_accounts')
    .select('id, encrypted_access_token')
    .eq('user_id', user.id)
    .eq('service_id', githubService.id)
    .eq('connection_type', 'oauth')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
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

  // 4. Get GitHub username
  let githubUsername: string;
  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Linkmap/1.0',
      },
    });
    if (!userRes.ok) {
      return apiError('GitHub 사용자 정보를 가져올 수 없습니다.', 502);
    }
    const userData = await userRes.json();
    githubUsername = userData.login;
  } catch {
    return apiError('GitHub API 요청에 실패했습니다.', 502);
  }

  // 5. Create repos for each template
  const results: TemplateResult[] = [];

  for (const template of homepageTemplates) {
    const result: TemplateResult = {
      slug: template.slug,
      repoName: template.repoName,
      status: 'created',
    };

    try {
      // a. Create repo
      let repo;
      try {
        repo = await createRepo(
          githubToken,
          template.repoName,
          template.description,
          { auto_init: true, is_template: false }
        );
      } catch (err) {
        if (err instanceof GitHubApiError && err.status === 422) {
          // Repo already exists — that's OK
          result.status = 'already_exists';
          result.repoUrl = `https://github.com/${githubUsername}/${template.repoName}`;
          results.push(result);
          continue;
        }
        throw err;
      }

      result.repoUrl = repo.html_url;

      // b. Push all files as atomic commit (handles non-empty repos)
      // Small delay to let GitHub finalize repo initialization
      await new Promise((r) => setTimeout(r, 1000));
      await pushFilesAtomically(
        githubToken,
        githubUsername,
        template.repoName,
        template.files,
        'Initial commit from Linkmap'
      );

      // c. Mark as template repo
      await updateRepoSettings(
        githubToken,
        githubUsername,
        template.repoName,
        { is_template: true }
      );

      result.status = 'created';
    } catch (err) {
      result.status = 'error';
      result.error = err instanceof GitHubApiError
        ? `GitHub ${err.status}: ${err.message}`
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    }

    results.push(result);
  }

  // 6. Update homepage_templates table: set github_owner to actual username
  const adminSupabase = createAdminClient();
  const templateSlugs = homepageTemplates.map((t) => t.slug);

  const { error: updateError } = await adminSupabase
    .from('homepage_templates')
    .update({ github_owner: githubUsername })
    .in('slug', templateSlugs);

  if (updateError) {
    console.error('Failed to update homepage_templates github_owner:', updateError);
  }

  // 7. Audit log
  await logAudit(user.id, {
    action: 'admin.setup_templates',
    resourceType: 'homepage_templates',
    details: {
      github_username: githubUsername,
      results: results.map((r) => ({ slug: r.slug, status: r.status })),
    },
  });

  const created = results.filter((r) => r.status === 'created').length;
  const existing = results.filter((r) => r.status === 'already_exists').length;
  const errored = results.filter((r) => r.status === 'error').length;

  return NextResponse.json(
    {
      message: `템플릿 레포 설정 완료: ${created}개 생성, ${existing}개 이미 존재, ${errored}개 오류`,
      github_owner: githubUsername,
      results,
    },
    { status: 201 }
  );
}

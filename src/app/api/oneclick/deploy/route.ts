import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, validationError, serverError, apiError, notFoundError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { encrypt } from '@/lib/crypto';
import { createVercelProject, setVercelEnvVars, listProjectDeployments, verifyVercelToken, VercelApiError } from '@/lib/vercel/api';
import { deployRequestSchema } from '@/lib/validations/oneclick';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-deploy:${user.id}`, 5, 300_000);
  if (!success) return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });

  const body = await request.json();
  const parsed = deployRequestSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { deploy_id, vercel_token, env_vars } = parsed.data;

  // 1. Get the deploy record
  const { data: deploy } = await supabase
    .from('homepage_deploys')
    .select('*, homepage_templates(*)')
    .eq('id', deploy_id)
    .eq('user_id', user.id)
    .single();

  if (!deploy) return notFoundError('배포');
  if (deploy.fork_status !== 'forked') {
    return apiError('Fork가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.', 400);
  }
  if (deploy.deploy_status !== 'pending') {
    return apiError('이미 배포가 진행 중이거나 완료되었습니다.', 400);
  }

  // 2. Verify Vercel token
  const verification = await verifyVercelToken(vercel_token);
  if (!verification.valid) {
    return apiError('Vercel 토큰이 유효하지 않습니다. 토큰을 확인해주세요.', 401);
  }

  // Update status to creating
  await supabase
    .from('homepage_deploys')
    .update({ deploy_status: 'creating' })
    .eq('id', deploy_id);

  // 3. Store the Vercel token encrypted in service_accounts (project-specific)
  const encryptedToken = encrypt(vercel_token);
  const { data: vercelService } = await supabase
    .from('services')
    .select('id')
    .eq('slug', 'vercel')
    .single();

  if (vercelService && deploy.project_id) {
    await supabase.from('service_accounts').upsert(
      {
        project_id: deploy.project_id,
        service_id: vercelService.id,
        user_id: user.id,
        connection_type: 'api_key',
        encrypted_api_key: encryptedToken,
        api_key_label: `Vercel token (${verification.username || 'user'})`,
        status: 'active',
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,service_id' }
    );
  }

  // 4. Create Vercel project connected to the forked GitHub repo
  let vercelProject;
  try {
    vercelProject = await createVercelProject(vercel_token, {
      name: deploy.site_name,
      gitRepository: {
        type: 'github',
        repo: deploy.forked_repo_full_name!,
      },
      framework: deploy.homepage_templates?.framework || 'nextjs',
    });
  } catch (err) {
    await supabase
      .from('homepage_deploys')
      .update({
        deploy_status: 'error',
        deploy_error_message: err instanceof VercelApiError
          ? `Vercel 프로젝트 생성 실패: ${err.body}`
          : 'Vercel 프로젝트 생성 중 오류가 발생했습니다',
      })
      .eq('id', deploy_id);

    if (err instanceof VercelApiError) {
      return apiError(`Vercel 프로젝트 생성 실패: ${err.status}`, 502);
    }
    return serverError('Vercel 프로젝트 생성 중 오류가 발생했습니다');
  }

  // 5. Set environment variables if provided
  if (env_vars && Object.keys(env_vars).length > 0) {
    try {
      const envVarEntries = Object.entries(env_vars).map(([key, value]) => ({
        key,
        value,
        target: ['production', 'preview', 'development'] as ('production' | 'preview' | 'development')[],
        type: 'plain' as const,
      }));
      await setVercelEnvVars(vercel_token, vercelProject.id, envVarEntries);
    } catch {
      // Non-blocking: env vars are optional, don't fail the deploy
      console.error('Failed to set Vercel env vars');
    }
  }

  // 6. Vercel auto-deploys when a GitHub repo is connected.
  // Poll for the first deployment.
  let deploymentId: string | null = null;
  let deploymentUrl: string | null = null;
  try {
    // Wait briefly for Vercel to create the deployment
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const { deployments } = await listProjectDeployments(vercel_token, vercelProject.id, 1);
    if (deployments.length > 0) {
      deploymentId = deployments[0].id;
      deploymentUrl = `https://${deployments[0].url}`;
    }
  } catch {
    // Deployment may not be ready yet — that's fine, polling will handle it
  }

  // 7. Update deploy record
  const vercelProjectUrl = `https://vercel.com/${verification.username || ''}/${deploy.site_name}`;
  await supabase
    .from('homepage_deploys')
    .update({
      vercel_project_id: vercelProject.id,
      vercel_project_url: vercelProjectUrl,
      deployment_id: deploymentId,
      deployment_url: deploymentUrl,
      deploy_status: deploymentId ? 'building' : 'creating',
    })
    .eq('id', deploy_id);

  await logAudit(user.id, {
    action: 'oneclick.deploy',
    resourceType: 'homepage_deploy',
    resourceId: deploy_id,
    details: {
      vercel_project_id: vercelProject.id,
      site_name: deploy.site_name,
    },
  });

  return NextResponse.json({
    deployment_url: deploymentUrl,
    vercel_project_url: vercelProjectUrl,
    vercel_project_id: vercelProject.id,
    deployment_id: deploymentId,
  });
}

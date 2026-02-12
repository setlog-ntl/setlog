import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, apiError, notFoundError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { decrypt } from '@/lib/crypto';
import { getVercelDeployment, listProjectDeployments } from '@/lib/vercel/api';

type StepStatus = 'completed' | 'in_progress' | 'pending' | 'error';

interface DeployStep {
  name: string;
  status: StepStatus;
  label: string;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-status:${user.id}`, 60);
  if (!success) return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });

  const deployId = request.nextUrl.searchParams.get('deploy_id');
  if (!deployId) return apiError('deploy_id는 필수입니다', 400);

  const { data: deploy } = await supabase
    .from('homepage_deploys')
    .select('*')
    .eq('id', deployId)
    .eq('user_id', user.id)
    .single();

  if (!deploy) return notFoundError('배포');

  // If there's a Vercel project but no deployment yet, or deployment is building, poll Vercel
  if (deploy.vercel_project_id && deploy.deploy_status !== 'ready' && deploy.deploy_status !== 'error') {
    try {
      // Get the Vercel token from service_accounts (stored as api_key for the project)
      const { data: vercelService } = await supabase
        .from('services')
        .select('id')
        .eq('slug', 'vercel')
        .single();

      const { data: vercelAccount } = vercelService
        ? await supabase
            .from('service_accounts')
            .select('encrypted_api_key')
            .eq('project_id', deploy.project_id)
            .eq('service_id', vercelService.id)
            .eq('status', 'active')
            .single()
        : { data: null };

      if (vercelAccount) {
        const vercelToken = decrypt(vercelAccount.encrypted_api_key);

        if (deploy.deployment_id) {
          // Check existing deployment status
          const deployment = await getVercelDeployment(vercelToken, deploy.deployment_id);
          const newStatus = mapVercelState(deployment.readyState);

          if (newStatus !== deploy.deploy_status) {
            const updateData: Record<string, unknown> = {
              deploy_status: newStatus,
              deployment_url: `https://${deployment.url}`,
            };
            if (newStatus === 'ready') {
              updateData.deployed_at = new Date().toISOString();
              await logAudit(user.id, {
                action: 'oneclick.deploy_success',
                resourceType: 'homepage_deploy',
                resourceId: deploy.id,
                details: { deployment_url: `https://${deployment.url}` },
              });
            }
            if (newStatus === 'error') {
              await logAudit(user.id, {
                action: 'oneclick.deploy_error',
                resourceType: 'homepage_deploy',
                resourceId: deploy.id,
              });
            }
            await supabase
              .from('homepage_deploys')
              .update(updateData)
              .eq('id', deployId);

            deploy.deploy_status = newStatus;
            deploy.deployment_url = `https://${deployment.url}`;
          }
        } else {
          // No deployment ID yet — try to find it
          const { deployments } = await listProjectDeployments(vercelToken, deploy.vercel_project_id, 1);
          if (deployments.length > 0) {
            const d = deployments[0];
            const newStatus = mapVercelState(d.readyState);
            await supabase
              .from('homepage_deploys')
              .update({
                deployment_id: d.id,
                deployment_url: `https://${d.url}`,
                deploy_status: newStatus,
              })
              .eq('id', deployId);

            deploy.deployment_id = d.id;
            deploy.deployment_url = `https://${d.url}`;
            deploy.deploy_status = newStatus;
          }
        }
      }
    } catch {
      // Non-fatal: return whatever we have in the DB
    }
  }

  const steps = buildSteps(deploy);

  return NextResponse.json({
    deploy_id: deploy.id,
    fork_status: deploy.fork_status,
    deploy_status: deploy.deploy_status,
    deployment_url: deploy.deployment_url,
    deploy_error: deploy.deploy_error_message,
    vercel_project_url: deploy.vercel_project_url,
    forked_repo_url: deploy.forked_repo_url,
    steps,
  });
}

function mapVercelState(state: string): string {
  switch (state) {
    case 'READY': return 'ready';
    case 'ERROR': return 'error';
    case 'CANCELED': return 'canceled';
    case 'BUILDING':
    case 'INITIALIZING':
    case 'QUEUED': return 'building';
    default: return 'creating';
  }
}

function buildSteps(deploy: Record<string, unknown>): DeployStep[] {
  const forkStatus = deploy.fork_status as string;
  const deployStatus = deploy.deploy_status as string;

  const forkStep: StepStatus =
    forkStatus === 'forked' ? 'completed' :
    forkStatus === 'forking' ? 'in_progress' :
    forkStatus === 'failed' ? 'error' : 'pending';

  const projectStep: StepStatus =
    deployStatus === 'pending' ? (forkStep === 'completed' ? 'pending' : 'pending') :
    deployStatus === 'creating' ? 'in_progress' :
    ['building', 'ready', 'error', 'canceled'].includes(deployStatus) ? 'completed' : 'pending';

  const buildStep: StepStatus =
    deployStatus === 'building' ? 'in_progress' :
    deployStatus === 'ready' ? 'completed' :
    deployStatus === 'error' ? 'error' :
    'pending';

  const deployStep: StepStatus =
    deployStatus === 'ready' ? 'completed' :
    deployStatus === 'error' ? 'error' :
    'pending';

  return [
    { name: 'fork', status: forkStep, label: '레포지토리 복사' },
    { name: 'project', status: projectStep, label: 'Vercel 프로젝트 생성' },
    { name: 'build', status: buildStep, label: '빌드 중...' },
    { name: 'deploy', status: deployStep, label: '배포 완료' },
  ];
}

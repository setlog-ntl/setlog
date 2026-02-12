import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { unauthorizedError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { randomBytes } from 'crypto';

const OAUTH_CONFIGS: Record<string, {
  authorization_url: string;
  client_id_env: string;
  scopes: string[];
}> = {
  github: {
    authorization_url: 'https://github.com/login/oauth/authorize',
    client_id_env: 'GITHUB_OAUTH_CLIENT_ID',
    scopes: ['repo', 'read:org', 'read:user', 'workflow'],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oauth:${user.id}`, 10);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const config = OAUTH_CONFIGS[provider];
  if (!config) return apiError('지원하지 않는 OAuth 프로바이더입니다', 400);

  const clientId = process.env[config.client_id_env];
  if (!clientId) return apiError('OAuth 설정이 완료되지 않았습니다. 관리자에게 문의하세요.', 503);

  const projectId = request.nextUrl.searchParams.get('project_id');
  const serviceSlug = request.nextUrl.searchParams.get('service_slug');
  if (!projectId || !serviceSlug) return apiError('project_id와 service_slug가 필요합니다', 400);

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) return apiError('프로젝트를 찾을 수 없습니다', 404);

  // Generate CSRF state token
  const stateToken = randomBytes(32).toString('hex');

  // Store state in DB (uses admin client to bypass RLS for insert)
  const adminClient = createAdminClient();
  const { error } = await adminClient.from('oauth_states').insert({
    user_id: user.id,
    project_id: projectId,
    service_slug: serviceSlug,
    state_token: stateToken,
    redirect_url: `/project/${projectId}/service-map`,
  });

  if (error) return apiError('OAuth 상태 저장에 실패했습니다', 500);

  // Build authorization URL
  const authUrl = new URL(config.authorization_url);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', `${request.nextUrl.origin}/api/oauth/${provider}/callback`);
  authUrl.searchParams.set('scope', config.scopes.join(' '));
  authUrl.searchParams.set('state', stateToken);

  return NextResponse.redirect(authUrl.toString());
}

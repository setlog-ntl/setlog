import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { unauthorizedError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { randomBytes } from 'crypto';

const GITHUB_SCOPES = ['repo', 'read:org', 'read:user', 'workflow'];

/**
 * GET /api/oneclick/oauth/authorize
 * 원클릭 배포 전용 GitHub OAuth 시작점.
 * project_id/service_slug 없이 user-level 계정 생성.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oauth:${user.id}`, 10);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) return apiError('OAuth 설정이 완료되지 않았습니다. 관리자에게 문의하세요.', 503);

  // Generate CSRF state token
  const stateToken = randomBytes(32).toString('hex');

  // Store state in DB (project_id: null, flow_context: 'oneclick')
  const adminClient = createAdminClient();
  const { error } = await adminClient.from('oauth_states').insert({
    user_id: user.id,
    project_id: null,
    service_slug: 'github',
    state_token: stateToken,
    redirect_url: '/oneclick',
    flow_context: 'oneclick',
  });

  if (error) return apiError('OAuth 상태 저장에 실패했습니다', 500);

  // Build authorization URL
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', `${request.nextUrl.origin}/api/oauth/github/callback`);
  authUrl.searchParams.set('scope', GITHUB_SCOPES.join(' '));
  authUrl.searchParams.set('state', stateToken);

  return NextResponse.redirect(authUrl.toString());
}

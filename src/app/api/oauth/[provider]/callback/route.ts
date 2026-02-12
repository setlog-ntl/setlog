import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { unauthorizedError, apiError } from '@/lib/api/errors';
import { encrypt } from '@/lib/crypto';
import { logAudit } from '@/lib/audit';

const OAUTH_TOKEN_CONFIGS: Record<string, {
  token_url: string;
  client_id_env: string;
  client_secret_env: string;
  user_info_url: string;
}> = {
  github: {
    token_url: 'https://github.com/login/oauth/access_token',
    client_id_env: 'GITHUB_OAUTH_CLIENT_ID',
    client_secret_env: 'GITHUB_OAUTH_CLIENT_SECRET',
    user_info_url: 'https://api.github.com/user',
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

  const config = OAUTH_TOKEN_CONFIGS[provider];
  if (!config) return apiError('지원하지 않는 OAuth 프로바이더입니다', 400);

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (!code || !state) return apiError('code와 state가 필요합니다', 400);

  // Verify CSRF state token
  const adminClient = createAdminClient();
  const { data: oauthState } = await adminClient
    .from('oauth_states')
    .select('*')
    .eq('state_token', state)
    .eq('user_id', user.id)
    .single();

  if (!oauthState) {
    return NextResponse.redirect(new URL('/dashboard?error=invalid_state', request.nextUrl.origin));
  }

  // Check expiry
  if (new Date(oauthState.expires_at) < new Date()) {
    await adminClient.from('oauth_states').delete().eq('id', oauthState.id);
    return NextResponse.redirect(new URL('/dashboard?error=state_expired', request.nextUrl.origin));
  }

  // Delete used state
  await adminClient.from('oauth_states').delete().eq('id', oauthState.id);

  const clientId = process.env[config.client_id_env];
  const clientSecret = process.env[config.client_secret_env];
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_not_configured', request.nextUrl.origin));
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(config.token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${request.nextUrl.origin}/api/oauth/${provider}/callback`,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(
        new URL(`${oauthState.redirect_url}?error=token_exchange_failed`, request.nextUrl.origin)
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || null;
    const expiresIn = tokenData.expires_in;
    const scopes = tokenData.scope ? tokenData.scope.split(',') : [];

    // Fetch user info
    let oauthMetadata: Record<string, unknown> = {};
    let providerUserId: string | null = null;
    try {
      const userRes = await fetch(config.user_info_url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Linkmap/1.0',
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        providerUserId = String(userData.id);
        oauthMetadata = {
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          email: userData.email,
        };
      }
    } catch {
      // Non-critical: continue without metadata
    }

    // Look up service ID by slug
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('slug', oauthState.service_slug)
      .single();

    if (!service) {
      return NextResponse.redirect(
        new URL(`${oauthState.redirect_url}?error=service_not_found`, request.nextUrl.origin)
      );
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    // Calculate token expiry
    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    // Upsert service account
    const { data: account, error } = await adminClient
      .from('service_accounts')
      .upsert(
        {
          project_id: oauthState.project_id,
          service_id: service.id,
          user_id: user.id,
          connection_type: 'oauth',
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          oauth_scopes: scopes,
          oauth_provider_user_id: providerUserId,
          oauth_metadata: oauthMetadata,
          status: 'active',
          last_verified_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,service_id' }
      )
      .select('id')
      .single();

    if (error) {
      return NextResponse.redirect(
        new URL(`${oauthState.redirect_url}?error=save_failed`, request.nextUrl.origin)
      );
    }

    await logAudit(user.id, {
      action: 'service_account.connect_oauth',
      resourceType: 'service_account',
      resourceId: account?.id,
      details: {
        provider,
        project_id: oauthState.project_id,
        service_id: service.id,
        scopes,
      },
    });

    // Redirect: if first-time connection, offer repo linking; otherwise back to map
    const redirectUrl = oauthState.redirect_url.includes('/service-map')
      ? `${oauthState.redirect_url}?oauth_success=${provider}&show_repo_selector=true`
      : `${oauthState.redirect_url}?oauth_success=${provider}`;
    return NextResponse.redirect(
      new URL(redirectUrl, request.nextUrl.origin)
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      new URL(`${oauthState.redirect_url}?error=callback_failed`, request.nextUrl.origin)
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { checkHomepageDeployQuota } from '@/lib/quota';

/**
 * GET /api/oneclick/github-check
 * Check if the current user has any active GitHub OAuth connection.
 * Returns user-level accounts first, then project-level.
 * Includes quota information for UX.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-gh-check:${user.id}`, 30);
  if (!success) return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });

  // Find GitHub service
  const { data: githubService } = await supabase
    .from('services')
    .select('id')
    .eq('slug', 'github')
    .single();

  if (!githubService) {
    return NextResponse.json({ account: null, quota: null });
  }

  // Find any active GitHub OAuth account for this user
  // Prefer user-level accounts (project_id IS NULL) first
  const { data: account } = await supabase
    .from('service_accounts')
    .select('id, oauth_provider_user_id, oauth_metadata, status')
    .eq('user_id', user.id)
    .eq('service_id', githubService.id)
    .eq('connection_type', 'oauth')
    .eq('status', 'active')
    .order('project_id', { ascending: true, nullsFirst: true })
    .limit(1)
    .single();

  // Get quota info
  const quota = await checkHomepageDeployQuota(user.id);

  if (!account) {
    return NextResponse.json({ account: null, quota });
  }

  const metadata = account.oauth_metadata as Record<string, string> | null;

  return NextResponse.json({
    account: {
      id: account.id,
      provider_account_id: metadata?.login || account.oauth_provider_user_id || 'GitHub User',
      status: account.status,
    },
    quota,
  });
}

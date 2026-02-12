import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { decrypt } from '@/lib/crypto';
import { listUserRepos, GitHubApiError } from '@/lib/github/api';

/**
 * GET /api/github/repos?project_id=xxx
 * Lists GitHub repos accessible by the connected GitHub account.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`github-repos:${user.id}`, 20);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const projectId = request.nextUrl.searchParams.get('project_id');
  if (!projectId) return apiError('project_id가 필요합니다', 400);

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();
  if (!project) return apiError('프로젝트를 찾을 수 없습니다', 404);

  // Find GitHub service account for this project
  const { data: account } = await supabase
    .from('service_accounts')
    .select('id, encrypted_access_token, status')
    .eq('project_id', projectId)
    .eq('connection_type', 'oauth')
    .eq('status', 'active')
    .single();

  if (!account) {
    return apiError('GitHub 계정이 연결되지 않았습니다. 서비스맵에서 GitHub를 연결해주세요.', 404);
  }

  try {
    const token = decrypt(account.encrypted_access_token);
    const repos = await listUserRepos(token);
    return NextResponse.json({ repos });
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 401) {
      return apiError('GitHub 토큰이 만료되었습니다. 재연결이 필요합니다.', 401);
    }
    console.error('GitHub repos fetch error:', err);
    return apiError('GitHub 레포 목록을 가져오는데 실패했습니다', 500);
  }
}

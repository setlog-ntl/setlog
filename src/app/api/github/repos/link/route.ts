import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, apiError, validationError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { linkRepoSchema } from '@/lib/validations/github';

/**
 * POST /api/github/repos/link — Link a GitHub repo to a project
 * DELETE /api/github/repos/link?id=xxx — Unlink a repo
 * GET /api/github/repos/link?project_id=xxx — List linked repos
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const projectId = request.nextUrl.searchParams.get('project_id');
  if (!projectId) return apiError('project_id가 필요합니다', 400);

  const { data, error } = await supabase
    .from('project_github_repos')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) return apiError(error.message, 400);
  return NextResponse.json({ repos: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`github-link:${user.id}`, 20);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const body = await request.json();
  const parsed = linkRepoSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_id, owner, repo_name, repo_full_name, default_branch } = parsed.data;

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();
  if (!project) return apiError('프로젝트를 찾을 수 없습니다', 404);

  // Find GitHub service account
  const { data: account } = await supabase
    .from('service_accounts')
    .select('id')
    .eq('project_id', project_id)
    .eq('connection_type', 'oauth')
    .eq('status', 'active')
    .single();

  if (!account) return apiError('GitHub 계정이 연결되지 않았습니다', 404);

  const { data, error } = await supabase
    .from('project_github_repos')
    .upsert(
      {
        project_id,
        service_account_id: account.id,
        owner,
        repo_name,
        repo_full_name,
        default_branch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,repo_full_name' }
    )
    .select()
    .single();

  if (error) return apiError(error.message, 400);

  await logAudit(user.id, {
    action: 'connection.create',
    resourceType: 'project_github_repo',
    resourceId: data.id,
    details: { project_id, repo_full_name },
  });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return apiError('id가 필요합니다', 400);

  // Verify ownership via project
  const { data: link } = await supabase
    .from('project_github_repos')
    .select('id, project_id, repo_full_name, project:projects!inner(user_id)')
    .eq('id', id)
    .single();

  const linkTyped = link as (typeof link) & { project: { user_id: string } } | null;
  if (!linkTyped || linkTyped.project.user_id !== user.id) {
    return apiError('연결을 찾을 수 없습니다', 404);
  }

  const { error } = await supabase
    .from('project_github_repos')
    .delete()
    .eq('id', id);

  if (error) return apiError(error.message, 400);

  await logAudit(user.id, {
    action: 'connection.delete',
    resourceType: 'project_github_repo',
    resourceId: id,
    details: { repo_full_name: linkTyped.repo_full_name },
  });

  return NextResponse.json({ success: true });
}

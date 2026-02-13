import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, notFoundError, apiError, serverError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { decrypt } from '@/lib/crypto';
import { listRepoContents, getFileContent, createOrUpdateFileContent, GitHubApiError } from '@/lib/github/api';
import { fileUpdateSchema } from '@/lib/validations/oneclick';

const EDITABLE_EXTENSIONS = ['.html', '.css', '.js', '.md', '.json', '.txt', '.yml', '.yaml', '.svg'];

function isEditableFile(name: string): boolean {
  return EDITABLE_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

async function getDeployWithToken(supabase: Awaited<ReturnType<typeof createClient>>, deployId: string, userId: string) {
  // Get the deploy record + verify ownership
  const { data: deploy } = await supabase
    .from('homepage_deploys')
    .select('id, site_name, forked_repo_full_name, user_id, project_id')
    .eq('id', deployId)
    .eq('user_id', userId)
    .single();

  if (!deploy) return null;

  // Get GitHub service account token for this project
  const { data: githubService } = await supabase
    .from('services')
    .select('id')
    .eq('slug', 'github')
    .single();

  if (!githubService) return null;

  const { data: ghAccount } = await supabase
    .from('service_accounts')
    .select('encrypted_access_token')
    .eq('user_id', userId)
    .eq('service_id', githubService.id)
    .eq('connection_type', 'oauth')
    .eq('status', 'active')
    .order('project_id', { ascending: true, nullsFirst: true })
    .limit(1)
    .single();

  if (!ghAccount) return null;

  let token: string;
  try {
    token = decrypt(ghAccount.encrypted_access_token);
  } catch {
    return null;
  }

  const [owner, repo] = (deploy.forked_repo_full_name || '').split('/');
  if (!owner || !repo) return null;

  return { deploy, token, owner, repo };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-files-read:${user.id}`, 60, 60_000);
  if (!success) {
    return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });
  }

  const result = await getDeployWithToken(supabase, id, user.id);
  if (!result) return notFoundError('배포');

  const { token, owner, repo } = result;

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  try {
    if (!path) {
      // List files
      const contents = await listRepoContents(token, owner, repo);
      const files = contents
        .filter((item) => item.type === 'file' && isEditableFile(item.name))
        .map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
        }));
      return NextResponse.json({ files });
    } else {
      // Get file content
      if (path.includes('..')) {
        return apiError('잘못된 파일 경로입니다', 400);
      }
      const file = await getFileContent(token, owner, repo, path);
      const decoded = Buffer.from(file.content, 'base64').toString('utf-8');
      return NextResponse.json({
        name: file.name,
        path: file.path,
        sha: file.sha,
        content: decoded,
        size: file.size,
      });
    }
  } catch (err) {
    if (err instanceof GitHubApiError) {
      if (err.status === 404) return notFoundError('파일');
      return apiError(`GitHub API 오류: ${err.message}`, err.status);
    }
    return serverError('파일 조회 중 오류가 발생했습니다');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-files-write:${user.id}`, 20, 60_000);
  if (!success) {
    return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });
  }

  const body = await request.json();
  const parsed = fileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((e) => e.message).join(', ');
    return apiError(messages, 400);
  }

  const { path, content, sha, message } = parsed.data;

  const result = await getDeployWithToken(supabase, id, user.id);
  if (!result) return notFoundError('배포');

  const { deploy, token, owner, repo } = result;

  try {
    const commitResult = await createOrUpdateFileContent(
      token,
      owner,
      repo,
      path,
      content,
      message || `Linkmap 편집기로 ${path} 수정`,
      sha
    );

    await logAudit(user.id, {
      action: 'oneclick.file_edit',
      resourceType: 'homepage_deploy',
      resourceId: deploy.id,
      details: {
        site_name: deploy.site_name,
        file_path: path,
        commit_sha: commitResult.commit.sha,
      },
    });

    return NextResponse.json({ sha: commitResult.content.sha });
  } catch (err) {
    if (err instanceof GitHubApiError) {
      if (err.status === 409) {
        return apiError('파일이 다른 곳에서 수정되었습니다. 새로고침 후 다시 시도해주세요.', 409);
      }
      return apiError(`GitHub API 오류: ${err.message}`, err.status);
    }
    return serverError('파일 저장 중 오류가 발생했습니다');
  }
}

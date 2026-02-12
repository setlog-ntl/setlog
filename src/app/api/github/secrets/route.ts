import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, apiError, validationError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { decrypt } from '@/lib/crypto';
import {
  listRepoSecrets,
  getRepoPublicKey,
  createOrUpdateSecret,
  deleteSecret,
  GitHubApiError,
} from '@/lib/github/api';
import { encryptSecretForGitHub } from '@/lib/github/nacl-encrypt';
import { pushSecretsSchema } from '@/lib/validations/github';

/**
 * GET /api/github/secrets?project_id=xxx&owner=xxx&repo=xxx
 * POST /api/github/secrets — Push env vars as GitHub Secrets
 * DELETE /api/github/secrets?project_id=xxx&owner=xxx&repo=xxx&name=xxx
 */

async function getGitHubToken(supabase: Awaited<ReturnType<typeof createClient>>, projectId: string) {
  const { data: account } = await supabase
    .from('service_accounts')
    .select('encrypted_access_token')
    .eq('project_id', projectId)
    .eq('connection_type', 'oauth')
    .eq('status', 'active')
    .single();

  if (!account) return null;
  return decrypt(account.encrypted_access_token);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`github-secrets:${user.id}`, 20);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const projectId = request.nextUrl.searchParams.get('project_id');
  const owner = request.nextUrl.searchParams.get('owner');
  const repo = request.nextUrl.searchParams.get('repo');

  if (!projectId || !owner || !repo) {
    return apiError('project_id, owner, repo가 필요합니다', 400);
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();
  if (!project) return apiError('프로젝트를 찾을 수 없습니다', 404);

  const token = await getGitHubToken(supabase, projectId);
  if (!token) return apiError('GitHub 계정이 연결되지 않았습니다', 404);

  try {
    const secrets = await listRepoSecrets(token, owner, repo);
    return NextResponse.json(secrets);
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 401) {
      return apiError('GitHub 토큰이 만료되었습니다', 401);
    }
    console.error('GitHub secrets list error:', err);
    return apiError('시크릿 목록을 가져오는데 실패했습니다', 500);
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`github-push:${user.id}`, 10);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const body = await request.json();
  const parsed = pushSecretsSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_id, owner, repo_name, secrets } = parsed.data;

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();
  if (!project) return apiError('프로젝트를 찾을 수 없습니다', 404);

  const token = await getGitHubToken(supabase, project_id);
  if (!token) return apiError('GitHub 계정이 연결되지 않았습니다', 404);

  try {
    // Get repo public key for NaCl encryption
    const publicKey = await getRepoPublicKey(token, owner, repo_name);

    // Decrypt each env var and push to GitHub
    const results: Array<{ name: string; success: boolean; error?: string }> = [];

    for (const secret of secrets) {
      try {
        // Get the env var's encrypted value from DB
        const { data: envVar } = await supabase
          .from('environment_variables')
          .select('encrypted_value, key_name')
          .eq('id', secret.env_var_id)
          .eq('project_id', project_id)
          .single();

        if (!envVar) {
          results.push({ name: secret.secret_name, success: false, error: '환경변수를 찾을 수 없습니다' });
          continue;
        }

        // Decrypt the value from our DB, then re-encrypt for GitHub
        const plainValue = decrypt(envVar.encrypted_value);
        const naclEncrypted = encryptSecretForGitHub(plainValue, publicKey.key);

        await createOrUpdateSecret(
          token, owner, repo_name,
          secret.secret_name, naclEncrypted, publicKey.key_id
        );

        results.push({ name: secret.secret_name, success: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        results.push({ name: secret.secret_name, success: false, error: msg });
      }
    }

    // Update last_synced_at for linked repo
    await supabase
      .from('project_github_repos')
      .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('project_id', project_id)
      .eq('repo_full_name', `${owner}/${repo_name}`);

    await logAudit(user.id, {
      action: 'env_var.update',
      resourceType: 'github_secrets',
      details: {
        project_id,
        repo: `${owner}/${repo_name}`,
        total: secrets.length,
        success_count: results.filter(r => r.success).length,
      },
    });

    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 401) {
      return apiError('GitHub 토큰이 만료되었습니다', 401);
    }
    console.error('GitHub secrets push error:', err);
    return apiError('시크릿 푸시에 실패했습니다', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`github-secrets-delete:${user.id}`, 20);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const projectId = request.nextUrl.searchParams.get('project_id');
  const owner = request.nextUrl.searchParams.get('owner');
  const repo = request.nextUrl.searchParams.get('repo');
  const name = request.nextUrl.searchParams.get('name');

  if (!projectId || !owner || !repo || !name) {
    return apiError('project_id, owner, repo, name이 필요합니다', 400);
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();
  if (!project) return apiError('프로젝트를 찾을 수 없습니다', 404);

  const token = await getGitHubToken(supabase, projectId);
  if (!token) return apiError('GitHub 계정이 연결되지 않았습니다', 404);

  try {
    await deleteSecret(token, owner, repo, name);

    await logAudit(user.id, {
      action: 'env_var.delete',
      resourceType: 'github_secret',
      details: { project_id: projectId, repo: `${owner}/${repo}`, secret_name: name },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 401) {
      return apiError('GitHub 토큰이 만료되었습니다', 401);
    }
    console.error('GitHub secret delete error:', err);
    return apiError('시크릿 삭제에 실패했습니다', 500);
  }
}

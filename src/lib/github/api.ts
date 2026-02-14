/**
 * GitHub API helper module
 * All GitHub REST API interactions go through here.
 */

const GITHUB_API_BASE = 'https://api.github.com';
const USER_AGENT = 'Linkmap/1.0';

interface GitHubRequestOptions {
  token: string;
  method?: string;
  body?: unknown;
}

async function githubFetch<T>(path: string, opts: GitHubRequestOptions): Promise<T> {
  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers: {
      Authorization: `Bearer ${opts.token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new GitHubApiError(
      `GitHub API error: ${res.status} ${res.statusText}`,
      res.status,
      errorBody
    );
  }

  // DELETE returns 204 No Content
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: string
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

// ---------- Types ----------

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
  language: string | null;
}

export interface GitHubSecret {
  name: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubPublicKey {
  key_id: string;
  key: string;
}

// ---------- Repo APIs ----------

export async function listUserRepos(token: string): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(
    '/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator',
    { token }
  );
}

export async function getRepo(token: string, owner: string, repo: string): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>(`/repos/${owner}/${repo}`, { token });
}

// ---------- Secrets APIs ----------

export async function listRepoSecrets(
  token: string,
  owner: string,
  repo: string
): Promise<{ total_count: number; secrets: GitHubSecret[] }> {
  return githubFetch(`/repos/${owner}/${repo}/actions/secrets`, { token });
}

export async function getRepoPublicKey(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubPublicKey> {
  return githubFetch(`/repos/${owner}/${repo}/actions/secrets/public-key`, { token });
}

export async function createOrUpdateSecret(
  token: string,
  owner: string,
  repo: string,
  secretName: string,
  encryptedValue: string,
  keyId: string
): Promise<void> {
  await githubFetch(`/repos/${owner}/${repo}/actions/secrets/${secretName}`, {
    token,
    method: 'PUT',
    body: {
      encrypted_value: encryptedValue,
      key_id: keyId,
    },
  });
}

// ---------- Fork APIs ----------

export interface GitHubForkResult {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  owner: { login: string };
  default_branch: string;
}

export async function forkRepo(
  token: string,
  owner: string,
  repo: string,
  newName?: string
): Promise<GitHubForkResult> {
  return githubFetch<GitHubForkResult>(`/repos/${owner}/${repo}/forks`, {
    token,
    method: 'POST',
    body: {
      name: newName || repo,
      default_branch_only: true,
    },
  });
}

// ---------- Template & GitHub Pages APIs ----------

export interface GitHubGenerateResult {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  owner: { login: string };
  default_branch: string;
}

export async function generateFromTemplate(
  token: string,
  templateOwner: string,
  templateRepo: string,
  newName: string,
  description?: string
): Promise<GitHubGenerateResult> {
  return githubFetch<GitHubGenerateResult>(
    `/repos/${templateOwner}/${templateRepo}/generate`,
    {
      token,
      method: 'POST',
      body: {
        name: newName,
        description: description || `Generated from ${templateOwner}/${templateRepo}`,
        include_all_branches: false,
        private: false,
      },
    }
  );
}

export interface GitHubPagesResult {
  url: string;
  status: string | null;
  html_url: string;
}

export async function enableGitHubPages(
  token: string,
  owner: string,
  repo: string,
  branch: string = 'main',
  path: string = '/'
): Promise<GitHubPagesResult> {
  return githubFetch<GitHubPagesResult>(
    `/repos/${owner}/${repo}/pages`,
    {
      token,
      method: 'POST',
      body: {
        source: { branch, path },
      },
    }
  );
}

export async function getGitHubPagesStatus(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubPagesResult> {
  return githubFetch<GitHubPagesResult>(
    `/repos/${owner}/${repo}/pages`,
    { token }
  );
}

export async function deleteSecret(
  token: string,
  owner: string,
  repo: string,
  secretName: string
): Promise<void> {
  await githubFetch(`/repos/${owner}/${repo}/actions/secrets/${secretName}`, {
    token,
    method: 'DELETE',
  });
}

// ---------- Repo Management APIs ----------

export async function createRepo(
  token: string,
  name: string,
  description: string,
  options?: { is_template?: boolean; auto_init?: boolean; has_issues?: boolean; private?: boolean }
): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>('/user/repos', {
    token,
    method: 'POST',
    body: {
      name,
      description,
      private: options?.private ?? false,
      auto_init: options?.auto_init ?? false,
      is_template: options?.is_template ?? false,
      has_issues: options?.has_issues ?? false,
    },
  });
}

export interface GitHubFileContentResult {
  content: { name: string; path: string; sha: string; html_url: string };
  commit: { sha: string; message: string };
}

export async function createOrUpdateFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<GitHubFileContentResult> {
  const base64Content = Buffer.from(content).toString('base64');
  return githubFetch<GitHubFileContentResult>(
    `/repos/${owner}/${repo}/contents/${path}`,
    {
      token,
      method: 'PUT',
      body: {
        message,
        content: base64Content,
        ...(sha ? { sha } : {}),
      },
    }
  );
}

// ---------- Repo Content APIs ----------

export interface GitHubContentItem {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  size: number;
  sha: string;
  html_url: string;
  download_url: string | null;
}

export interface GitHubFileContentResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string; // base64 encoded
  encoding: string;
  html_url: string;
}

export async function listRepoContents(
  token: string,
  owner: string,
  repo: string,
  path: string = ''
): Promise<GitHubContentItem[]> {
  const apiPath = path ? `/repos/${owner}/${repo}/contents/${path}` : `/repos/${owner}/${repo}/contents`;
  return githubFetch<GitHubContentItem[]>(apiPath, { token });
}

export async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<GitHubFileContentResponse> {
  return githubFetch<GitHubFileContentResponse>(
    `/repos/${owner}/${repo}/contents/${path}`,
    { token }
  );
}

export async function updateRepoSettings(
  token: string,
  owner: string,
  repo: string,
  settings: { is_template?: boolean; description?: string; homepage?: string; has_pages?: boolean }
): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>(`/repos/${owner}/${repo}`, {
    token,
    method: 'PATCH',
    body: settings,
  });
}

// ---------- Git Data APIs (for atomic push) ----------

interface GitBlob {
  sha: string;
  url: string;
}

interface GitTreeItem {
  path: string;
  mode: '100644' | '100755' | '040000' | '160000' | '120000';
  type: 'blob' | 'tree' | 'commit';
  sha: string;
}

interface GitTree {
  sha: string;
  url: string;
  tree: GitTreeItem[];
}

interface GitCommit {
  sha: string;
  url: string;
  message: string;
}

interface GitRef {
  ref: string;
  url: string;
  object: { sha: string; type: string };
}

export async function createBlob(
  token: string,
  owner: string,
  repo: string,
  content: string,
  encoding: 'utf-8' | 'base64' = 'utf-8'
): Promise<GitBlob> {
  return githubFetch<GitBlob>(`/repos/${owner}/${repo}/git/blobs`, {
    token,
    method: 'POST',
    body: { content, encoding },
  });
}

export async function createTree(
  token: string,
  owner: string,
  repo: string,
  treeItems: { path: string; mode: string; type: string; sha: string }[]
): Promise<GitTree> {
  return githubFetch<GitTree>(`/repos/${owner}/${repo}/git/trees`, {
    token,
    method: 'POST',
    body: { tree: treeItems },
  });
}

export async function createCommit(
  token: string,
  owner: string,
  repo: string,
  message: string,
  treeSha: string,
  parents: string[] = []
): Promise<GitCommit> {
  return githubFetch<GitCommit>(`/repos/${owner}/${repo}/git/commits`, {
    token,
    method: 'POST',
    body: { message, tree: treeSha, parents },
  });
}

export async function createRef(
  token: string,
  owner: string,
  repo: string,
  ref: string,
  sha: string
): Promise<GitRef> {
  return githubFetch<GitRef>(`/repos/${owner}/${repo}/git/refs`, {
    token,
    method: 'POST',
    body: { ref, sha },
  });
}

export async function getRef(
  token: string,
  owner: string,
  repo: string,
  ref: string
): Promise<GitRef | null> {
  try {
    return await githubFetch<GitRef>(`/repos/${owner}/${repo}/git/ref/${ref}`, { token });
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 404) return null;
    throw err;
  }
}

export async function updateRef(
  token: string,
  owner: string,
  repo: string,
  ref: string,
  sha: string,
  force: boolean = true
): Promise<GitRef> {
  return githubFetch<GitRef>(`/repos/${owner}/${repo}/git/refs/${ref}`, {
    token,
    method: 'PATCH',
    body: { sha, force },
  });
}

export async function deleteRepo(
  token: string,
  owner: string,
  repo: string
): Promise<void> {
  await githubFetch(`/repos/${owner}/${repo}`, {
    token,
    method: 'DELETE',
  });
}

/**
 * Push multiple files to a repo as a single atomic commit.
 * Handles both empty repos (no prior commits) and non-empty repos (auto_init: true).
 */
export async function pushFilesAtomically(
  token: string,
  owner: string,
  repo: string,
  files: { path: string; content: string }[],
  message: string
): Promise<{ commitSha: string }> {
  // 0. Check if repo already has a main branch (non-empty repo)
  const existingRef = await getRef(token, owner, repo, 'heads/main');
  const parentSha = existingRef?.object?.sha ?? null;

  // 1. Create blobs for all files in parallel
  const blobResults = await Promise.all(
    files.map((file) => createBlob(token, owner, repo, file.content, 'utf-8'))
  );

  // 2. Build tree items
  const treeItems = files.map((file, i) => ({
    path: file.path,
    mode: '100644' as const,
    type: 'blob' as const,
    sha: blobResults[i].sha,
  }));

  // 3. Create tree
  const tree = await createTree(token, owner, repo, treeItems);

  // 4. Create commit (with parent if non-empty repo)
  const parents = parentSha ? [parentSha] : [];
  const commit = await createCommit(token, owner, repo, message, tree.sha, parents);

  // 5. Create or update ref (main branch)
  if (parentSha) {
    await updateRef(token, owner, repo, 'heads/main', commit.sha);
  } else {
    await createRef(token, owner, repo, 'refs/heads/main', commit.sha);
  }

  return { commitSha: commit.sha };
}

/**
 * Enable GitHub Pages using GitHub Actions as build source.
 */
export async function enableGitHubPagesWithActions(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubPagesResult> {
  return githubFetch<GitHubPagesResult>(
    `/repos/${owner}/${repo}/pages`,
    {
      token,
      method: 'POST',
      body: {
        build_type: 'workflow',
      },
    }
  );
}

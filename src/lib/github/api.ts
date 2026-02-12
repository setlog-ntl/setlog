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

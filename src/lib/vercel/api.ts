/**
 * Vercel REST API helper module
 * All Vercel API interactions go through here.
 */

const VERCEL_API_BASE = 'https://api.vercel.com';

interface VercelRequestOptions {
  token: string;
  method?: string;
  body?: unknown;
}

export class VercelApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: string
  ) {
    super(message);
    this.name = 'VercelApiError';
  }
}

async function vercelFetch<T>(path: string, opts: VercelRequestOptions): Promise<T> {
  const res = await fetch(`${VERCEL_API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers: {
      Authorization: `Bearer ${opts.token}`,
      'Content-Type': 'application/json',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new VercelApiError(
      `Vercel API error: ${res.status} ${res.statusText}`,
      res.status,
      errorBody
    );
  }

  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

// ---------- Types ----------

export interface VercelProject {
  id: string;
  name: string;
  link?: {
    type: string;
    repo: string;
    repoId: number;
    org: string;
    gitCredentialId: string;
    productionBranch: string;
  };
}

export interface VercelDeployment {
  id: string;
  url: string;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  readyState: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  inspectorUrl: string;
  meta?: Record<string, string>;
}

export interface VercelEnvVar {
  id: string;
  key: string;
  value: string;
  target: string[];
  type: 'plain' | 'encrypted' | 'secret';
}

// ---------- Project APIs ----------

export async function createVercelProject(
  token: string,
  opts: {
    name: string;
    gitRepository: {
      type: 'github';
      repo: string; // "owner/repo-name"
    };
    framework?: string;
    buildCommand?: string;
    outputDirectory?: string;
  }
): Promise<VercelProject> {
  return vercelFetch<VercelProject>('/v13/projects', {
    token,
    method: 'POST',
    body: {
      name: opts.name,
      gitRepository: opts.gitRepository,
      framework: opts.framework || 'nextjs',
      buildCommand: opts.buildCommand,
      outputDirectory: opts.outputDirectory,
    },
  });
}

export async function getVercelProject(
  token: string,
  projectId: string
): Promise<VercelProject> {
  return vercelFetch<VercelProject>(`/v13/projects/${projectId}`, { token });
}

// ---------- Deployment APIs ----------

export async function getVercelDeployment(
  token: string,
  deploymentId: string
): Promise<VercelDeployment> {
  return vercelFetch<VercelDeployment>(`/v13/deployments/${deploymentId}`, { token });
}

export async function listProjectDeployments(
  token: string,
  projectId: string,
  limit: number = 1
): Promise<{ deployments: VercelDeployment[] }> {
  return vercelFetch<{ deployments: VercelDeployment[] }>(
    `/v6/deployments?projectId=${projectId}&limit=${limit}`,
    { token }
  );
}

// ---------- Environment Variable APIs ----------

export async function setVercelEnvVars(
  token: string,
  projectId: string,
  envVars: Array<{
    key: string;
    value: string;
    target: ('production' | 'preview' | 'development')[];
    type?: 'plain' | 'encrypted' | 'secret';
  }>
): Promise<{ created: VercelEnvVar[] }> {
  return vercelFetch<{ created: VercelEnvVar[] }>(
    `/v10/projects/${projectId}/env`,
    {
      token,
      method: 'POST',
      body: envVars,
    }
  );
}

// ---------- Token Verification ----------

export async function verifyVercelToken(token: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const data = await vercelFetch<{ user: { username: string } }>('/v2/user', { token });
    return { valid: true, username: data.user.username };
  } catch {
    return { valid: false };
  }
}

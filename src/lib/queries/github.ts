import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import type { GitHubRepo, GitHubSecret } from '@/lib/github/api';

// ---------- Types ----------

export interface LinkedRepo {
  id: string;
  project_id: string;
  service_account_id: string;
  owner: string;
  repo_name: string;
  repo_full_name: string;
  default_branch: string;
  auto_sync_enabled: boolean;
  sync_environment: string;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PushSecretItem {
  env_var_id: string;
  secret_name: string;
}

interface PushResult {
  name: string;
  success: boolean;
  error?: string;
}

// ---------- Repos ----------

export function useGitHubRepos(projectId: string) {
  return useQuery({
    queryKey: queryKeys.github.repos(projectId),
    queryFn: async (): Promise<GitHubRepo[]> => {
      const res = await fetch(`/api/github/repos?project_id=${projectId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'GitHub 레포 목록 조회 실패');
      }
      const data = await res.json();
      return data.repos;
    },
    enabled: !!projectId,
    staleTime: 60_000, // 1 min cache
  });
}

// ---------- Linked Repos ----------

export function useLinkedRepos(projectId: string) {
  return useQuery({
    queryKey: queryKeys.github.linkedRepos(projectId),
    queryFn: async (): Promise<LinkedRepo[]> => {
      const res = await fetch(`/api/github/repos/link?project_id=${projectId}`);
      if (!res.ok) throw new Error('연결된 레포 조회 실패');
      const data = await res.json();
      return data.repos;
    },
    enabled: !!projectId,
  });
}

export function useLinkRepo(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      owner: string;
      repo_name: string;
      repo_full_name: string;
      default_branch: string;
    }) => {
      const res = await fetch('/api/github/repos/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, ...input }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '레포 연결 실패');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.github.linkedRepos(projectId) });
    },
  });
}

export function useUnlinkRepo(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/github/repos/link?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('레포 연결 해제 실패');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.github.linkedRepos(projectId) });
    },
  });
}

// ---------- Secrets ----------

export function useGitHubSecrets(projectId: string, owner: string, repo: string) {
  return useQuery({
    queryKey: queryKeys.github.secrets(projectId, owner, repo),
    queryFn: async (): Promise<{ total_count: number; secrets: GitHubSecret[] }> => {
      const res = await fetch(
        `/api/github/secrets?project_id=${projectId}&owner=${owner}&repo=${repo}`
      );
      if (!res.ok) throw new Error('시크릿 목록 조회 실패');
      return res.json();
    },
    enabled: !!projectId && !!owner && !!repo,
    staleTime: 30_000,
  });
}

export function usePushSecretsToGitHub(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      owner: string;
      repo_name: string;
      secrets: PushSecretItem[];
    }): Promise<{ results: PushResult[] }> => {
      const res = await fetch('/api/github/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, ...input }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '시크릿 푸시 실패');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.github.secrets(projectId, variables.owner, variables.repo_name),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.github.linkedRepos(projectId),
      });
    },
  });
}

// ---------- Sync Config ----------

export function useUpdateSyncConfig(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      repo_full_name: string;
      auto_sync_enabled: boolean;
      sync_environment: string;
    }) => {
      const res = await fetch('/api/github/repos/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, ...input }),
      });
      if (!res.ok) throw new Error('동기화 설정 업데이트 실패');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.github.linkedRepos(projectId) });
    },
  });
}

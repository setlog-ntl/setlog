import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';

// ---------- Types ----------

export interface HomepageTemplate {
  id: string;
  slug: string;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
  preview_image_url: string | null;
  github_owner: string;
  github_repo: string;
  framework: string;
  required_env_vars: Array<{ key: string; description: string; required: boolean }>;
  tags: string[];
  is_premium: boolean;
  display_order: number;
  deploy_target?: 'vercel' | 'github_pages' | 'both';
}

export interface DeployStatus {
  deploy_id: string;
  fork_status: 'pending' | 'forking' | 'forked' | 'failed';
  deploy_status: 'pending' | 'creating' | 'building' | 'ready' | 'error' | 'canceled';
  deployment_url: string | null;
  deploy_error: string | null;
  vercel_project_url: string | null;
  forked_repo_url: string | null;
  deploy_method: 'vercel' | 'github_pages';
  pages_url: string | null;
  pages_status: 'pending' | 'enabling' | 'building' | 'built' | 'errored' | null;
  steps: Array<{
    name: string;
    status: 'completed' | 'in_progress' | 'pending' | 'error';
    label: string;
  }>;
}

export interface ForkResult {
  deploy_id: string;
  project_id: string;
  forked_repo: string;
  forked_repo_url: string;
}

export interface DeployResult {
  deployment_url: string | null;
  vercel_project_url: string;
  vercel_project_id: string;
  deployment_id: string | null;
}

export interface DeployPagesResult {
  deploy_id: string;
  project_id: string;
  repo_url: string;
  pages_url: string;
  pages_status: string;
}

// ---------- Templates ----------

export function useHomepageTemplates(deployTarget: string = 'github_pages') {
  return useQuery({
    queryKey: [...queryKeys.oneclick.templates, deployTarget],
    queryFn: async (): Promise<HomepageTemplate[]> => {
      const res = await fetch(`/api/oneclick/templates?deploy_target=${deployTarget}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '템플릿 목록 조회 실패');
      }
      const data = await res.json();
      return data.templates;
    },
    staleTime: 5 * 60_000, // 5 min cache
  });
}

// ---------- Fork (legacy Vercel flow) ----------

export function useForkTemplate() {
  return useMutation({
    mutationFn: async (input: {
      template_id: string;
      site_name: string;
    }): Promise<ForkResult> => {
      const res = await fetch('/api/oneclick/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fork 실패');
      }
      return res.json();
    },
  });
}

// ---------- Deploy to Vercel (legacy) ----------

export function useDeployToVercel() {
  return useMutation({
    mutationFn: async (input: {
      deploy_id: string;
      vercel_token: string;
      env_vars?: Record<string, string>;
    }): Promise<DeployResult> => {
      const res = await fetch('/api/oneclick/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '배포 실패');
      }
      return res.json();
    },
  });
}

// ---------- Deploy to GitHub Pages ----------

export function useDeployToGitHubPages() {
  return useMutation({
    mutationFn: async (input: {
      template_id: string;
      site_name: string;
    }): Promise<DeployPagesResult> => {
      const res = await fetch('/api/oneclick/deploy-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '배포 실패');
      }
      return res.json();
    },
  });
}

// ---------- Types: Deployment List ----------

export interface HomepageDeploy {
  id: string;
  site_name: string;
  deploy_status: 'pending' | 'creating' | 'building' | 'ready' | 'error' | 'canceled';
  deploy_method: 'vercel' | 'github_pages';
  pages_url: string | null;
  pages_status: string | null;
  deployment_url: string | null;
  forked_repo_url: string | null;
  forked_repo_full_name: string | null;
  deploy_error_message: string | null;
  created_at: string;
  template_id: string;
  project_id: string | null;
  homepage_templates: {
    id: string;
    slug: string;
    name: string;
    name_ko: string;
    framework: string;
    preview_image_url: string | null;
  } | null;
}

// ---------- Types: File Editor ----------

export interface GitHubFileInfo {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  sha: string;
}

export interface GitHubFileDetail {
  name: string;
  path: string;
  sha: string;
  content: string;
  size: number;
}

// ---------- My Deployments ----------

export function useMyDeployments() {
  return useQuery({
    queryKey: queryKeys.oneclick.deployments,
    queryFn: async (): Promise<HomepageDeploy[]> => {
      const res = await fetch('/api/oneclick/deployments');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '배포 목록 조회 실패');
      }
      const data = await res.json();
      return data.deployments;
    },
  });
}

export function useDeleteDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deployId: string): Promise<void> => {
      const res = await fetch(`/api/oneclick/deployments/${deployId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '삭제 실패');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.oneclick.deployments });
    },
  });
}

// ---------- File Editor Hooks ----------

export function useDeployFiles(deployId: string | null) {
  return useQuery({
    queryKey: queryKeys.oneclick.files(deployId || ''),
    queryFn: async (): Promise<GitHubFileInfo[]> => {
      const res = await fetch(`/api/oneclick/deployments/${deployId}/files`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '파일 목록 조회 실패');
      }
      const data = await res.json();
      return data.files;
    },
    enabled: !!deployId,
  });
}

export function useFileContent(deployId: string | null, path: string | null) {
  return useQuery({
    queryKey: queryKeys.oneclick.fileContent(deployId || '', path || ''),
    queryFn: async (): Promise<GitHubFileDetail> => {
      const res = await fetch(
        `/api/oneclick/deployments/${deployId}/files?path=${encodeURIComponent(path!)}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '파일 내용 조회 실패');
      }
      return res.json();
    },
    enabled: !!deployId && !!path,
  });
}

export function useUpdateFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      deployId: string;
      path: string;
      content: string;
      sha?: string;
      message?: string;
    }): Promise<{ sha: string }> => {
      const body: Record<string, string> = {
        path: input.path,
        content: input.content,
      };
      if (input.sha) body.sha = input.sha;
      if (input.message) body.message = input.message;

      const res = await fetch(`/api/oneclick/deployments/${input.deployId}/files`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '파일 저장 실패');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oneclick.fileContent(variables.deployId, variables.path),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oneclick.files(variables.deployId),
      });
    },
  });
}

// ---------- Batch Apply Files ----------

export interface BatchFileInput {
  path: string;
  content: string;
  sha?: string;
}

export function useBatchApplyFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      deployId: string;
      files: BatchFileInput[];
    }): Promise<{ results: Array<{ path: string; sha: string }> }> => {
      const results: Array<{ path: string; sha: string }> = [];
      for (const file of input.files) {
        const body: Record<string, string> = {
          path: file.path,
          content: file.content,
        };
        if (file.sha) body.sha = file.sha;
        body.message = file.sha
          ? `Linkmap AI: ${file.path} 수정`
          : `Linkmap AI: ${file.path} 생성`;

        const res = await fetch(`/api/oneclick/deployments/${input.deployId}/files`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `${file.path} 저장 실패`);
        }
        const result = await res.json();
        results.push({ path: file.path, sha: result.sha });
      }
      return { results };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oneclick.files(variables.deployId),
      });
      for (const file of variables.files) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.oneclick.fileContent(variables.deployId, file.path),
        });
      }
    },
  });
}

// ---------- Status Polling ----------

export function useDeployStatus(deployId: string | null, enabled: boolean = true) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.oneclick.status(deployId || ''),
    queryFn: async (): Promise<DeployStatus> => {
      const res = await fetch(`/api/oneclick/status?deploy_id=${deployId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '상태 조회 실패');
      }
      return res.json();
    },
    enabled: !!deployId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      // Stop polling when deployment is in a terminal state
      if (['ready', 'error', 'canceled'].includes(data.deploy_status)) {
        // Invalidate projects list on success
        if (data.deploy_status === 'ready') {
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        }
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });
}

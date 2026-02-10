import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from './keys';
import type { EnvironmentVariable } from '@/types';

const supabase = createClient();

export function useEnvVars(projectId: string) {
  return useQuery({
    queryKey: queryKeys.envVars.byProject(projectId),
    queryFn: async (): Promise<EnvironmentVariable[]> => {
      const { data, error } = await supabase
        .from('environment_variables')
        .select('*')
        .eq('project_id', projectId)
        .order('key_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}

export function useAddEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      key_name: string;
      value: string;
      environment: string;
      is_secret: boolean;
      description?: string | null;
    }) => {
      const res = await fetch('/api/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, ...vars }),
      });
      if (!res.ok) throw new Error('환경변수 추가 실패');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envVars.byProject(projectId) });
    },
  });
}

export function useDecryptEnvVar() {
  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const res = await fetch('/api/env/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('복호화 실패');
      const data = await res.json();
      return data.value;
    },
  });
}

export function useUpdateEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      id: string;
      key_name?: string;
      value?: string;
      is_secret?: boolean;
      description?: string | null;
    }) => {
      const res = await fetch('/api/env', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      });
      if (!res.ok) throw new Error('환경변수 수정 실패');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envVars.byProject(projectId) });
    },
  });
}

export function useDeleteEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/env?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('환경변수 삭제 실패');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envVars.byProject(projectId) });
    },
  });
}

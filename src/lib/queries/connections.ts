import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import type { UserConnection, UserConnectionType } from '@/types';

export function useProjectConnections(projectId: string) {
  return useQuery({
    queryKey: queryKeys.connections.byProject(projectId),
    queryFn: async (): Promise<UserConnection[]> => {
      const res = await fetch(`/api/connections?project_id=${projectId}`);
      if (!res.ok) throw new Error('연결 목록을 불러올 수 없습니다');
      return res.json();
    },
    enabled: !!projectId,
  });
}

interface CreateConnectionParams {
  project_id: string;
  source_service_id: string;
  target_service_id: string;
  connection_type: UserConnectionType;
  label?: string | null;
}

export function useCreateConnection(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateConnectionParams): Promise<UserConnection> => {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '연결 생성에 실패했습니다');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.byProject(projectId) });
    },
  });
}

interface UpdateConnectionParams {
  id: string;
  connection_type?: UserConnectionType;
  label?: string | null;
}

export function useUpdateConnection(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateConnectionParams): Promise<UserConnection> => {
      const res = await fetch(`/api/connections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '연결 수정에 실패했습니다');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.byProject(projectId) });
    },
  });
}

export function useDeleteConnection(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string): Promise<void> => {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '연결 삭제에 실패했습니다');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.byProject(projectId) });
    },
  });
}

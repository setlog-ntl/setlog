import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import type { ServiceAccount } from '@/types';

export function useServiceAccounts(projectId: string) {
  return useQuery({
    queryKey: queryKeys.serviceAccounts.byProject(projectId),
    queryFn: async (): Promise<ServiceAccount[]> => {
      const res = await fetch(`/api/service-accounts?project_id=${projectId}`);
      if (!res.ok) {
        // 테이블 미존재 등 비정상 상태에서도 맵이 동작하도록 빈 배열 반환
        console.warn('service-accounts fetch failed:', res.status);
        return [];
      }
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 30_000,
    retry: false, // 테이블 미존재 시 불필요한 재시도 방지
  });
}

interface ConnectApiKeyParams {
  project_id: string;
  service_id: string;
  api_keys: Record<string, string>;
  api_key_label?: string;
}

export function useConnectServiceAccount(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ConnectApiKeyParams): Promise<ServiceAccount> => {
      const res = await fetch('/api/service-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'API Key 연결에 실패했습니다');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceAccounts.byProject(projectId) });
    },
  });
}

export function useDisconnectServiceAccount(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string): Promise<void> => {
      const res = await fetch(`/api/service-accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '연결 해제에 실패했습니다');
      }
    },
    onMutate: async (accountId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.serviceAccounts.byProject(projectId) });
      const previous = queryClient.getQueryData<ServiceAccount[]>(queryKeys.serviceAccounts.byProject(projectId));

      queryClient.setQueryData<ServiceAccount[]>(
        queryKeys.serviceAccounts.byProject(projectId),
        (old) => (old || []).filter((a) => a.id !== accountId),
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.serviceAccounts.byProject(projectId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceAccounts.byProject(projectId) });
    },
  });
}

interface VerifyResult {
  status: 'active' | 'error';
  error_message: string | null;
}

export function useVerifyServiceAccount(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceAccountId: string): Promise<VerifyResult> => {
      const res = await fetch('/api/service-accounts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_account_id: serviceAccountId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '검증에 실패했습니다');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceAccounts.byProject(projectId) });
    },
  });
}

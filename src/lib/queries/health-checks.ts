import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import type { HealthCheck } from '@/types';

export function useHealthChecks(projectServiceId: string) {
  return useQuery({
    queryKey: queryKeys.healthChecks.byProjectService(projectServiceId),
    queryFn: async (): Promise<HealthCheck[]> => {
      const res = await fetch(`/api/health-check?project_service_id=${projectServiceId}`);
      if (!res.ok) throw new Error('Health check 이력 조회 실패');
      return res.json();
    },
    enabled: !!projectServiceId,
  });
}

export function useRunHealthCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      project_service_id: string;
      environment?: string;
    }): Promise<HealthCheck> => {
      const res = await fetch('/api/health-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Health check 실행 실패');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.healthChecks.byProjectService(data.project_service_id),
      });
      // Also invalidate services since status may have changed
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

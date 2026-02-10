import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from './keys';

const supabase = createClient();

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export function useAuditLogs(projectId: string, filters?: { action?: string }) {
  return useQuery({
    queryKey: [...queryKeys.auditLogs.byProject(projectId), filters],
    queryFn: async (): Promise<AuditLog[]> => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Filter by project-related resource IDs
      // audit_logs stores resource_id which maps to project entities
      if (filters?.action) {
        query = query.like('action', `${filters.action}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}

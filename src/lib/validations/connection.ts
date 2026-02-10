import { z } from 'zod';

export const createConnectionSchema = z.object({
  project_id: z.string().uuid('유효하지 않은 프로젝트 ID'),
  source_service_id: z.string().uuid('유효하지 않은 소스 서비스 ID'),
  target_service_id: z.string().uuid('유효하지 않은 타겟 서비스 ID'),
  connection_type: z.enum(['uses', 'integrates', 'data_transfer'], {
    error: '연결 타입은 uses, integrates, data_transfer 중 하나여야 합니다',
  }),
  label: z.string().max(100).nullable().optional(),
}).refine((data) => data.source_service_id !== data.target_service_id, {
  message: '소스와 타겟 서비스가 같을 수 없습니다',
  path: ['target_service_id'],
});

export const updateConnectionSchema = z.object({
  connection_type: z.enum(['uses', 'integrates', 'data_transfer']).optional(),
  label: z.string().max(100).nullable().optional(),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;

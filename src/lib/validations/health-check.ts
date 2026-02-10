import { z } from 'zod';

export const runHealthCheckSchema = z.object({
  project_service_id: z.string().uuid('유효하지 않은 서비스 ID'),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
});

export type RunHealthCheckInput = z.infer<typeof runHealthCheckSchema>;

import { z } from 'zod';

const siteNameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export const forkRequestSchema = z.object({
  template_id: z.string().uuid('유효하지 않은 템플릿 ID'),
  site_name: z
    .string()
    .min(2, '사이트 이름은 최소 2자 이상이어야 합니다')
    .max(100, '사이트 이름은 100자 이하여야 합니다')
    .regex(siteNameRegex, '사이트 이름은 소문자, 숫자, 하이픈만 사용할 수 있습니다 (예: my-site-1)'),
  github_service_account_id: z.string().uuid().optional(),
});

export const deployRequestSchema = z.object({
  deploy_id: z.string().uuid('유효하지 않은 배포 ID'),
  vercel_token: z.string().min(1, 'Vercel 토큰은 필수입니다'),
  env_vars: z.record(z.string(), z.string()).optional(),
});

export const statusQuerySchema = z.object({
  deploy_id: z.string().uuid('유효하지 않은 배포 ID'),
});

export type ForkRequestInput = z.infer<typeof forkRequestSchema>;
export type DeployRequestInput = z.infer<typeof deployRequestSchema>;
export type StatusQueryInput = z.infer<typeof statusQuerySchema>;

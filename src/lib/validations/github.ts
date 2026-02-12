import { z } from 'zod';

export const linkRepoSchema = z.object({
  project_id: z.string().uuid('유효하지 않은 프로젝트 ID'),
  owner: z.string().min(1, '레포 owner는 필수입니다'),
  repo_name: z.string().min(1, '레포 이름은 필수입니다'),
  repo_full_name: z.string().min(1, '전체 레포 이름은 필수입니다'),
  default_branch: z.string().default('main'),
});

export const pushSecretsSchema = z.object({
  project_id: z.string().uuid('유효하지 않은 프로젝트 ID'),
  owner: z.string().min(1),
  repo_name: z.string().min(1),
  secrets: z.array(
    z.object({
      env_var_id: z.string().uuid(),
      secret_name: z.string().min(1),
    })
  ).min(1, '최소 1개의 시크릿이 필요합니다'),
});

export const syncConfigSchema = z.object({
  project_id: z.string().uuid('유효하지 않은 프로젝트 ID'),
  repo_full_name: z.string().min(1),
  auto_sync_enabled: z.boolean(),
  sync_environment: z.enum(['development', 'staging', 'production']).default('production'),
});

export type LinkRepoInput = z.infer<typeof linkRepoSchema>;
export type PushSecretsInput = z.infer<typeof pushSecretsSchema>;
export type SyncConfigInput = z.infer<typeof syncConfigSchema>;

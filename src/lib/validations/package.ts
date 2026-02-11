import { z } from 'zod';

// --- linkmap.json 내부 스키마 ---

const packageEnvVarSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[A-Z][A-Z0-9_]*$/, '변수 이름은 대문자, 숫자, 밑줄만 허용'),
  description: z.string().max(500),
  public: z.boolean(),
  default_value: z.string().max(1000).optional(),
  environment: z.array(z.enum(['development', 'staging', 'production'])).min(1),
});

const codeSnippetSchema = z.object({
  path: z.string().min(1).max(500),
  content: z.string().min(1).max(50000),
  strategy: z.enum(['create', 'merge', 'append']),
  description: z.string().max(500),
});

const packageServiceDefSchema = z.object({
  slug: z.string().min(1).max(100),
  required: z.boolean(),
  env_vars: z.array(packageEnvVarSchema).default([]),
  notes: z.string().max(1000).optional(),
});

export const linkmapConfigSchema = z.object({
  name: z
    .string()
    .min(2, '패키지 이름은 2자 이상')
    .max(50, '패키지 이름은 50자 이하')
    .regex(/^[a-z0-9][a-z0-9-]*$/, '소문자, 숫자, 하이픈만 허용'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, '유효한 semver 형식이어야 합니다 (예: 1.0.0)'),
  description: z.string().min(1).max(500),
  description_ko: z.string().max(500).optional(),
  author: z.string().max(100).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  tech_stack: z.record(z.string(), z.string()).optional(),
  services: z.array(packageServiceDefSchema).min(1, '최소 1개의 서비스가 필요합니다'),
  code_snippets: z.array(codeSnippetSchema).max(20).optional(),
});

// --- API 요청 스키마 ---

export const createPackageSchema = z.object({
  config: linkmapConfigSchema,
  is_public: z.boolean().default(true),
});

export const updatePackageSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  description_ko: z.string().max(500).optional(),
  is_public: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  tech_stack: z.record(z.string(), z.string()).optional(),
});

export const publishVersionSchema = z.object({
  config: linkmapConfigSchema,
  changelog: z.string().max(2000).optional(),
});

export const installPackageSchema = z.object({
  project_id: z.string().uuid('유효하지 않은 프로젝트 ID'),
  package_slug: z.string().min(1),
  version: z.string().optional(),
  include_snippets: z.boolean().default(true),
});

export const exportPackageSchema = z.object({
  project_id: z.string().uuid('유효하지 않은 프로젝트 ID'),
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-]*$/)
    .optional(),
  description: z.string().max(500).optional(),
});

export type LinkmapConfigInput = z.infer<typeof linkmapConfigSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PublishVersionInput = z.infer<typeof publishVersionSchema>;
export type InstallPackageInput = z.infer<typeof installPackageSchema>;
export type ExportPackageInput = z.infer<typeof exportPackageSchema>;

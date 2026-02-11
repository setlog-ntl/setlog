// ============================================
// Linkmap Package System Types
// ============================================

import type { Environment } from './index';

// --- linkmap.json 스키마 타입 ---

export interface LinkmapConfig {
  name: string;
  version: string;
  description: string;
  description_ko?: string;
  author?: string;
  tags?: string[];
  tech_stack?: Record<string, string>;
  services: PackageServiceDef[];
  code_snippets?: CodeSnippet[];
}

export interface PackageServiceDef {
  slug: string;
  required: boolean;
  env_vars: PackageEnvVar[];
  notes?: string;
}

export interface PackageEnvVar {
  key: string;
  description: string;
  public: boolean;
  default_value?: string;
  environment: Environment[];
}

export type SnippetStrategy = 'create' | 'merge' | 'append';

export interface CodeSnippet {
  path: string;
  content: string;
  strategy: SnippetStrategy;
  description: string;
}

// --- DB 모델 타입 ---

export interface Package {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  description_ko: string | null;
  author_id: string | null;
  is_public: boolean;
  tags: string[];
  tech_stack: Record<string, string>;
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface PackageVersion {
  id: string;
  package_id: string;
  version: string;
  config: LinkmapConfig;
  changelog: string | null;
  published_at: string;
}

export interface PackageInstallation {
  id: string;
  package_id: string | null;
  package_version_id: string | null;
  project_id: string;
  user_id: string;
  installed_at: string;
}

export interface PackageWithLatestVersion extends Package {
  latest_version?: PackageVersion;
}

export interface PackageDetail extends Package {
  versions: PackageVersion[];
  author?: { email: string; name: string | null } | null;
}

// --- 설치 결과 ---

export interface InstallResult {
  services_added: string[];
  services_skipped: string[];
  env_vars_created: string[];
  code_snippets: CodeSnippet[];
}

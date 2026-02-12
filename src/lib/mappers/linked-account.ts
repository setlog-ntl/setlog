import type {
  ServiceAccount,
  LinkedAccount,
  LinkedResource,
} from '@/types';

/**
 * project_github_repos 테이블 Row 형태
 *
 * - 클라이언트 타입(LinkedRepo)와는 별도로, 서버(API) 레이어에서
 *   LinkedResource 도메인으로 매핑할 때 사용할 수 있는 최소 필드 정의
 */
export interface ProjectGithubRepoRow {
  id: string;
  project_id: string;
  service_account_id: string;
  owner: string;
  repo_name: string;
  repo_full_name: string;
  default_branch: string;
  auto_sync_enabled: boolean;
  sync_environment: string;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * service_accounts → LinkedAccount 매퍼
 *
 * - OAuth 메타데이터에서 login/name/avatar/email 을 추출해 사람이 읽기 좋은 형태로 가공
 * - provider 정보는 서비스 slug 또는 OAuth 메타데이터에서 추출
 */
export function mapServiceAccountToLinkedAccount(
  account: ServiceAccount,
  options?: { serviceSlug?: string },
): LinkedAccount {
  const metadata = (account.oauth_metadata || {}) as Record<string, unknown>;

  const login = (metadata.login as string) || null;
  const name = (metadata.name as string) || null;
  const avatarUrl = (metadata.avatar_url as string) || null;
  const email = (metadata.email as string) || null;
  const providerFromMetadata = (metadata.provider as string) || null;

  return {
    id: account.id,
    project_id: account.project_id,
    service_id: account.service_id,
    user_id: account.user_id,
    provider: options?.serviceSlug ?? providerFromMetadata,
    external_user_id: account.oauth_provider_user_id,
    display_name: name || login,
    avatar_url: avatarUrl,
    email,
    connection_type: account.connection_type,
    status: account.status,
    last_verified_at: account.last_verified_at,
    error_message: account.error_message,
    created_at: account.created_at,
    updated_at: account.updated_at,
  };
}

/**
 * project_github_repos → LinkedResource 매퍼
 *
 * - GitHub 전용 리소스를 범용 LinkedResource 도메인으로 변환
 */
export function mapProjectGithubRepoToLinkedResource(
  row: ProjectGithubRepoRow,
): LinkedResource {
  return {
    id: row.id,
    project_id: row.project_id,
    service_account_id: row.service_account_id,
    resource_type: 'github_repo',
    external_id: row.repo_full_name,
    display_name: row.repo_full_name,
    metadata: {
      owner: row.owner,
      repo_name: row.repo_name,
      default_branch: row.default_branch,
      auto_sync_enabled: row.auto_sync_enabled,
      sync_environment: row.sync_environment,
      last_synced_at: row.last_synced_at,
    },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}


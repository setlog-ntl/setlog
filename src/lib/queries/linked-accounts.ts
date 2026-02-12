import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './keys';
import type { LinkedAccount, LinkedResource } from '@/types';

/**
 * ServiceAccount 응답 row를 LinkedAccount 도메인 타입으로 매핑하는 헬퍼
 */
function mapRowToLinkedAccount(row: any): LinkedAccount {
  const metadata = (row.oauth_metadata || {}) as Record<string, unknown>;
  const login = (metadata.login as string) || null;
  const name = (metadata.name as string) || null;
  const avatarUrl = (metadata.avatar_url as string) || null;
  const email = (metadata.email as string) || null;
  const providerFromMetadata = (metadata.provider as string) || null;

  return {
    id: row.id,
    project_id: row.project_id,
    service_id: row.service_id,
    user_id: row.user_id,
    provider: providerFromMetadata,
    external_user_id: (row.oauth_provider_user_id as string | null) ?? null,
    display_name: name || login,
    avatar_url: avatarUrl,
    email,
    connection_type: row.connection_type,
    status: row.status,
    last_verified_at: row.last_verified_at,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at,
  } satisfies LinkedAccount;
}

/**
 * 프로젝트 내 모든 LinkedAccount 조회
 *
 * - 현재는 /api/service-accounts 응답(ServiceAccount[])을 직접 사용하고 있으나,
 *   향후 /api/projects/[id]/linked-accounts 형태의 전용 엔드포인트로 교체 가능하도록
 *   도메인 타입(LinkedAccount)을 기준으로 훅을 정의해 둔다.
 */
export function useLinkedAccounts(projectId: string) {
  return useQuery({
    queryKey: queryKeys.linkedAccounts.byProject(projectId),
    queryFn: async (): Promise<LinkedAccount[]> => {
      const res = await fetch(`/api/service-accounts?project_id=${projectId}`);
      if (!res.ok) {
        console.warn('linked-accounts fetch failed:', res.status);
        return [];
      }

      const data = (await res.json()) as any[];
      return data.map(mapRowToLinkedAccount);
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * 특정 서비스(slug 기준)에 대한 LinkedAccount만 필터링
 *
 * - 현재는 service_slug 정보를 직접 갖고 있지 않으므로,
 *   우선은 전 계정을 클라이언트에서 필터링하거나,
 *   service_id와 slug 매핑이 필요한 경우 호출 측에서 후처리한다.
 * - GitHub의 경우, serviceSlug === 'github-actions'와 같이 사용.
 */
export function useLinkedAccountsByService(projectId: string, _serviceSlug: string) {
  // NOTE: 지금 단계에서는 serviceSlug를 쿼리 키에만 포함시켜 캐시 분리를 보장하고,
  // 실제 필터링은 호출하는 컴포넌트에서 수행한다.
  return useQuery({
    queryKey: queryKeys.linkedAccounts.byService(projectId, _serviceSlug),
    queryFn: async (): Promise<LinkedAccount[]> => {
      const res = await fetch(`/api/service-accounts?project_id=${projectId}`);
      if (!res.ok) {
        console.warn('linked-accounts-by-service fetch failed:', res.status);
        return [];
      }

      const data = (await res.json()) as any[];
      return data.map(mapRowToLinkedAccount);
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * LinkedResource 조회 훅
 *
 * - 현재는 GitHub 전용 project_github_repos API를 그대로 사용하고 있으므로,
 *   resource_type === 'github_repo' 에 한정된 형태로 동작한다.
 * - 향후 /api/projects/[id]/linked-resources?type=github_repo 등의
 *   전용 엔드포인트가 생기면 이 훅의 구현만 교체하면 된다.
 */
export function useLinkedResources(projectId: string, resourceType: string) {
  return useQuery({
    queryKey: queryKeys.linkedResources.byType(projectId, resourceType),
    queryFn: async (): Promise<LinkedResource[]> => {
      if (resourceType !== 'github_repo') {
        // 아직은 GitHub만 지원
        return [];
      }

      const res = await fetch(`/api/github/repos/link?project_id=${projectId}`);
      if (!res.ok) {
        console.warn('linked-resources fetch failed:', res.status);
        return [];
      }

      const data = (await res.json()) as { repos: any[] };
      return (data.repos || []).map((row) => {
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
        } satisfies LinkedResource;
      });
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}


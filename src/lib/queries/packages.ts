import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import type {
  Package,
  PackageDetail,
  PackageVersion,
  LinkmapConfig,
  InstallResult,
} from '@/types/package';

interface PackageListResponse {
  packages: Package[];
  total: number;
  page: number;
  limit: number;
}

interface PackagesFilter {
  q?: string;
  tag?: string;
  sort?: 'popular' | 'newest';
  page?: number;
  limit?: number;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- 패키지 목록 ---
export function usePackages(filters: PackagesFilter = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const queryString = params.toString();

  return useQuery({
    queryKey: [...queryKeys.packages.all, queryString],
    queryFn: () => fetchJson<PackageListResponse>(`/api/packages?${queryString}`),
    staleTime: 2 * 60 * 1000,
  });
}

// --- 패키지 상세 ---
export function usePackage(slug: string) {
  return useQuery({
    queryKey: queryKeys.packages.detail(slug),
    queryFn: () => fetchJson<PackageDetail>(`/api/packages/${slug}`),
    enabled: !!slug,
  });
}

// --- 내 패키지 ---
export function useMyPackages() {
  return useQuery({
    queryKey: queryKeys.packages.my,
    queryFn: () => fetchJson<PackageListResponse>('/api/packages?mine=true'),
    staleTime: 60 * 1000,
  });
}

// --- 패키지 버전 목록 ---
export function usePackageVersions(slug: string) {
  return useQuery({
    queryKey: queryKeys.packages.versions(slug),
    queryFn: () => fetchJson<PackageVersion[]>(`/api/packages/${slug}/versions`),
    enabled: !!slug,
  });
}

// --- 패키지 생성 ---
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { config: LinkmapConfig; is_public?: boolean }) =>
      fetchJson<{ package: Package; version: PackageVersion }>('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.my });
    },
  });
}

// --- 패키지 설치 ---
export function useInstallPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      project_id: string;
      package_slug: string;
      version?: string;
      include_snippets?: boolean;
    }) =>
      fetchJson<InstallResult>('/api/packages/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.services.byProject(variables.project_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.envVars.byProject(variables.project_id),
      });
    },
  });
}

// --- 패키지 발행 (새 버전) ---
export function usePublishVersion(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { config: LinkmapConfig; changelog?: string }) =>
      fetchJson<PackageVersion>(`/api/packages/${slug}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.detail(slug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.versions(slug) });
    },
  });
}

// --- 프로젝트 내보내기 ---
export function useExportPackage() {
  return useMutation({
    mutationFn: (data: { project_id: string; name?: string; description?: string }) =>
      fetchJson<LinkmapConfig>('/api/packages/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  });
}

// --- 패키지 삭제 ---
export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) =>
      fetchJson<{ success: boolean }>(`/api/packages/${slug}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.my });
    },
  });
}

// --- 패키지 수정 ---
export function useUpdatePackage(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string;
      description_ko?: string;
      is_public?: boolean;
      tags?: string[];
    }) =>
      fetchJson<Package>(`/api/packages/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.detail(slug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
    },
  });
}

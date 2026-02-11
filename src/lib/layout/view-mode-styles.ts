import type { ViewMode } from '@/stores/service-map-store';
import type { HealthCheckStatus, ServiceCategory } from '@/types';
import type { HealthCheck } from '@/types';

// ─── 비용 모드 ───

const costColorScale = [
  { max: 0, color: '#22c55e' },     // 무료 — green
  { max: 10, color: '#84cc16' },    // ~$10 — lime
  { max: 50, color: '#eab308' },    // ~$50 — yellow
  { max: 200, color: '#f97316' },   // ~$200 — orange
  { max: Infinity, color: '#ef4444' }, // $200+ — red
];

function parseCostEstimate(estimate?: string): number {
  if (!estimate) return 0;
  const match = estimate.match(/\$?([\d,.]+)/);
  if (!match) return 0;
  return parseFloat(match[1].replace(/,/g, ''));
}

export function getCostColor(costEstimate?: string): string {
  const cost = parseCostEstimate(costEstimate);
  for (const tier of costColorScale) {
    if (cost <= tier.max) return tier.color;
  }
  return '#ef4444';
}

export function getCostNodeSize(costEstimate?: string): number {
  const cost = parseCostEstimate(costEstimate);
  if (cost === 0) return 1;
  if (cost <= 10) return 1.05;
  if (cost <= 50) return 1.1;
  if (cost <= 200) return 1.15;
  return 1.2;
}

// ─── 상태 모드 ───

const healthStatusColors: Record<HealthCheckStatus, string> = {
  healthy: '#22c55e',
  degraded: '#eab308',
  unhealthy: '#ef4444',
  unknown: '#9ca3af',
};

export function getHealthColor(status?: HealthCheckStatus): string {
  return healthStatusColors[status || 'unknown'];
}

export function getHealthBorderClass(status?: HealthCheckStatus): string {
  switch (status) {
    case 'healthy': return 'border-green-500 dark:border-green-400';
    case 'degraded': return 'border-yellow-500 dark:border-yellow-400';
    case 'unhealthy': return 'border-red-500 dark:border-red-400 animate-pulse';
    default: return 'border-gray-300 dark:border-gray-600';
  }
}

// ─── 의존성 모드 ───

export function getDependencyEdgeStyle(isOnCriticalPath: boolean) {
  return {
    stroke: isOnCriticalPath ? 'var(--destructive)' : 'var(--muted-foreground)',
    strokeWidth: isOnCriticalPath ? 3 : 1.5,
    opacity: 1,
  };
}

// ─── 뷰 모드별 노드 오버레이 스타일 ───

export interface ViewModeNodeStyle {
  borderColor?: string;
  scale?: number;
  opacity?: number;
  badge?: string;
  glowColor?: string;
}

export function getViewModeNodeStyle(
  viewMode: ViewMode,
  opts: {
    category?: ServiceCategory;
    costEstimate?: string;
    healthStatus?: HealthCheckStatus;
    healthCheck?: HealthCheck;
  }
): ViewModeNodeStyle {
  switch (viewMode) {
    case 'cost':
      return {
        borderColor: getCostColor(opts.costEstimate),
        scale: getCostNodeSize(opts.costEstimate),
        badge: opts.costEstimate || '무료',
      };

    case 'health':
      return {
        borderColor: getHealthColor(opts.healthStatus),
        glowColor: opts.healthStatus === 'unhealthy' ? 'rgba(239,68,68,0.3)' : undefined,
        badge: opts.healthCheck?.response_time_ms
          ? `${opts.healthCheck.response_time_ms}ms`
          : undefined,
      };

    case 'dependency':
      return {
        opacity: 0.6,
      };

    default:
      return {};
  }
}

// ─── 뷰 모드별 엣지 표시 여부 ───

export function shouldShowEdgeInViewMode(
  viewMode: ViewMode,
  edgeType: string | undefined
): boolean {
  if (viewMode === 'dependency') {
    return edgeType === 'dependency' || edgeType === 'userConnection';
  }
  return true;
}

// ─── 의존성 체인 빌드 유틸리티 ───

export interface DependencyChain {
  type: 'fallback' | 'required';
  services: { serviceId: string; name: string; status: string; priority: number }[];
  label: string;
}

export function buildDependencyChains(
  dependencies: { service_id: string; depends_on_service_id: string; dependency_type: string }[],
  serviceNames: Record<string, string>,
  serviceStatuses: Record<string, string>
): DependencyChain[] {
  const chains: DependencyChain[] = [];

  // Group alternative dependencies into fallback chains
  const altGroups = new Map<string, string[]>();
  dependencies
    .filter((d) => d.dependency_type === 'alternative')
    .forEach((dep) => {
      const existing = altGroups.get(dep.service_id);
      if (existing) {
        existing.push(dep.depends_on_service_id);
      } else {
        altGroups.set(dep.service_id, [dep.depends_on_service_id]);
      }
    });

  altGroups.forEach((targets, sourceId) => {
    const allIds = [sourceId, ...targets];
    chains.push({
      type: 'fallback',
      services: allIds.map((id, i) => ({
        serviceId: id,
        name: serviceNames[id] || id,
        status: serviceStatuses[id] || 'not_started',
        priority: i + 1,
      })),
      label: allIds.map((id) => serviceNames[id] || id).join(' → '),
    });
  });

  // Group required dependencies into critical chains
  const reqGroups = new Map<string, string[]>();
  dependencies
    .filter((d) => d.dependency_type === 'required')
    .forEach((dep) => {
      const existing = reqGroups.get(dep.service_id);
      if (existing) {
        existing.push(dep.depends_on_service_id);
      } else {
        reqGroups.set(dep.service_id, [dep.depends_on_service_id]);
      }
    });

  reqGroups.forEach((targets, sourceId) => {
    targets.forEach((targetId) => {
      chains.push({
        type: 'required',
        services: [
          { serviceId: sourceId, name: serviceNames[sourceId] || sourceId, status: serviceStatuses[sourceId] || 'not_started', priority: 1 },
          { serviceId: targetId, name: serviceNames[targetId] || targetId, status: serviceStatuses[targetId] || 'not_started', priority: 2 },
        ],
        label: `${serviceNames[sourceId] || sourceId} → ${serviceNames[targetId] || targetId}`,
      });
    });
  });

  return chains;
}

'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ServiceIcon } from '@/components/landing/service-icon';
import { NodeTooltip } from '@/components/service-map/node-tooltip';
import { Badge } from '@/components/ui/badge';
import type { ServiceCategory, FreeTierQuality, HealthCheckStatus, HealthCheck } from '@/types';
import type { ViewMode } from '@/stores/service-map-store';
import { allCategoryLabels } from '@/lib/constants/service-filters';
import { getViewModeNodeStyle } from '@/lib/layout/view-mode-styles';

const categoryColors: Record<ServiceCategory, string> = {
  auth: 'bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800',
  social_login: 'bg-purple-50 border-purple-300 dark:bg-purple-950/50 dark:border-purple-700',
  database: 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800',
  deploy: 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800',
  email: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800',
  payment: 'bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:border-orange-800',
  storage: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/50 dark:border-cyan-800',
  monitoring: 'bg-pink-50 border-pink-200 dark:bg-pink-950/50 dark:border-pink-800',
  ai: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800',
  other: 'bg-gray-50 border-gray-200 dark:bg-gray-950/50 dark:border-gray-800',
  cdn: 'bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:border-teal-800',
  cicd: 'bg-slate-50 border-slate-200 dark:bg-slate-950/50 dark:border-slate-700',
  testing: 'bg-lime-50 border-lime-200 dark:bg-lime-950/50 dark:border-lime-800',
  sms: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
  push: 'bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800',
  chat: 'bg-violet-50 border-violet-200 dark:bg-violet-950/50 dark:border-violet-800',
  search: 'bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800',
  cms: 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-950/50 dark:border-fuchsia-800',
  analytics: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
  media: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800',
  queue: 'bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:border-orange-800',
  cache: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800',
  logging: 'bg-stone-50 border-stone-200 dark:bg-stone-950/50 dark:border-stone-700',
  feature_flags: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-700',
  scheduling: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800',
  ecommerce: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
  serverless: 'bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800',
  code_quality: 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800',
  automation: 'bg-violet-50 border-violet-200 dark:bg-violet-950/50 dark:border-violet-800',
};

const statusDots: Record<string, string> = {
  connected: 'bg-green-500',
  in_progress: 'bg-yellow-500',
  not_started: 'bg-gray-400 dark:bg-gray-500',
  error: 'bg-red-500',
};

const healthDots: Record<HealthCheckStatus, string> = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  unhealthy: 'bg-red-500 animate-pulse',
  unknown: 'bg-gray-400',
};

interface ServiceNodeData {
  label: string;
  category: ServiceCategory;
  status: string;
  costEstimate?: string;
  freeTierQuality?: FreeTierQuality;
  iconSlug?: string;
  highlighted?: boolean;
  selected?: boolean;
  focusOpacity?: number;
  // Phase 2A additions
  healthStatus?: HealthCheckStatus;
  healthCheck?: HealthCheck;
  envVarCount?: number;
  expanded?: boolean;
  viewMode?: ViewMode;
  connectionCount?: number;
  [key: string]: unknown;
}

function ServiceNode({ data }: NodeProps) {
  const d = data as unknown as ServiceNodeData;
  const category = d.category as ServiceCategory;
  const colorClass = categoryColors[category] || categoryColors.other;
  const dotClass = statusDots[d.status] || statusDots.not_started;
  const viewMode = d.viewMode || 'default';

  const isHighlighted = d.highlighted !== false;
  const focusOpacity = d.focusOpacity ?? 1;
  const isExpanded = d.expanded === true;

  // 뷰 모드별 오버레이 스타일
  const vmStyle = getViewModeNodeStyle(viewMode, {
    category,
    costEstimate: d.costEstimate,
    healthStatus: d.healthStatus,
    healthCheck: d.healthCheck,
  });

  const borderOverride = vmStyle.borderColor
    ? { borderColor: vmStyle.borderColor }
    : {};
  const scaleTransform = vmStyle.scale && vmStyle.scale !== 1
    ? `scale(${vmStyle.scale})`
    : undefined;
  const glowShadow = vmStyle.glowColor
    ? `0 0 12px ${vmStyle.glowColor}`
    : undefined;

  const nodeContent = (
    <div
      className={`
        px-3.5 py-2.5 rounded-xl border-2 shadow-sm min-w-[160px]
        transition-all duration-200
        ${colorClass}
        ${d.selected ? 'ring-2 ring-primary/40 shadow-md' : 'hover:shadow-md hover:scale-[1.02]'}
        ${isHighlighted ? '' : 'opacity-20'}
      `}
      style={{
        opacity: isHighlighted ? focusOpacity : 0.2,
        ...borderOverride,
        transform: scaleTransform,
        boxShadow: glowShadow,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 dark:!bg-gray-500 !w-2.5 !h-2.5 !border-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 dark:!bg-gray-500 !w-2.5 !h-2.5 !border-0"
      />

      {/* 헬스 상태 뱃지 (top-right) */}
      {d.healthStatus && d.healthStatus !== 'unknown' && (
        <span
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${healthDots[d.healthStatus]}`}
        />
      )}

      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {(d.status === 'connected' || d.status === 'error') && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                d.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
          )}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotClass}`} />
        </span>
        {d.iconSlug ? (
          <ServiceIcon serviceId={d.iconSlug} size={18} />
        ) : (
          <span className="text-base">⚙️</span>
        )}
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{d.label}</div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span>{allCategoryLabels[category] || category}</span>
            {d.costEstimate && (
              <>
                <span className="opacity-40">·</span>
                <span>{d.costEstimate}</span>
              </>
            )}
            {d.envVarCount != null && d.envVarCount > 0 && (
              <>
                <span className="opacity-40">·</span>
                <span>env {d.envVarCount}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 뷰 모드 뱃지 오버레이 */}
      {vmStyle.badge && viewMode !== 'default' && (
        <div className="mt-1.5">
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            {vmStyle.badge}
          </Badge>
        </div>
      )}

      {/* 확장 모드 상세 정보 */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-current/10 space-y-1 text-xs">
          {d.healthCheck && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">헬스</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${healthDots[d.healthCheck.status]}`} />
                {d.healthCheck.response_time_ms != null && `${d.healthCheck.response_time_ms}ms`}
              </span>
            </div>
          )}
          {d.envVarCount != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">환경변수</span>
              <span>{d.envVarCount}개</span>
            </div>
          )}
          {d.connectionCount != null && d.connectionCount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">연결</span>
              <span>{d.connectionCount}개</span>
            </div>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 dark:!bg-gray-500 !w-2.5 !h-2.5 !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400 dark:!bg-gray-500 !w-2.5 !h-2.5 !border-0"
      />
    </div>
  );

  return (
    <NodeTooltip
      label={d.label}
      category={category}
      status={d.status}
      costEstimate={d.costEstimate}
      healthCheck={d.healthCheck}
      envVarCount={d.envVarCount}
    >
      {nodeContent}
    </NodeTooltip>
  );
}

export default memo(ServiceNode);

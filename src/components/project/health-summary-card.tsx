'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Loader2 } from 'lucide-react';
import type { HealthCheckStatus } from '@/types';

interface HealthSummaryCardProps {
  serviceName: string;
  serviceCategory?: string;
  status: HealthCheckStatus | null;
  lastCheckedAt?: string | null;
  responseTimeMs?: number | null;
  message?: string | null;
  onRunCheck?: () => void;
  isRunning?: boolean;
}

const statusConfig: Record<HealthCheckStatus, { label: string; dotClass: string; badgeClass: string }> = {
  healthy: {
    label: '정상',
    dotClass: 'bg-green-500 animate-pulse',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  },
  degraded: {
    label: '저하',
    dotClass: 'bg-yellow-500 animate-pulse',
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  },
  unhealthy: {
    label: '오류',
    dotClass: 'bg-red-500 animate-pulse',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  },
  unknown: {
    label: '미확인',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  },
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function HealthSummaryCard({
  serviceName,
  serviceCategory,
  status,
  lastCheckedAt,
  responseTimeMs,
  message,
  onRunCheck,
  isRunning,
}: HealthSummaryCardProps) {
  const config = status ? statusConfig[status] : statusConfig.unknown;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dotClass}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{serviceName}</span>
            <Badge className={config.badgeClass}>{config.label}</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            {serviceCategory && <span>{serviceCategory}</span>}
            {lastCheckedAt && (
              <>
                <span className="opacity-40">·</span>
                <span>{formatRelativeTime(lastCheckedAt)}</span>
              </>
            )}
            {responseTimeMs != null && (
              <>
                <span className="opacity-40">·</span>
                <span>{responseTimeMs}ms</span>
              </>
            )}
          </div>
          {message && status !== 'healthy' && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{message}</p>
          )}
        </div>
      </div>
      {onRunCheck && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRunCheck}
          disabled={isRunning}
          className="shrink-0"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Activity className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}

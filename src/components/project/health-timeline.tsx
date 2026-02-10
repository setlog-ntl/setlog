'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import type { HealthCheck } from '@/types';

interface HealthTimelineProps {
  checks: HealthCheck[];
}

const statusConfig = {
  healthy: { icon: CheckCircle2, color: 'text-green-600', label: '정상' },
  unhealthy: { icon: XCircle, color: 'text-red-600', label: '오류' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-600', label: '저하' },
  unknown: { icon: HelpCircle, color: 'text-gray-500', label: '미확인' },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HealthTimeline({ checks }: HealthTimelineProps) {
  if (checks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        검증 이력이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {checks.map((check) => {
        const config = statusConfig[check.status] || statusConfig.unknown;
        const Icon = config.icon;

        return (
          <div key={check.id} className="flex items-start gap-3 py-2">
            <div className={`mt-0.5 ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {config.label}
                </Badge>
                {check.response_time_ms != null && (
                  <span className="text-xs text-muted-foreground">
                    {check.response_time_ms}ms
                  </span>
                )}
              </div>
              {check.message && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {check.message}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatTime(check.checked_at)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

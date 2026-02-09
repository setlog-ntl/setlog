'use client';

import { Badge } from '@/components/ui/badge';

export type ConnectionStatus = 'connected' | 'in_progress' | 'not_started';

const statusConfig: Record<ConnectionStatus, { dot: string; label: string; variant: string }> = {
  connected: { dot: 'bg-green-500', label: '연결됨', variant: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800' },
  in_progress: { dot: 'bg-yellow-500', label: '진행 중', variant: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800' },
  not_started: { dot: 'bg-gray-400', label: '대기', variant: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-700' },
};

interface StatusBadgeProps {
  status: ConnectionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-medium text-xs ${config.variant} ${className ?? ''}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}

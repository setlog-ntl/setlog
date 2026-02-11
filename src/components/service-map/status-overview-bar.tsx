'use client';

import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ProjectService, Service } from '@/types';

interface StatusOverviewBarProps {
  services: (ProjectService & { service?: Service })[];
  onServiceClick?: (projectServiceId: string) => void;
}

const statusColors: Record<string, { ping: string; dot: string }> = {
  connected: { ping: 'bg-green-400', dot: 'bg-green-500' },
  in_progress: { ping: 'bg-yellow-400', dot: 'bg-yellow-500' },
  not_started: { ping: '', dot: 'bg-gray-400 dark:bg-gray-500' },
  error: { ping: 'bg-red-400', dot: 'bg-red-500' },
};

export function StatusOverviewBar({ services, onServiceClick }: StatusOverviewBarProps) {
  const connectedCount = services.filter((s) => s.status === 'connected').length;
  const totalCount = services.length;

  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* 라벨 */}
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">서비스 상태</span>
            <span className="text-xs text-muted-foreground">
              {connectedCount}/{totalCount} 연결됨
            </span>
          </div>

          {/* 서비스 목록 */}
          <div className="flex flex-wrap gap-3">
            {services.map((service, i) => {
              const colors = statusColors[service.status] || statusColors.not_started;
              const hasPing = service.status === 'connected' || service.status === 'error';

              return (
                <motion.button
                  key={service.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  onClick={() => onServiceClick?.(service.id)}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    {hasPing && (
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colors.ping}`}
                      />
                    )}
                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${colors.dot}`}
                    />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {service.service?.name || 'Unknown'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

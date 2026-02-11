'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Zap, Link2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProjectService, Service, HealthCheck, UserConnection, ServiceCategory } from '@/types';
import { allCategoryLabels } from '@/lib/constants/service-filters';

interface HealthStatsPanelProps {
  services: (ProjectService & { service?: Service })[];
  healthChecks: Record<string, HealthCheck>;
  userConnections: UserConnection[];
}

const healthColors: Record<string, string> = {
  healthy: 'text-green-600 dark:text-green-400',
  degraded: 'text-yellow-600 dark:text-yellow-400',
  unhealthy: 'text-red-600 dark:text-red-400',
  unknown: 'text-gray-500',
};

const healthBg: Record<string, string> = {
  healthy: 'bg-green-50 dark:bg-green-950/30',
  degraded: 'bg-yellow-50 dark:bg-yellow-950/30',
  unhealthy: 'bg-red-50 dark:bg-red-950/30',
  unknown: 'bg-gray-50 dark:bg-gray-950/30',
};

export function HealthStatsPanel({
  services,
  healthChecks,
  userConnections,
}: HealthStatsPanelProps) {
  const stats = useMemo(() => {
    const checks = Object.values(healthChecks);
    const healthy = checks.filter((c) => c.status === 'healthy').length;
    const degraded = checks.filter((c) => c.status === 'degraded').length;
    const unhealthy = checks.filter((c) => c.status === 'unhealthy').length;
    const unknown = services.length - checks.length;
    const total = services.length;

    const responseTimes = checks
      .filter((c) => c.response_time_ms != null)
      .map((c) => c.response_time_ms!);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : null;
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : null;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : null;
    const healthyRate = total > 0 ? Math.round((healthy / total) * 100) : 0;

    const overallStatus = unhealthy > 0 ? 'unhealthy' : degraded > 0 ? 'degraded' : healthy > 0 ? 'healthy' : 'unknown';

    return { healthy, degraded, unhealthy, unknown, total, avgResponseTime, minResponseTime, maxResponseTime, healthyRate, overallStatus };
  }, [services, healthChecks]);

  // Connection counts by category
  const connectionsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    const serviceIdToCategory: Record<string, string> = {};
    services.forEach((ps) => {
      if (ps.service) serviceIdToCategory[ps.service_id] = ps.service.category;
    });

    userConnections.forEach((conn) => {
      const cat = serviceIdToCategory[conn.source_service_id] || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([category, count]) => ({ category, count, label: allCategoryLabels[category as ServiceCategory] || category }))
      .sort((a, b) => b.count - a.count);
  }, [services, userConnections]);

  const maxConnCount = connectionsByCategory.length > 0
    ? Math.max(...connectionsByCategory.map((c) => c.count))
    : 1;

  const OverallIcon = stats.overallStatus === 'healthy' ? CheckCircle2 :
    stats.overallStatus === 'degraded' ? AlertTriangle : XCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">헬스 통계</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Overall health card */}
        <Card className="overflow-hidden">
          <div
            className={`h-1 bg-gradient-to-r ${
              stats.overallStatus === 'healthy' ? 'from-green-400 to-green-600' :
              stats.overallStatus === 'degraded' ? 'from-yellow-400 to-yellow-600' :
              'from-red-400 to-red-600'
            }`}
          />
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <OverallIcon className={`h-5 w-5 ${healthColors[stats.overallStatus]}`} />
                <span className="text-sm font-medium">전체 서비스 상태</span>
              </div>
              <Badge
                variant={stats.overallStatus === 'healthy' ? 'default' : 'destructive'}
                className="text-[10px]"
              >
                {stats.overallStatus === 'healthy' ? '정상' :
                 stats.overallStatus === 'degraded' ? '저하' : '비정상'}
              </Badge>
            </div>

            {/* Health counts grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '정상', count: stats.healthy, bg: healthBg.healthy, color: healthColors.healthy },
                { label: '저하', count: stats.degraded, bg: healthBg.degraded, color: healthColors.degraded },
                { label: '비정상', count: stats.unhealthy, bg: healthBg.unhealthy, color: healthColors.unhealthy },
                { label: '미확인', count: stats.unknown, bg: healthBg.unknown, color: healthColors.unknown },
              ].map((item) => (
                <div key={item.label} className={`rounded-lg p-2.5 ${item.bg}`}>
                  <div className="text-[10px] text-muted-foreground">{item.label}</div>
                  <div className={`text-lg font-bold ${item.color}`}>{item.count}</div>
                </div>
              ))}
            </div>

            {/* Health progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">정상 서비스 비율</span>
                <span className="font-medium">{stats.healthyRate}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.healthyRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response time stats */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">응답 시간</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground">최소</div>
                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                  {stats.minResponseTime != null ? `${stats.minResponseTime}ms` : '-'}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground">평균</div>
                <div className="text-sm font-bold text-primary">
                  {stats.avgResponseTime != null ? `${stats.avgResponseTime}ms` : '-'}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground">최대</div>
                <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {stats.maxResponseTime != null ? `${stats.maxResponseTime}ms` : '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t">
              <span className="text-muted-foreground">성공률</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {stats.healthyRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Connection counts by category */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">카테고리별 연결</span>
            </div>

            {connectionsByCategory.length > 0 ? (
              <div className="flex items-end gap-1 h-24">
                {connectionsByCategory.slice(0, 8).map((item) => (
                  <div key={item.category} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-medium">{item.count}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.count / maxConnCount) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="w-full bg-gradient-to-t from-primary/80 to-primary/40 rounded-t min-h-[4px]"
                    />
                    <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-muted-foreground">
                연결 데이터 없음
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { ServiceIcon } from './service-icon';
import { MOCK_CONNECTIONS } from '@/data/mock-connections';

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {value}/{max}
      </span>
    </div>
  );
}

export function ConnectionDashboard() {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (prefersReducedMotion) {
            setVisibleCount(MOCK_CONNECTIONS.length);
          } else {
            MOCK_CONNECTIONS.forEach((_, i) => {
              setTimeout(() => setVisibleCount(i + 1), (i + 1) * 150);
            });
          }
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const statusCounts = {
    connected: MOCK_CONNECTIONS.filter((c) => c.status === 'connected').length,
    in_progress: MOCK_CONNECTIONS.filter((c) => c.status === 'in_progress').length,
    not_started: MOCK_CONNECTIONS.filter((c) => c.status === 'not_started').length,
  };

  return (
    <div ref={ref} className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          🔗 연결 상태 대시보드
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          프로젝트의 모든 서비스 연결을 한눈에 확인
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">서비스</th>
              <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">상태</th>
              <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">환경변수</th>
              <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">체크리스트</th>
              <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground hidden sm:table-cell">마지막 확인</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONNECTIONS.map((conn, i) => (
              <motion.tr
                key={conn.id}
                className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={i < visibleCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2 font-medium text-xs">
                    {conn.iconSlug ? (
                      <ServiceIcon serviceId={conn.iconSlug} size={18} />
                    ) : (
                      <span>{conn.emoji}</span>
                    )}
                    {conn.name}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={conn.status} />
                </td>
                <td className="px-4 py-2.5">
                  <ProgressBar
                    value={conn.envVars.configured}
                    max={conn.envVars.total}
                    color={conn.envVars.configured === conn.envVars.total ? 'bg-green-500' : 'bg-blue-500'}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <ProgressBar
                    value={conn.checklist.completed}
                    max={conn.checklist.total}
                    color={conn.checklist.completed === conn.checklist.total ? 'bg-green-500' : 'bg-blue-500'}
                  />
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                  {conn.lastChecked}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t bg-muted/30">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {statusCounts.connected} 연결됨
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            {statusCounts.in_progress} 진행 중
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            {statusCounts.not_started} 대기
          </span>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/signup">모든 연결 확인</Link>
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { ServiceBentoCard } from './service-bento-card';
import type { ProjectService, Service, ServiceDependency, HealthCheck } from '@/types';

interface ServiceBentoGridProps {
  services: (ProjectService & { service?: Service })[];
  healthChecks: Record<string, HealthCheck>;
  dependencies: ServiceDependency[];
  serviceNames: Record<string, string>;
  userConnections?: { source_service_id: string; target_service_id: string }[];
}

export function ServiceBentoGrid({
  services,
  healthChecks,
  dependencies,
  serviceNames,
  userConnections = [],
}: ServiceBentoGridProps) {
  // Calculate connection counts per service to determine card span
  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    userConnections.forEach((c) => {
      counts[c.source_service_id] = (counts[c.source_service_id] || 0) + 1;
      counts[c.target_service_id] = (counts[c.target_service_id] || 0) + 1;
    });
    return counts;
  }, [userConnections]);

  // Get dependencies for each service
  const serviceDeps = useMemo(() => {
    const map: Record<string, ServiceDependency[]> = {};
    dependencies.forEach((dep) => {
      if (!map[dep.service_id]) map[dep.service_id] = [];
      map[dep.service_id].push(dep);
    });
    return map;
  }, [dependencies]);

  if (services.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          서비스 카드 뷰
        </span>
        <span className="text-xs text-muted-foreground">
          {services.length}개 서비스
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((ps) => {
          const connCount = connectionCounts[ps.service_id] || 0;
          const isWide = connCount >= 3 || ps.status === 'connected';

          return (
            <ServiceBentoCard
              key={ps.id}
              projectService={ps}
              healthCheck={healthChecks[ps.id]}
              dependencies={serviceDeps[ps.service_id]}
              serviceNames={serviceNames}
              className={isWide ? 'md:col-span-2 lg:col-span-1' : ''}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

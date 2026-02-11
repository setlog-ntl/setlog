'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, GitBranch } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildDependencyChains, type DependencyChain } from '@/lib/layout/view-mode-styles';
import type { ProjectService, Service, ServiceDependency } from '@/types';

interface DependencyChainPanelProps {
  services: (ProjectService & { service?: Service })[];
  dependencies: ServiceDependency[];
  serviceNames: Record<string, string>;
}

const priorityLabels = ['1순위', '2순위', '3순위', '4순위', '5순위'];

const statusColors: Record<string, { ping: string; dot: string }> = {
  connected: { ping: 'bg-green-400', dot: 'bg-green-500' },
  in_progress: { ping: 'bg-yellow-400', dot: 'bg-yellow-500' },
  not_started: { ping: '', dot: 'bg-gray-400' },
  error: { ping: 'bg-red-400', dot: 'bg-red-500' },
};

function ChainCard({ chain }: { chain: DependencyChain }) {
  const isFallback = chain.type === 'fallback';

  return (
    <Card className="overflow-hidden">
      <div
        className={`h-1 bg-gradient-to-r ${
          isFallback ? 'from-amber-400 to-amber-600' : 'from-red-400 to-red-600'
        }`}
      />
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isFallback ? '폴백 체인' : '필수 의존성'}
            </span>
          </div>
          <Badge variant={isFallback ? 'secondary' : 'destructive'} className="text-[10px]">
            {isFallback ? '대체' : '필수'}
          </Badge>
        </div>

        {/* Chain visualization */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {chain.services.map((svc, i) => {
            const colors = statusColors[svc.status] || statusColors.not_started;
            const hasPing = svc.status === 'connected' || svc.status === 'error';

            return (
              <div key={svc.serviceId} className="flex items-center gap-2 flex-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 p-3 rounded-lg border bg-gradient-to-b ${
                    isFallback ? 'from-amber-500/5' : 'from-red-500/5'
                  } to-transparent`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {priorityLabels[svc.priority - 1] || `${svc.priority}순위`}
                    </Badge>
                    <span className="relative flex h-2 w-2">
                      {hasPing && (
                        <span
                          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colors.ping}`}
                        />
                      )}
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${colors.dot}`}
                      />
                    </span>
                  </div>
                  <div className="text-xs font-semibold">{svc.name}</div>
                </motion.div>

                {i < chain.services.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>

        {/* Chain code */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">순서: </span>
          <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
            {chain.label}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

export function DependencyChainPanel({
  services,
  dependencies,
  serviceNames,
}: DependencyChainPanelProps) {
  const serviceStatuses = useMemo(() => {
    const map: Record<string, string> = {};
    services.forEach((ps) => {
      if (ps.service) map[ps.service.id] = ps.status;
    });
    return map;
  }, [services]);

  const chains = useMemo(
    () => buildDependencyChains(dependencies, serviceNames, serviceStatuses),
    [dependencies, serviceNames, serviceStatuses]
  );

  if (chains.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <GitBranch className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">의존성 체인 없음</p>
        <p className="text-xs text-muted-foreground/60">서비스 간 의존성을 추가하면 여기에 표시됩니다</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          의존성 체인
        </span>
        <span className="text-xs text-muted-foreground">
          {chains.length}개 체인
        </span>
      </div>

      <div className="space-y-3">
        {chains.map((chain, i) => (
          <ChainCard key={i} chain={chain} />
        ))}
      </div>
    </motion.div>
  );
}

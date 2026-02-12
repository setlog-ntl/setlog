'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DifficultyBadge,
  FreeTierBadge,
  DxScoreBadge,
  CostEstimateBadge,
  VendorLockInBadge,
} from '@/components/service/service-badges';
import { HealthTimeline } from '@/components/project/health-timeline';
import { allCategoryLabels } from '@/lib/constants/service-filters';
import { domainLabels } from '@/lib/constants/service-filters';
import { useHealthChecks, useRunHealthCheck } from '@/lib/queries/health-checks';
import { ServiceAccountSection } from '@/components/service-map/service-account-section';
import { ServiceEnvVarsSection } from '@/components/service-map/service-env-vars-section';
import { ExternalLink, BookOpen, GitFork, Activity, Loader2, Settings } from 'lucide-react';
import type { ProjectService, Service, ServiceDependency, ServiceCategory, ServiceDomain, EnvironmentVariable } from '@/types';

interface ServiceDetailSheetProps {
  service: (ProjectService & { service: Service }) | null;
  dependencies: ServiceDependency[];
  serviceNames: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  envVars?: EnvironmentVariable[];
}

const statusLabels: Record<string, { label: string; className: string }> = {
  connected: { label: '연결됨', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  in_progress: { label: '진행 중', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
  not_started: { label: '시작 전', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  error: { label: '오류', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
};

const depTypeLabels: Record<string, string> = {
  required: '필수',
  recommended: '권장',
  optional: '선택',
  alternative: '대체',
};

export function ServiceDetailSheet({
  service,
  dependencies,
  serviceNames,
  open,
  onOpenChange,
  projectId,
  envVars = [],
}: ServiceDetailSheetProps) {
  const [showAccountSection, setShowAccountSection] = useState(false);
  const psId = service?.id || '';
  const { data: healthChecks = [] } = useHealthChecks(psId);
  const runHealthCheck = useRunHealthCheck();

  if (!service) return null;

  const svc = service.service;
  const status = statusLabels[service.status] || statusLabels.not_started;
  const category = svc?.category as ServiceCategory;
  const domain = svc?.domain as ServiceDomain | undefined;

  // Count configured env vars vs required
  const requiredEnvVars = svc?.required_env_vars || [];
  const recentChecks = healthChecks.slice(0, 5);

  const handleRunCheck = () => {
    runHealthCheck.mutate({ project_service_id: service.id });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto w-[380px] sm:max-w-[380px]">
        <SheetHeader>
          <SheetTitle className="text-lg">{svc?.name}</SheetTitle>
          <SheetDescription>
            {svc?.description_ko || svc?.description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          {/* Status & Category */}
          <div className="flex flex-wrap gap-2">
            <Badge className={status.className}>{status.label}</Badge>
            {category && (
              <Badge variant="outline">
                {allCategoryLabels[category] || category}
              </Badge>
            )}
            {domain && (
              <Badge variant="secondary">
                {domainLabels[domain]}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Health Check */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                연결 검증
              </h4>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunCheck}
                  disabled={runHealthCheck.isPending}
                >
                  {runHealthCheck.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    '검증 실행'
                  )}
                </Button>
                <Button
                  variant={showAccountSection ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowAccountSection((v) => !v)}
                >
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  설정
                </Button>
              </div>
            </div>

            {requiredEnvVars.length > 0 && (
              <p className="text-xs text-muted-foreground mb-2">
                필수 환경변수: {requiredEnvVars.length}개
              </p>
            )}

            {recentChecks.length > 0 ? (
              <HealthTimeline checks={recentChecks} />
            ) : (
              <p className="text-xs text-muted-foreground">검증 이력이 없습니다</p>
            )}
          </div>

          {/* Service Account Section (설정 버튼 클릭 시 토글) */}
          {showAccountSection && projectId && svc?.slug && (
            <>
              <Separator />
              <ServiceAccountSection
                projectId={projectId}
                serviceId={service.service_id}
                serviceSlug={svc.slug}
                serviceName={svc.name}
              />
            </>
          )}

          <Separator />

          {/* Environment Variables */}
          {projectId && (
            <ServiceEnvVarsSection
              projectId={projectId}
              serviceId={service.service_id}
              requiredEnvVars={requiredEnvVars}
              envVars={envVars.filter((ev) => ev.service_id === service.service_id)}
            />
          )}

          <Separator />

          {/* Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <DifficultyBadge level={svc?.difficulty_level} />
              <FreeTierBadge quality={svc?.free_tier_quality} />
              <VendorLockInBadge risk={svc?.vendor_lock_in_risk} />
            </div>
            <div className="flex items-center gap-3">
              <DxScoreBadge score={svc?.dx_score} />
              <CostEstimateBadge estimate={svc?.monthly_cost_estimate} />
            </div>
          </div>

          {/* Dependencies */}
          {dependencies.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <GitFork className="h-3.5 w-3.5" />
                  의존성
                </h4>
                <div className="space-y-1.5">
                  {dependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between text-sm rounded-md bg-muted/50 px-2.5 py-1.5"
                    >
                      <span>{serviceNames[dep.depends_on_service_id] || '알 수 없는 서비스'}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {depTypeLabels[dep.dependency_type] || dep.dependency_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Links */}
          <div className="flex gap-2">
            {svc?.website_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={svc.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  웹사이트
                </a>
              </Button>
            )}
            {svc?.docs_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={svc.docs_url} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  문서
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

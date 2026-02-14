'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjectServices, useAddProjectService, useRemoveProjectService } from '@/lib/queries/services';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { AddServiceDialog } from '@/components/service/add-service-dialog';
import { ServiceChecklist } from '@/components/service/service-checklist';
import { SetupWizard } from '@/components/service/setup-wizard';
import { Trash2, ExternalLink, Wand2 } from 'lucide-react';
import { ServiceIcon } from '@/components/landing/service-icon';
import { allCategoryLabels } from '@/lib/constants/service-filters';
import type { ServiceCategory, ProjectService, Service } from '@/types';

const statusLabels: Record<string, string> = {
  not_started: '시작 전',
  in_progress: '진행 중',
  connected: '연결됨',
  error: '오류',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  not_started: 'secondary',
  in_progress: 'outline',
  connected: 'default',
  error: 'destructive',
};

export default function ProjectServicesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: services = [], isLoading } = useProjectServices(projectId);
  const addService = useAddProjectService(projectId);
  const removeService = useRemoveProjectService(projectId);
  const [wizardTarget, setWizardTarget] = useState<(ProjectService & { service: Service }) | null>(null);

  const handleAddService = async (serviceId: string) => {
    await addService.mutateAsync(serviceId);
  };

  const handleRemoveService = async (projectServiceId: string) => {
    if (!confirm('이 서비스를 프로젝트에서 제거하시겠습니까?')) return;
    await removeService.mutateAsync(projectServiceId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">서비스 목록</h2>
        <AddServiceDialog
          projectId={projectId}
          existingServiceIds={services.map((s) => s.service_id)}
          onAdd={handleAddService}
        />
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">아직 추가된 서비스가 없습니다</p>
            <AddServiceDialog
              projectId={projectId}
              existingServiceIds={[]}
              onAdd={handleAddService}
            />
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {services.map((ps) => (
            <AccordionItem key={ps.id} value={ps.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ServiceIcon serviceId={ps.service?.slug || ''} size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ps.service?.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {allCategoryLabels[ps.service?.category as ServiceCategory]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {ps.service?.description_ko || ps.service?.description}
                    </p>
                  </div>
                  <Badge variant={statusVariants[ps.status]} className="ml-2 shrink-0">
                    {statusLabels[ps.status]}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4 pt-2">
                  <div className="flex gap-2 flex-wrap">
                    {ps.service && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setWizardTarget(ps)}
                      >
                        <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                        빠른 설정
                      </Button>
                    )}
                    {ps.service?.website_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={ps.service.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          웹사이트
                        </a>
                      </Button>
                    )}
                    {ps.service?.docs_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={ps.service.docs_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          문서
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive ml-auto"
                      onClick={() => handleRemoveService(ps.id)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      제거
                    </Button>
                  </div>

                  {ps.service?.required_env_vars && (ps.service.required_env_vars as { name: string; description_ko?: string; description?: string; public: boolean }[]).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">필요한 환경변수</h4>
                      <div className="space-y-1">
                        {(ps.service.required_env_vars as { name: string; description_ko?: string; description?: string; public: boolean }[]).map((env) => (
                          <div key={env.name} className="flex items-center gap-2 text-xs">
                            <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                              {env.name}
                            </code>
                            <Badge variant={env.public ? 'secondary' : 'destructive'} className="text-[10px]">
                              {env.public ? '공개' : '비밀'}
                            </Badge>
                            <span className="text-muted-foreground">
                              {env.description_ko || env.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">연결 체크리스트</h4>
                    <ServiceChecklist
                      projectServiceId={ps.id}
                      serviceId={ps.service_id}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Setup Wizard */}
      {wizardTarget?.service && (
        <SetupWizard
          key={wizardTarget.id}
          open={!!wizardTarget}
          onOpenChange={(open) => { if (!open) setWizardTarget(null); }}
          service={wizardTarget.service}
          projectService={wizardTarget}
          projectId={projectId}
        />
      )}
    </div>
  );
}

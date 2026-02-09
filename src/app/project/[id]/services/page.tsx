'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AddServiceDialog } from '@/components/service/add-service-dialog';
import { ServiceChecklist } from '@/components/service/service-checklist';
import { Trash2, ExternalLink } from 'lucide-react';
import type { ProjectService, Service, ServiceCategory } from '@/types';

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

const categoryLabels: Partial<Record<ServiceCategory, string>> = {
  auth: '인증',
  database: '데이터베이스',
  deploy: '배포',
  email: '이메일',
  payment: '결제',
  storage: '스토리지',
  monitoring: '모니터링',
  ai: 'AI',
  other: '기타',
};

export default function ProjectServicesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();
  const [services, setServices] = useState<(ProjectService & { service: Service })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    const { data } = await supabase
      .from('project_services')
      .select('*, service:services(*)')
      .eq('project_id', projectId)
      .order('created_at');
    setServices((data as (ProjectService & { service: Service })[]) || []);
    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleAddService = async (serviceId: string) => {
    await supabase.from('project_services').insert({
      project_id: projectId,
      service_id: serviceId,
      status: 'not_started',
    });
    await fetchServices();
  };

  const handleRemoveService = async (projectServiceId: string) => {
    if (!confirm('이 서비스를 프로젝트에서 제거하시겠습니까?')) return;
    await supabase.from('project_services').delete().eq('id', projectServiceId);
    await fetchServices();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
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
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                    {ps.service?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ps.service?.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[ps.service?.category as ServiceCategory]}
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
                  <div className="flex gap-2">
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

                  {/* Required Env Vars */}
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

                  {/* Checklist */}
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
    </div>
  );
}

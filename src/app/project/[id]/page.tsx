'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Map, List, Key, ArrowRight } from 'lucide-react';
import type { ProjectService, Service } from '@/types';

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();
  const [services, setServices] = useState<(ProjectService & { service: Service })[]>([]);
  const [envCount, setEnvCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: svcData }, { count }] = await Promise.all([
        supabase
          .from('project_services')
          .select('*, service:services(*)')
          .eq('project_id', projectId),
        supabase
          .from('environment_variables')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId),
      ]);
      setServices((svcData as (ProjectService & { service: Service })[]) || []);
      setEnvCount(count || 0);
      setLoading(false);
    };
    fetchData();
  }, [projectId, supabase]);

  const connectedCount = services.filter((s) => s.status === 'connected').length;
  const progressPercent = services.length > 0
    ? Math.round((connectedCount / services.length) * 100)
    : 0;

  const statusLabels: Record<string, string> = {
    not_started: '시작 전',
    in_progress: '진행 중',
    connected: '연결됨',
    error: '오류',
  };

  const statusColors: Record<string, string> = {
    not_started: 'secondary',
    in_progress: 'default',
    connected: 'default',
    error: 'destructive',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">연결된 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{connectedCount}/{services.length}</div>
            {services.length > 0 && (
              <Progress value={progressPercent} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">환경변수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{envCount}</div>
            <p className="text-xs text-muted-foreground mt-1">개의 변수가 저장됨</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">진행률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progressPercent}%</div>
            <p className="text-xs text-muted-foreground mt-1">서비스 연결 완료</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
          <Link href={`/project/${projectId}/service-map`}>
            <Map className="h-5 w-5 mb-2" />
            <span className="font-medium">서비스 맵 보기</span>
            <span className="text-xs text-muted-foreground">아키텍처 시각화</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
          <Link href={`/project/${projectId}/services`}>
            <List className="h-5 w-5 mb-2" />
            <span className="font-medium">서비스 관리</span>
            <span className="text-xs text-muted-foreground">서비스 추가/연결</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
          <Link href={`/project/${projectId}/env`}>
            <Key className="h-5 w-5 mb-2" />
            <span className="font-medium">환경변수 관리</span>
            <span className="text-xs text-muted-foreground">.env 다운로드</span>
          </Link>
        </Button>
      </div>

      {/* Services Summary */}
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>연결된 서비스</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/project/${projectId}/services`}>
                  모두 보기
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((ps) => (
                <div key={ps.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-medium">
                      {ps.service?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ps.service?.name}</p>
                      <p className="text-xs text-muted-foreground">{ps.service?.category}</p>
                    </div>
                  </div>
                  <Badge variant={statusColors[ps.status] as 'default' | 'secondary' | 'destructive'}>
                    {statusLabels[ps.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuditLogs } from '@/lib/queries/audit-logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Key,
  FolderPlus,
  Pencil,
  Trash2,
  Eye,
  Link2,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
} from 'lucide-react';

const actionConfig: Record<string, { label: string; icon: typeof Key; color: string }> = {
  'env_var.create': { label: '환경변수 생성', icon: FolderPlus, color: 'text-green-600' },
  'env_var.update': { label: '환경변수 수정', icon: Pencil, color: 'text-blue-600' },
  'env_var.delete': { label: '환경변수 삭제', icon: Trash2, color: 'text-red-600' },
  'env_var.decrypt': { label: '환경변수 복호화', icon: Eye, color: 'text-amber-600' },
  'project.create': { label: '프로젝트 생성', icon: FolderPlus, color: 'text-green-600' },
  'project.update': { label: '프로젝트 수정', icon: Pencil, color: 'text-blue-600' },
  'project.delete': { label: '프로젝트 삭제', icon: Trash2, color: 'text-red-600' },
  'connection.create': { label: '연결 생성', icon: Link2, color: 'text-green-600' },
  'connection.update': { label: '연결 수정', icon: Pencil, color: 'text-blue-600' },
  'connection.delete': { label: '연결 삭제', icon: Trash2, color: 'text-red-600' },
  'service.health_check': { label: '서비스 검증', icon: Key, color: 'text-purple-600' },
};

const actionFilters = [
  { value: 'all', label: '전체' },
  { value: 'env_var', label: '환경변수' },
  { value: 'project', label: '프로젝트' },
  { value: 'connection', label: '연결' },
];

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProjectAuditPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [actionFilter, setActionFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filterParam = actionFilter === 'all' ? undefined : actionFilter;
  const { data: logs = [], isLoading } = useAuditLogs(projectId, { action: filterParam });

  const filteredLogs = useMemo(() => {
    if (actionFilter === 'all') return logs;
    return logs.filter((log) => log.action.startsWith(actionFilter));
  }, [logs, actionFilter]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">감사 로그</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actionFilters.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">감사 로그가 없습니다</p>
            <p className="text-xs text-muted-foreground mt-1">
              환경변수 조회·수정, 프로젝트 변경 등의 활동이 기록됩니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              최근 활동 ({filteredLogs.length}건)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredLogs.map((log) => {
                const config = actionConfig[log.action] || {
                  label: log.action,
                  icon: Key,
                  color: 'text-muted-foreground',
                };
                const Icon = config.icon;
                const isExpanded = expandedIds.has(log.id);
                const hasDetails = log.details && Object.keys(log.details).length > 0;

                return (
                  <div key={log.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{config.label}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {log.resource_type}
                          </Badge>
                        </div>
                        {log.resource_id && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                            {log.resource_id}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(log.created_at)}
                        </span>
                        {hasDetails && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleExpanded(log.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {isExpanded && hasDetails && (
                      <div className="mt-2 ml-7">
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

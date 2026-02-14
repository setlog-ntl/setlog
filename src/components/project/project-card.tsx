'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, FolderOpen, Layers, Zap, AlertCircle } from 'lucide-react';
import type { ProjectWithServices } from '@/types';

interface ProjectCardProps {
  project: ProjectWithServices;
  onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-yellow-500',
  connected: 'bg-green-500',
  error: 'bg-red-500',
};

const categoryColors: Record<string, string> = {
  auth: '#6366f1',
  social_login: '#8b5cf6',
  database: '#3b82f6',
  deploy: '#22c55e',
  email: '#f59e0b',
  payment: '#ef4444',
  storage: '#06b6d4',
  monitoring: '#f97316',
  ai: '#a855f7',
  analytics: '#ec4899',
  other: '#6b7280',
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const services = project.project_services || [];
  const connectedCount = services.filter((s) => s.status === 'connected').length;
  const errorCount = services.filter((s) => s.status === 'error').length;
  const totalCount = services.length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 드롭다운 메뉴 클릭 시 네비게이션 방지
    const target = e.target as HTMLElement;
    if (target.closest('[data-radix-dropdown-menu-trigger]') || target.closest('[role="menu"]')) {
      return;
    }
    router.push(`/project/${project.id}`);
  };

  return (
    <Card
      className="group hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
      onClick={handleCardClick}
    >
      {/* 미니 서비스 맵 프리뷰 */}
      <div className="relative h-28 sm:h-32 bg-muted/30 border-b overflow-hidden rounded-t-lg">
        {totalCount > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {/* 중앙 프로젝트 노드 */}
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border-2 border-primary/30 flex items-center justify-center z-10 relative">
                <Layers className="h-4 w-4 text-primary" />
              </div>

              {/* 연결된 서비스 노드들 */}
              {services.slice(0, 8).map((ps, i) => {
                const total = Math.min(services.length, 8);
                const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
                const radius = total <= 4 ? 44 : 52;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const color = categoryColors[ps.service?.category || 'other'] || '#6b7280';

                return (
                  <div key={ps.id}>
                    {/* 연결선 */}
                    <svg
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      width={radius * 2 + 40}
                      height={radius * 2 + 40}
                      style={{ zIndex: 0 }}
                    >
                      <line
                        x1={radius + 20}
                        y1={radius + 20}
                        x2={radius + 20 + x}
                        y2={radius + 20 + y}
                        stroke={ps.status === 'connected' ? color : '#d1d5db'}
                        strokeWidth={1.5}
                        strokeDasharray={ps.status === 'connected' ? 'none' : '4 3'}
                        opacity={0.5}
                      />
                    </svg>
                    {/* 서비스 노드 */}
                    <div
                      className="absolute w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium border shadow-sm"
                      style={{
                        top: `calc(50% + ${y}px - 14px)`,
                        left: `calc(50% + ${x}px - 14px)`,
                        backgroundColor: ps.status === 'connected' ? `${color}15` : '#f9fafb',
                        borderColor: ps.status === 'connected' ? `${color}40` : '#e5e7eb',
                        color: ps.status === 'connected' ? color : '#9ca3af',
                        zIndex: 5,
                      }}
                    >
                      {ps.service?.name?.charAt(0) || '?'}
                    </div>
                  </div>
                );
              })}

              {services.length > 8 && (
                <div
                  className="absolute text-[10px] text-muted-foreground font-medium bg-background rounded-full px-1.5 py-0.5 border"
                  style={{
                    bottom: '-28px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 5,
                  }}
                >
                  +{services.length - 8}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Layers className="h-8 w-8 text-muted-foreground/20 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground/50">서비스를 추가하세요</p>
            </div>
          </div>
        )}

        {/* 우상단: 상태 요약 뱃지 */}
        {totalCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {connectedCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                <Zap className="h-2.5 w-2.5" />
                {connectedCount}
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] bg-red-500/10 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                <AlertCircle className="h-2.5 w-2.5" />
                {errorCount}
              </span>
            )}
          </div>
        )}
      </div>

      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-1 text-xs">
                {project.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild data-radix-dropdown-menu-trigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/project/${project.id}`}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  프로젝트 열기
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <div className="flex items-center justify-between">
          {totalCount > 0 ? (
            <>
              {/* 서비스 상태 바 */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex gap-0.5 h-1.5 flex-1 max-w-[120px] rounded-full overflow-hidden bg-muted">
                  {connectedCount > 0 && (
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(connectedCount / totalCount) * 100}%` }}
                    />
                  )}
                  {errorCount > 0 && (
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(errorCount / totalCount) * 100}%` }}
                    />
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {connectedCount}/{totalCount}
                </span>
              </div>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground">서비스 없음</span>
          )}
          <span className="text-[10px] text-muted-foreground/60 ml-2 whitespace-nowrap">
            {formatDate(project.updated_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

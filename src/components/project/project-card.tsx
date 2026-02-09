'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, ExternalLink, FolderOpen } from 'lucide-react';
import type { ProjectWithServices } from '@/types';

interface ProjectCardProps {
  project: ProjectWithServices;
  onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  connected: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  not_started: '시작 전',
  in_progress: '진행 중',
  connected: '연결됨',
  error: '오류',
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const services = project.project_services || [];
  const connectedCount = services.filter((s) => s.status === 'connected').length;
  const totalCount = services.length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              <Link href={`/project/${project.id}`} className="hover:text-primary transition-colors">
                {project.name}
              </Link>
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
                onClick={() => onDelete(project.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {totalCount > 0 ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {services.slice(0, 5).map((ps) => (
                  <Badge
                    key={ps.id}
                    variant="secondary"
                    className={`text-xs ${statusColors[ps.status] || ''}`}
                  >
                    {ps.service?.name || '서비스'}
                  </Badge>
                ))}
                {services.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{services.length - 5}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {connectedCount}/{totalCount} 서비스 연결됨
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">서비스가 아직 추가되지 않았습니다</p>
          )}
          <p className="text-xs text-muted-foreground">
            마지막 수정: {formatDate(project.updated_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useInstallPackage } from '@/lib/queries/packages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PackageServiceDef } from '@/types/package';

interface InstallPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageSlug: string;
  packageName: string;
  services: PackageServiceDef[];
  projectOptions: { id: string; name: string }[];
}

export function InstallPackageDialog({
  open,
  onOpenChange,
  packageSlug,
  packageName,
  services,
  projectOptions,
}: InstallPackageDialogProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const installMutation = useInstallPackage();

  const handleInstall = async () => {
    if (!selectedProject) {
      toast.error('프로젝트를 선택해주세요');
      return;
    }

    try {
      const result = await installMutation.mutateAsync({
        project_id: selectedProject,
        package_slug: packageSlug,
      });

      toast.success(
        `${result.services_added.length}개 서비스가 추가되었습니다`,
        {
          description: result.services_skipped.length > 0
            ? `${result.services_skipped.length}개 서비스는 이미 연결되어 스킵됨`
            : undefined,
        }
      );

      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '설치 중 오류가 발생했습니다');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>패키지 적용</DialogTitle>
          <DialogDescription>
            <strong>{packageName}</strong> 패키지를 프로젝트에 적용합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 프로젝트 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">프로젝트 선택</label>
            {projectOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                프로젝트가 없습니다. 먼저 프로젝트를 생성해주세요.
              </p>
            ) : (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="프로젝트를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 포함 서비스 목록 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">적용될 서비스</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {services.map((svc) => (
                <div
                  key={svc.slug}
                  className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span>{svc.slug}</span>
                  </div>
                  <Badge variant={svc.required ? 'default' : 'outline'} className="text-xs">
                    {svc.required ? '필수' : '선택'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* 안내 */}
          <div className="flex gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              이미 프로젝트에 연결된 서비스는 자동으로 스킵됩니다.
              환경변수는 빈 값으로 생성되며 직접 입력해야 합니다.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={handleInstall}
            disabled={!selectedProject || installMutation.isPending || projectOptions.length === 0}
          >
            {installMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                적용 중...
              </>
            ) : (
              '적용하기'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { useExportPackage, useCreatePackage } from '@/lib/queries/packages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function CreatePackageDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: CreatePackageDialogProps) {
  const [name, setName] = useState(
    projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  );
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');

  const exportMutation = useExportPackage();
  const createMutation = useCreatePackage();

  const handleExportJson = async () => {
    try {
      const config = await exportMutation.mutateAsync({
        project_id: projectId,
        name: name || undefined,
        description: description || undefined,
      });

      // linkmap.json 다운로드
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'linkmap.json';
      a.click();
      URL.revokeObjectURL(url);

      toast.success('linkmap.json 파일이 다운로드되었습니다');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '내보내기 중 오류가 발생했습니다');
    }
  };

  const handlePublish = async () => {
    try {
      const config = await exportMutation.mutateAsync({
        project_id: projectId,
        name: name || undefined,
        description: description || undefined,
      });

      // 태그 파싱
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      if (parsedTags.length > 0) {
        config.tags = parsedTags;
      }

      await createMutation.mutateAsync({
        config,
        is_public: isPublic,
      });

      toast.success('패키지가 레지스트리에 발행되었습니다');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '발행 중 오류가 발생했습니다');
    }
  };

  const isPending = exportMutation.isPending || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>패키지로 내보내기</DialogTitle>
          <DialogDescription>
            <strong>{projectName}</strong> 프로젝트의 서비스 구성을 패키지로 내보냅니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">패키지 이름</Label>
            <Input
              id="pkg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-saas-starter"
              pattern="^[a-z0-9][a-z0-9-]*$"
            />
            <p className="text-xs text-muted-foreground">소문자, 숫자, 하이픈만 사용</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-desc">설명</Label>
            <Textarea
              id="pkg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 패키지에 대한 설명을 입력하세요"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-tags">태그 (쉼표로 구분)</Label>
            <Input
              id="pkg-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="saas, nextjs, fullstack"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>공개 패키지</Label>
              <p className="text-xs text-muted-foreground">다른 사용자가 검색하고 설치할 수 있습니다</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportJson} disabled={isPending}>
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            JSON 다운로드
          </Button>
          <Button onClick={handlePublish} disabled={isPending || !name}>
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            레지스트리에 발행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Layers, Check } from 'lucide-react';
import type { ProjectTemplate } from '@/types';

interface TemplateDialogProps {
  onSubmit: (name: string, templateId: string) => Promise<void>;
}

export function TemplateDialog({ onSubmit }: TemplateDialogProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      supabase
        .from('project_templates')
        .select('*')
        .order('downloads_count', { ascending: false })
        .then(({ data }) => {
          if (data) setTemplates(data);
        });
    }
  }, [open, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedTemplate) return;

    setLoading(true);
    try {
      await onSubmit(projectName.trim(), selectedTemplate);
      setOpen(false);
      setProjectName('');
      setSelectedTemplate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Layers className="mr-2 h-4 w-4" />
          템플릿에서 시작
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>템플릿에서 프로젝트 시작</DialogTitle>
          <DialogDescription>
            미리 구성된 템플릿으로 빠르게 시작하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-project-name">프로젝트 이름</Label>
            <Input
              id="template-project-name"
              placeholder="내 프로젝트"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>템플릿 선택</Label>
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {template.name_ko || template.name}
                      </CardTitle>
                      {selectedTemplate === template.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {template.description_ko || template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {(template.services as string[]).map((slug: string) => (
                        <Badge key={slug} variant="secondary" className="text-xs">
                          {slug}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={loading || !projectName.trim() || !selectedTemplate}>
              {loading ? '생성 중...' : '프로젝트 생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

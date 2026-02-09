'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Save, Trash2 } from 'lucide-react';
import type { Project } from '@/types';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProject(data);
          setName(data.name);
          setDescription(data.description || '');
        }
        setLoading(false);
      });
  }, [projectId, supabase]);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from('projects')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('프로젝트를 삭제하시겠습니까?\n모든 서비스 연결과 환경변수가 삭제됩니다.')) return;
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    await supabase.from('projects').delete().eq('id', projectId);
    router.push('/dashboard');
  };

  if (loading) {
    return <div className="h-64 rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 정보</CardTitle>
          <CardDescription>프로젝트의 기본 정보를 수정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">프로젝트 이름</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">설명</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">위험 구역</CardTitle>
          <CardDescription>
            프로젝트를 삭제하면 모든 서비스 연결, 체크리스트 진행도, 환경변수가 영구적으로 삭제됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            프로젝트 삭제
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

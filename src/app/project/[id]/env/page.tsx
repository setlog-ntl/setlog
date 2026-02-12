'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/keys';
import { useParams } from 'next/navigation';
import { useEnvVars, useAddEnvVar, useDeleteEnvVar, useDecryptEnvVar, useUpdateEnvVar } from '@/lib/queries/env-vars';
import { useProjectServices } from '@/lib/queries/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Plus, Trash2, Eye, EyeOff, Pencil, GitBranch } from 'lucide-react';
import { EnvImportDialog } from '@/components/service/env-import-dialog';
import { SecretsSyncPanel } from '@/components/github/secrets-sync-panel';
import { useLinkedRepos } from '@/lib/queries/github';
import type { Environment, EnvironmentVariable } from '@/types';

const envLabels: Record<Environment, string> = {
  development: '개발',
  staging: '스테이징',
  production: '프로덕션',
};

export default function ProjectEnvPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const { data: envVars = [], isLoading } = useEnvVars(projectId);
  const { data: projectServices = [] } = useProjectServices(projectId);
  const addEnvVar = useAddEnvVar(projectId);
  const deleteEnvVar = useDeleteEnvVar(projectId);
  const decryptEnvVar = useDecryptEnvVar();
  const updateEnvVar = useUpdateEnvVar(projectId);

  const { data: linkedRepos = [] } = useLinkedRepos(projectId);
  const [showGitHubSync, setShowGitHubSync] = useState(false);
  const [activeEnv, setActiveEnv] = useState<Environment>('development');
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EnvironmentVariable | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsSecret, setNewIsSecret] = useState(true);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIsSecret, setEditIsSecret] = useState(true);

  const filteredVars = envVars.filter((v) => v.environment === activeEnv);

  // Build service_id → service name map
  const serviceNameMap = new Map<string, string>();
  for (const ps of projectServices) {
    if (ps.service) {
      serviceNameMap.set(ps.service_id, ps.service.name);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    await addEnvVar.mutateAsync({
      key_name: newKey.trim(),
      value: newValue,
      environment: activeEnv,
      is_secret: newIsSecret,
      description: newDesc.trim() || null,
    });

    setAddOpen(false);
    setNewKey('');
    setNewValue('');
    setNewDesc('');
    setNewIsSecret(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 환경변수를 삭제하시겠습니까?')) return;
    await deleteEnvVar.mutateAsync(id);
  };

  const handleDownload = () => {
    window.open(`/api/env/download?project_id=${projectId}&environment=${activeEnv}`, '_blank');
  };

  const toggleShowValue = useCallback(async (id: string) => {
    const isCurrentlyShowing = showValues[id];
    if (isCurrentlyShowing) {
      setShowValues((prev) => ({ ...prev, [id]: false }));
      setDecryptedValues((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    // Decrypt the value via API
    try {
      const value = await decryptEnvVar.mutateAsync(id);
      setDecryptedValues((prev) => ({ ...prev, [id]: value }));
      setShowValues((prev) => ({ ...prev, [id]: true }));
    } catch {
      // silently fail - user can retry
    }
  }, [showValues, decryptEnvVar]);

  const maskValue = (value: string) => {
    return '•'.repeat(Math.min(value.length || 20, 30));
  };

  const openEditDialog = async (envVar: EnvironmentVariable) => {
    setEditTarget(envVar);
    setEditKey(envVar.key_name);
    setEditDesc(envVar.description || '');
    setEditIsSecret(envVar.is_secret);
    setEditValue('');

    // Pre-decrypt the current value for editing
    try {
      const value = await decryptEnvVar.mutateAsync(envVar.id);
      setEditValue(value);
    } catch {
      setEditValue('');
    }
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    await updateEnvVar.mutateAsync({
      id: editTarget.id,
      key_name: editKey.trim() || undefined,
      value: editValue || undefined,
      is_secret: editIsSecret,
      description: editDesc.trim() || null,
    });

    // Clear decrypted cache for this var since it changed
    setDecryptedValues((prev) => {
      const next = { ...prev };
      delete next[editTarget.id];
      return next;
    });
    setShowValues((prev) => ({ ...prev, [editTarget.id]: false }));

    setEditOpen(false);
    setEditTarget(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">환경변수 관리</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowGitHubSync(!showGitHubSync)}
            className={showGitHubSync ? 'border-primary' : ''}
          >
            <GitBranch className="mr-2 h-4 w-4" />
            GitHub 동기화
            {linkedRepos.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {linkedRepos.length}
              </Badge>
            )}
          </Button>
          <EnvImportDialog
            onImport={async (vars) => {
              const res = await fetch('/api/env/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, variables: vars }),
              });
              if (!res.ok) throw new Error('일괄 가져오기 실패');
              await queryClient.invalidateQueries({ queryKey: queryKeys.envVars.byProject(projectId) });
            }}
          />
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            .env 다운로드
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                변수 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>환경변수 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="env-key">변수 이름</Label>
                  <Input
                    id="env-key"
                    placeholder="NEXT_PUBLIC_EXAMPLE_KEY"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="env-value">값</Label>
                  <Input
                    id="env-value"
                    placeholder="sk_live_..."
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="env-desc">설명 (선택)</Label>
                  <Input
                    id="env-desc"
                    placeholder="Supabase Project URL"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="env-secret"
                    checked={newIsSecret}
                    onCheckedChange={(checked) => setNewIsSecret(checked as boolean)}
                  />
                  <Label htmlFor="env-secret" className="text-sm">
                    민감한 값 (Secret)
                  </Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={addEnvVar.isPending || !newKey.trim()}>
                    {addEnvVar.isPending ? '추가 중...' : '추가'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showGitHubSync && (
        <SecretsSyncPanel projectId={projectId} />
      )}

      <Tabs value={activeEnv} onValueChange={(v) => setActiveEnv(v as Environment)}>
        <TabsList>
          {(Object.keys(envLabels) as Environment[]).map((env) => {
            const count = envVars.filter((v) => v.environment === env).length;
            return (
              <TabsTrigger key={env} value={env}>
                {envLabels[env]}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(envLabels) as Environment[]).map((env) => (
          <TabsContent key={env} value={env}>
            {filteredVars.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {env} 환경에 등록된 변수가 없습니다
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredVars.map((envVar) => (
                      <div key={envVar.id} className="flex items-center gap-4 p-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-sm font-mono font-medium">
                              {envVar.key_name}
                            </code>
                            <Badge
                              variant={envVar.is_secret ? 'destructive' : 'secondary'}
                              className="text-[10px]"
                            >
                              {envVar.is_secret ? '비밀' : '공개'}
                            </Badge>
                            {envVar.service_id && serviceNameMap.has(envVar.service_id) && (
                              <Badge variant="outline" className="text-[10px]">
                                {serviceNameMap.get(envVar.service_id)}
                              </Badge>
                            )}
                          </div>
                          {envVar.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {envVar.description}
                            </p>
                          )}
                          <code className="text-xs text-muted-foreground font-mono mt-1 block">
                            {showValues[envVar.id] && decryptedValues[envVar.id] !== undefined
                              ? decryptedValues[envVar.id]
                              : maskValue(envVar.encrypted_value)}
                          </code>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleShowValue(envVar.id)}
                            disabled={decryptEnvVar.isPending}
                          >
                            {showValues[envVar.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(envVar)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(envVar.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환경변수 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-key">변수 이름</Label>
              <Input
                id="edit-key"
                value={editKey}
                onChange={(e) => setEditKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-value">값</Label>
              <Input
                id="edit-value"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="font-mono"
                placeholder={decryptEnvVar.isPending ? '복호화 중...' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">설명 (선택)</Label>
              <Input
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-secret"
                checked={editIsSecret}
                onCheckedChange={(checked) => setEditIsSecret(checked as boolean)}
              />
              <Label htmlFor="edit-secret" className="text-sm">
                민감한 값 (Secret)
              </Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={updateEnvVar.isPending}>
                {updateEnvVar.isPending ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import {
  useLinkedRepos,
  useUnlinkRepo,
  useGitHubSecrets,
  usePushSecretsToGitHub,
} from '@/lib/queries/github';
import { useEnvVars } from '@/lib/queries/env-vars';
import { autoMapEnvVars } from '@/lib/github/auto-map';
import { RepoSelector } from './repo-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GitBranch,
  RefreshCw,
  Trash2,
  Upload,
  Check,
  X,
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Environment } from '@/types';

interface SecretsSyncPanelProps {
  projectId: string;
}

const envLabels: Record<Environment, string> = {
  development: '개발',
  staging: '스테이징',
  production: '프로덕션',
};

export function SecretsSyncPanel({ projectId }: SecretsSyncPanelProps) {
  const { data: linkedRepos = [], isLoading: reposLoading } = useLinkedRepos(projectId);
  const unlinkRepo = useUnlinkRepo(projectId);
  const [selectedRepoIdx, setSelectedRepoIdx] = useState(0);
  const [syncEnv, setSyncEnv] = useState<Environment>('production');
  const [selectedVarIds, setSelectedVarIds] = useState<Set<string>>(new Set());

  const selectedRepo = linkedRepos[selectedRepoIdx] || null;
  const { data: envVars = [] } = useEnvVars(projectId);
  const filteredEnvVars = useMemo(
    () => envVars.filter((v) => v.environment === syncEnv),
    [envVars, syncEnv]
  );

  const mapping = useMemo(
    () => autoMapEnvVars(filteredEnvVars.map((v) => ({ id: v.id, key_name: v.key_name }))),
    [filteredEnvVars]
  );

  const { data: ghSecrets } = useGitHubSecrets(
    projectId,
    selectedRepo?.owner || '',
    selectedRepo?.repo_name || ''
  );

  const pushSecrets = usePushSecretsToGitHub(projectId);

  const ghSecretNames = useMemo(
    () => new Set((ghSecrets?.secrets || []).map((s) => s.name)),
    [ghSecrets]
  );

  const toggleVar = (id: string) => {
    setSelectedVarIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const nonConflict = mapping.filter((m) => !m.conflict).map((m) => m.envVarId);
    setSelectedVarIds(new Set(nonConflict));
  };

  const handleSync = async () => {
    if (!selectedRepo || selectedVarIds.size === 0) return;

    const secrets = mapping
      .filter((m) => selectedVarIds.has(m.envVarId))
      .map((m) => ({ env_var_id: m.envVarId, secret_name: m.secretName }));

    try {
      const result = await pushSecrets.mutateAsync({
        owner: selectedRepo.owner,
        repo_name: selectedRepo.repo_name,
        secrets,
      });

      const successCount = result.results.filter((r) => r.success).length;
      const failCount = result.results.filter((r) => !r.success).length;

      if (failCount === 0) {
        toast.success(`${successCount}개 시크릿 동기화 완료`);
      } else {
        toast.warning(`${successCount}개 성공, ${failCount}개 실패`);
      }

      setSelectedVarIds(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '동기화 실패');
    }
  };

  if (reposLoading) {
    return <div className="text-sm text-muted-foreground">로딩 중...</div>;
  }

  if (linkedRepos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <GitBranch className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            연결된 GitHub 레포가 없습니다
          </p>
          <RepoSelector projectId={projectId} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Linked repos list */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">연결된 레포</h3>
        <RepoSelector projectId={projectId} />
      </div>

      <div className="space-y-2">
        {linkedRepos.map((repo, idx) => (
          <div
            key={repo.id}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
              idx === selectedRepoIdx
                ? 'border-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => setSelectedRepoIdx(idx)}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{repo.repo_full_name}</span>
                {repo.auto_sync_enabled && (
                  <Badge variant="secondary" className="text-[10px]">자동 동기화</Badge>
                )}
              </div>
              {repo.last_synced_at && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  마지막 동기화: {new Date(repo.last_synced_at).toLocaleString('ko-KR')}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`${repo.repo_full_name} 연결을 해제하시겠습니까?`)) {
                  unlinkRepo.mutate(repo.id, {
                    onSuccess: () => {
                      toast.success('레포 연결 해제됨');
                      if (selectedRepoIdx >= linkedRepos.length - 1) {
                        setSelectedRepoIdx(Math.max(0, selectedRepoIdx - 1));
                      }
                    },
                  });
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {selectedRepo && (
        <>
          <Separator />

          {/* Sync controls */}
          <div className="flex items-center gap-3">
            <Select value={syncEnv} onValueChange={(v) => setSyncEnv(v as Environment)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(envLabels) as Environment[]).map((env) => (
                  <SelectItem key={env} value={env}>
                    {envLabels[env]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={selectAll}>
              전체 선택
            </Button>

            <Button
              size="sm"
              onClick={handleSync}
              disabled={selectedVarIds.size === 0 || pushSecrets.isPending}
            >
              {pushSecrets.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {pushSecrets.isPending
                ? '동기화 중...'
                : `선택된 ${selectedVarIds.size}개 동기화`}
            </Button>
          </div>

          {/* Env var → Secret mapping table */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">
                환경변수 → GitHub Secrets 매핑
                <Badge variant="secondary" className="ml-2">
                  {filteredEnvVars.length}개
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredEnvVars.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {syncEnv} 환경에 환경변수가 없습니다
                </div>
              ) : (
                <div className="divide-y">
                  {mapping.map((item) => {
                    const existsInGH = ghSecretNames.has(item.secretName);
                    return (
                      <div
                        key={item.envVarId}
                        className={`flex items-center gap-3 p-3 ${
                          item.conflict ? 'bg-destructive/5' : ''
                        }`}
                      >
                        <Checkbox
                          checked={selectedVarIds.has(item.envVarId)}
                          onCheckedChange={() => toggleVar(item.envVarId)}
                          disabled={item.conflict}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono">{item.envVarKey}</code>
                            <span className="text-muted-foreground text-xs">→</span>
                            <code className="text-xs font-mono text-primary">{item.secretName}</code>
                          </div>
                          {item.conflict && (
                            <p className="text-[10px] text-destructive flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="h-3 w-3" />
                              {item.conflictReason}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {existsInGH ? (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <RefreshCw className="h-2.5 w-2.5" />
                              업데이트
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              <Plus className="h-2.5 w-2.5" />
                              신규
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Small Plus icon for inline use
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

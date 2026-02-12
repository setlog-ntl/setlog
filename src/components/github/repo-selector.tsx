'use client';

import { useState, useMemo } from 'react';
import { useGitHubRepos, useLinkRepo, useLinkedRepos } from '@/lib/queries/github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, GitBranch, Lock, Globe, Check, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RepoSelectorProps {
  projectId: string;
  trigger?: React.ReactNode;
  onLinked?: () => void;
}

export function RepoSelector({ projectId, trigger, onLinked }: RepoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: repos, isLoading, error } = useGitHubRepos(projectId);
  const { data: linkedRepos = [] } = useLinkedRepos(projectId);
  const linkRepo = useLinkRepo(projectId);

  const linkedFullNames = useMemo(
    () => new Set(linkedRepos.map((r) => r.repo_full_name)),
    [linkedRepos]
  );

  const filtered = useMemo(() => {
    if (!repos) return [];
    if (!search.trim()) return repos;
    const q = search.toLowerCase();
    return repos.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [repos, search]);

  const handleLink = async (repo: (typeof filtered)[0]) => {
    try {
      await linkRepo.mutateAsync({
        owner: repo.owner.login,
        repo_name: repo.name,
        repo_full_name: repo.full_name,
        default_branch: repo.default_branch,
      });
      toast.success(`${repo.full_name} 연결 완료`);
      onLinked?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '연결 실패');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            GitHub 레포 연결
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>GitHub 레포지토리 선택</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="레포 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[50vh]">
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error instanceof Error ? error.message : 'GitHub 레포를 불러올 수 없습니다'}</span>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {search ? '검색 결과가 없습니다' : '접근 가능한 레포가 없습니다'}
            </p>
          )}

          {filtered.map((repo) => {
            const isLinked = linkedFullNames.has(repo.full_name);
            return (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{repo.full_name}</span>
                    {repo.private ? (
                      <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                      <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {repo.language && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {repo.language}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {repo.default_branch}
                    </span>
                  </div>
                </div>
                <Button
                  variant={isLinked ? 'ghost' : 'outline'}
                  size="sm"
                  disabled={isLinked || linkRepo.isPending}
                  onClick={() => handleLink(repo)}
                >
                  {isLinked ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
                      연결됨
                    </>
                  ) : (
                    '연결'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

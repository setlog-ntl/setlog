'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject, useUpdateProject, useDeleteProject } from '@/lib/queries/projects';
import { Save, Trash2, Users, UserPlus, Shield, Edit, Eye, GitBranch, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useLinkedRepos, useUnlinkRepo } from '@/lib/queries/github';
import { RepoSelector } from '@/components/github/repo-selector';

const roleLabels: Record<string, string> = {
  admin: '관리자',
  editor: '편집자',
  viewer: '뷰어',
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  editor: <Edit className="h-4 w-4" />,
  viewer: <Eye className="h-4 w-4" />,
};

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  user: { email: string; raw_user_meta_data: { name?: string } };
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { data: project, isLoading } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameInitialized, setNameInitialized] = useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('viewer');
  const [inviting, setInviting] = useState(false);

  if (!nameInitialized && project) {
    setName(project.name);
    setDescription(project.description || '');
    setNameInitialized(true);
  }

  const loadMembers = useCallback(async () => {
    if (!project?.team_id) return;
    try {
      const res = await fetch(`/api/teams/${project.team_id}/members`);
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch { /* ignore */ }
  }, [project?.team_id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleSave = () => {
    if (!name.trim()) return;
    updateProject.mutate(
      { id: projectId, updates: { name: name.trim(), description: description.trim() || null } },
      {
        onSuccess: () => toast.success('프로젝트가 업데이트되었습니다'),
        onError: () => toast.error('업데이트에 실패했습니다'),
      }
    );
  };

  const handleDelete = () => {
    if (!confirm('프로젝트를 삭제하시겠습니까?\n모든 서비스 연결과 환경변수가 삭제됩니다.')) return;
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    deleteProject.mutate(projectId, {
      onSuccess: () => router.push('/dashboard'),
      onError: () => toast.error('삭제에 실패했습니다'),
    });
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !project?.team_id) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/teams/${project.team_id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || '초대에 실패했습니다');
        return;
      }
      toast.success(`${inviteEmail}을 초대했습니다`);
      setInviteEmail('');
      loadMembers();
    } catch {
      toast.error('초대에 실패했습니다');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!project?.team_id) return;
    try {
      const res = await fetch(`/api/teams/${project.team_id}/members?member_id=${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || '멤버 제거에 실패했습니다');
        return;
      }
      toast.success('멤버가 제거되었습니다');
      loadMembers();
    } catch {
      toast.error('멤버 제거에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 정보</CardTitle>
          <CardDescription>프로젝트의 기본 정보를 수정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">프로젝트 이름</Label>
            <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} />
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
          <Button onClick={handleSave} disabled={updateProject.isPending || !name.trim()}>
            <Save className="mr-2 h-4 w-4" />
            {updateProject.isPending ? '저장 중...' : '저장'}
          </Button>
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>팀 관리</CardTitle>
          </div>
          <CardDescription>팀 멤버를 초대하고 역할을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {project?.team_id ? (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="이메일 주소"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="editor">편집자</SelectItem>
                    <SelectItem value="viewer">뷰어</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  초대
                </Button>
              </div>

              {teamMembers.length > 0 ? (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {member.user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.user?.raw_user_meta_data?.name || member.user?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          {roleIcons[member.role]}
                          {roleLabels[member.role]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">아직 팀 멤버가 없습니다</p>
                  <p className="text-xs">이메일로 팀원을 초대해보세요</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">이 프로젝트는 개인 프로젝트입니다</p>
              <p className="text-xs">팀 플랜으로 업그레이드하면 팀원을 초대할 수 있습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub Integration */}
      <GitHubSettingsCard projectId={projectId} />

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">위험 구역</CardTitle>
          <CardDescription>
            프로젝트를 삭제하면 모든 서비스 연결, 체크리스트 진행도, 환경변수가 영구적으로 삭제됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteProject.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteProject.isPending ? '삭제 중...' : '프로젝트 삭제'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- GitHub Settings ----------

function GitHubSettingsCard({ projectId }: { projectId: string }) {
  const { data: linkedRepos = [], isLoading } = useLinkedRepos(projectId);
  const unlinkRepo = useUnlinkRepo(projectId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          <CardTitle>GitHub 연결</CardTitle>
        </div>
        <CardDescription>프로젝트에 연결된 GitHub 레포를 관리합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-16" />
        ) : linkedRepos.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">연결된 GitHub 레포가 없습니다</p>
            <p className="text-xs mb-3">레포를 연결하면 환경변수를 GitHub Secrets로 동기화할 수 있습니다</p>
            <RepoSelector projectId={projectId} />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {linkedRepos.map((repo) => (
                <div key={repo.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <GitBranch className="h-3.5 w-3.5" />
                      {repo.repo_full_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {repo.auto_sync_enabled && (
                        <Badge variant="secondary" className="text-[10px]">
                          <RefreshCw className="h-2.5 w-2.5 mr-1" />
                          자동 동기화
                        </Badge>
                      )}
                      {repo.last_synced_at && (
                        <span className="text-[10px] text-muted-foreground">
                          마지막: {new Date(repo.last_synced_at).toLocaleString('ko-KR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      if (confirm(`${repo.repo_full_name} 연결을 해제하시겠습니까?`)) {
                        unlinkRepo.mutate(repo.id, {
                          onSuccess: () => toast.success('레포 연결 해제됨'),
                          onError: () => toast.error('연결 해제 실패'),
                        });
                      }
                    }}
                    disabled={unlinkRepo.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <RepoSelector projectId={projectId} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

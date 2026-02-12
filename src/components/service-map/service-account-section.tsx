'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ApiKeyConnectDialog } from '@/components/service-map/api-key-connect-dialog';
import {
  useServiceAccounts,
  useDisconnectServiceAccount,
  useVerifyServiceAccount,
} from '@/lib/queries/service-accounts';
import { getConnectionConfig } from '@/data/service-connections';
import {
  Link2,
  Link2Off,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ExternalLink,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';
import { RepoSelector } from '@/components/github/repo-selector';
import { useLinkedRepos } from '@/lib/queries/github';
import type { ServiceAccount } from '@/types';

interface ServiceAccountSectionProps {
  projectId: string;
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  active: {
    label: '연결됨',
    icon: <ShieldCheck className="h-4 w-4 text-green-600" />,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  },
  expired: {
    label: '만료됨',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  },
  revoked: {
    label: '해제됨',
    icon: <Link2Off className="h-4 w-4 text-gray-500" />,
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  },
  error: {
    label: '오류',
    icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  },
};

export function ServiceAccountSection({
  projectId,
  serviceId,
  serviceSlug,
  serviceName,
}: ServiceAccountSectionProps) {
  const { data: accounts = [] } = useServiceAccounts(projectId);
  const disconnectMutation = useDisconnectServiceAccount(projectId);
  const verifyMutation = useVerifyServiceAccount(projectId);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  const config = getConnectionConfig(serviceSlug);
  const account = accounts.find((a) => a.service_id === serviceId);
  const status = account ? statusConfig[account.status] || statusConfig.error : null;
  const isGitHub = serviceSlug === 'github-actions';
  const { data: linkedRepos = [] } = useLinkedRepos(projectId);

  const handleDisconnect = (acc: ServiceAccount) => {
    disconnectMutation.mutate(acc.id, {
      onSuccess: () => toast.success('연결이 해제되었습니다'),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleVerify = (acc: ServiceAccount) => {
    verifyMutation.mutate(acc.id, {
      onSuccess: (result) => {
        if (result.status === 'active') {
          toast.success('연결이 정상입니다');
        } else {
          toast.error(result.error_message || '검증에 실패했습니다');
        }
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleOAuthConnect = () => {
    // Redirect to OAuth authorize endpoint
    window.location.href = `/api/oauth/${config.oauth_config?.provider}/authorize?project_id=${projectId}&service_id=${serviceId}&service_slug=${serviceSlug}`;
  };

  // Manual-only services
  if (config.capabilities.length === 1 && config.capabilities[0] === 'manual') {
    return (
      <div>
        <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
          <Link2 className="h-3.5 w-3.5" />
          계정 연결
        </h4>
        <p className="text-xs text-muted-foreground">
          {config.description_ko || '이 서비스는 수동 설정이 필요합니다.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
        <Link2 className="h-3.5 w-3.5" />
        계정 연결
      </h4>

      {account && status ? (
        // 연결됨 상태
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.icon}
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {account.connection_type === 'oauth' ? 'OAuth' : 'API Key'}
            </span>
          </div>

          {/* OAuth 사용자 정보 */}
          {account.connection_type === 'oauth' && account.oauth_metadata && (
            <div className="text-xs text-muted-foreground">
              {(account.oauth_metadata as Record<string, string>).login && (
                <span>@{(account.oauth_metadata as Record<string, string>).login}</span>
              )}
              {account.oauth_scopes && account.oauth_scopes.length > 0 && (
                <span className="ml-2">({account.oauth_scopes.join(', ')})</span>
              )}
            </div>
          )}

          {/* API Key 레이블 */}
          {account.connection_type === 'api_key' && account.api_key_label && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <KeyRound className="h-3 w-3" />
              {account.api_key_label}
            </div>
          )}

          {/* 에러 메시지 */}
          {account.error_message && (
            <p className="text-xs text-destructive">{account.error_message}</p>
          )}

          {/* 마지막 검증 시간 */}
          {account.last_verified_at && (
            <p className="text-[10px] text-muted-foreground">
              마지막 검증: {new Date(account.last_verified_at).toLocaleString('ko-KR')}
            </p>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerify(account)}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                '검증'
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDisconnect(account)}
              disabled={disconnectMutation.isPending}
              className="text-destructive hover:text-destructive"
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                '연결 해제'
              )}
            </Button>
          </div>

          {/* GitHub: one-click repo linking after OAuth */}
          {isGitHub && account.status === 'active' && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  레포 {linkedRepos.length}개 연결됨
                </span>
                <RepoSelector
                  projectId={projectId}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      레포 연결
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        // 미연결 상태 - 연결 방법 버튼
        <div className="space-y-2">
          {config.description_ko && (
            <p className="text-xs text-muted-foreground mb-2">{config.description_ko}</p>
          )}

          <div className="flex flex-col gap-2">
            {config.capabilities.includes('oauth') && config.oauth_config && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOAuthConnect}
                className="justify-start"
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                {config.oauth_config.provider === 'github' ? 'GitHub' : config.oauth_config.provider} 로그인으로 연결
              </Button>
            )}

            {config.capabilities.includes('api_key') && config.api_key_fields && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApiKeyDialogOpen(true)}
                className="justify-start"
              >
                <KeyRound className="mr-2 h-3.5 w-3.5" />
                API Key 입력
              </Button>
            )}
          </div>

          {config.api_key_fields && (
            <ApiKeyConnectDialog
              open={apiKeyDialogOpen}
              onOpenChange={setApiKeyDialogOpen}
              projectId={projectId}
              serviceId={serviceId}
              serviceName={serviceName}
              fields={config.api_key_fields}
            />
          )}
        </div>
      )}
    </div>
  );
}

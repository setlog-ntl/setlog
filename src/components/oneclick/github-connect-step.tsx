'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Github, ExternalLink } from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import { t } from '@/lib/i18n';

interface GitHubAccount {
  id: string;
  provider_account_id: string;
  status: string;
}

interface GitHubConnectStepProps {
  githubAccount: GitHubAccount | null;
  isLoading: boolean;
  onNext: () => void;
}

export function GitHubConnectStep({ githubAccount, isLoading, onNext }: GitHubConnectStepProps) {
  const { locale } = useLocaleStore();
  const isConnected = githubAccount?.status === 'active';

  const handleConnect = () => {
    // Redirect to oneclick-specific GitHub OAuth flow (no project_id needed)
    window.location.href = '/api/oneclick/oauth/authorize';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto" />
            <div className="h-4 w-48 bg-muted mx-auto rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Github className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              {locale === 'ko' ? 'GitHub 연결' : 'Connect GitHub'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {locale === 'ko'
                ? '홈페이지 코드를 내 GitHub 계정에 저장합니다. 코드의 완전한 소유권을 가집니다.'
                : 'Your homepage code will be stored in your GitHub account. You keep full ownership of the code.'}
            </p>
          </div>

          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">
                  {githubAccount.provider_account_id}
                </span>
                <Badge variant="secondary">
                  {locale === 'ko' ? '연결됨' : 'Connected'}
                </Badge>
              </div>
              <Button onClick={onNext} size="lg">
                {t(locale, 'common.next')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button onClick={handleConnect} size="lg" className="gap-2">
                <Github className="h-4 w-4" />
                {locale === 'ko' ? 'GitHub 연결하기' : 'Connect GitHub'}
              </Button>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {locale === 'ko'
                  ? 'GitHub 로그인 페이지로 이동합니다'
                  : 'You will be redirected to GitHub login'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

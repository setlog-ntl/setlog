'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  ExternalLink,
  Github,
  LayoutDashboard,
} from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import Link from 'next/link';
import type { DeployStatus } from '@/lib/queries/oneclick';

interface DeployStepProps {
  status: DeployStatus | null;
  isLoading: boolean;
  error: Error | null;
  projectId: string | null;
}

export function DeployStep({ status, isLoading, error, projectId }: DeployStepProps) {
  const { locale } = useLocaleStore();

  if (isLoading && !status) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {locale === 'ko' ? '배포를 준비하고 있습니다...' : 'Preparing deployment...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-red-500">
            {locale === 'ko' ? '배포 오류' : 'Deployment Error'}
          </h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const isCompleted = status.deploy_status === 'ready';
  const isError = status.deploy_status === 'error';
  const completedSteps = status.steps.filter((s) => s.status === 'completed').length;
  const progressPercent = (completedSteps / status.steps.length) * 100;

  // Use pages_url when available, fall back to deployment_url
  const liveUrl = status.pages_url || status.deployment_url;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {isCompleted
                  ? (locale === 'ko' ? '배포 완료!' : 'Deployment Complete!')
                  : isError
                    ? (locale === 'ko' ? '배포 실패' : 'Deployment Failed')
                    : (locale === 'ko' ? '배포 진행 중...' : 'Deploying...')}
              </h3>
              {!isCompleted && !isError && (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {locale === 'ko' ? '진행 중' : 'In Progress'}
                </Badge>
              )}
            </div>

            <Progress value={progressPercent} className="h-2" />

            <div className="space-y-3">
              {status.steps.map((step) => (
                <div key={step.name} className="flex items-center gap-3">
                  <StepIcon status={step.status} />
                  <span className={`text-sm ${
                    step.status === 'completed' ? 'text-foreground' :
                    step.status === 'in_progress' ? 'text-primary font-medium' :
                    step.status === 'error' ? 'text-red-500' :
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error details */}
      {isError && status.deploy_error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-4">
            <p className="text-sm text-red-500">{status.deploy_error}</p>
          </CardContent>
        </Card>
      )}

      {/* Success result */}
      {isCompleted && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="py-6 space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">
                {locale === 'ko' ? '홈페이지가 배포되었습니다!' : 'Your homepage is live!'}
              </h3>
            </div>

            {/* Live URL */}
            {liveUrl && (
              <div className="text-center">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-lg font-mono"
                >
                  {liveUrl.replace('https://', '')}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* Action links */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {liveUrl && (
                <Button asChild>
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {locale === 'ko' ? '사이트 방문' : 'Visit Site'}
                  </a>
                </Button>
              )}
              {status.forked_repo_url && (
                <Button variant="outline" asChild>
                  <a href={status.forked_repo_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    {locale === 'ko' ? 'GitHub 레포' : 'GitHub Repo'}
                  </a>
                </Button>
              )}
              {projectId && (
                <Button variant="outline" asChild>
                  <Link href={`/project/${projectId}`}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {locale === 'ko' ? '프로젝트 관리' : 'Manage Project'}
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Sites link */}
      {isCompleted && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/my-sites">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {locale === 'ko' ? '내 사이트에서 관리하기' : 'Manage in My Sites'}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />;
    case 'in_progress':
      return <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />;
  }
}

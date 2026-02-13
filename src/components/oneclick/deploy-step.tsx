'use client';

import { useState } from 'react';
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
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import Link from 'next/link';
import type { DeployStatus } from '@/lib/queries/oneclick';

interface DeployStepProps {
  status: DeployStatus | null;
  isLoading: boolean;
  error: Error | null;
  projectId: string | null;
  onRetry?: () => void;
}

// 에러 메시지 → 사용자 친화적 원인 + 해결 방법 매핑
function getErrorDetails(
  errorMessage: string,
  status: DeployStatus | null,
  locale: string
): { cause: string; solution: string; failedStep: string | null } {
  const msg = errorMessage.toLowerCase();

  // 실패한 단계 찾기
  const failedStep = status?.steps.find((s) => s.status === 'error')?.label || null;

  // 레포지토리 이름 중복
  if (msg.includes('이미 존재') || msg.includes('already exists') || msg.includes('422') || msg.includes('409')) {
    return {
      cause: locale === 'ko'
        ? '동일한 이름의 레포지토리가 GitHub에 이미 존재합니다.'
        : 'A repository with the same name already exists on GitHub.',
      solution: locale === 'ko'
        ? '다른 사이트 이름을 사용하거나, GitHub에서 기존 레포지토리를 삭제한 후 다시 시도해주세요.'
        : 'Use a different site name, or delete the existing repository on GitHub and try again.',
      failedStep,
    };
  }

  // 템플릿 레포 없음
  if (msg.includes('템플릿') && msg.includes('찾을 수 없') || msg.includes('template') && msg.includes('not found')) {
    return {
      cause: locale === 'ko'
        ? '선택한 템플릿의 원본 레포지토리를 찾을 수 없습니다.'
        : 'The source repository for the selected template was not found.',
      solution: locale === 'ko'
        ? '다른 템플릿을 선택하거나, 관리자에게 문의해주세요.'
        : 'Choose a different template or contact the administrator.',
      failedStep,
    };
  }

  // GitHub 권한 부족
  if (msg.includes('권한') || msg.includes('permission') || msg.includes('403')) {
    return {
      cause: locale === 'ko'
        ? 'GitHub 계정의 권한이 부족하거나 토큰이 만료되었습니다.'
        : 'Insufficient GitHub permissions or expired token.',
      solution: locale === 'ko'
        ? 'GitHub 연결을 해제한 후 다시 연결해주세요. (설정 → GitHub 연결 해제)'
        : 'Disconnect and reconnect your GitHub account. (Settings → Disconnect GitHub)',
      failedStep,
    };
  }

  // GitHub 토큰 문제
  if (msg.includes('토큰') || msg.includes('token') || msg.includes('401')) {
    return {
      cause: locale === 'ko'
        ? 'GitHub 인증 토큰이 만료되었거나 유효하지 않습니다.'
        : 'GitHub authentication token has expired or is invalid.',
      solution: locale === 'ko'
        ? 'GitHub를 다시 연결해주세요.'
        : 'Please reconnect your GitHub account.',
      failedStep,
    };
  }

  // Rate limit
  if (msg.includes('요청이 너무') || msg.includes('rate') || msg.includes('429')) {
    return {
      cause: locale === 'ko'
        ? '짧은 시간에 너무 많은 요청이 발생했습니다.'
        : 'Too many requests in a short period.',
      solution: locale === 'ko'
        ? '1분 후 다시 시도해주세요.'
        : 'Please wait 1 minute and try again.',
      failedStep,
    };
  }

  // GitHub Pages 활성화 실패
  if (msg.includes('pages') || msg.includes('errored') || (failedStep && failedStep.includes('Pages'))) {
    return {
      cause: locale === 'ko'
        ? 'GitHub Pages 활성화 또는 빌드 중 오류가 발생했습니다.'
        : 'An error occurred while enabling or building GitHub Pages.',
      solution: locale === 'ko'
        ? 'GitHub 레포지토리의 Settings → Pages에서 직접 활성화하거나, 재시도해주세요.'
        : 'Enable Pages manually in your GitHub repo Settings → Pages, or retry.',
      failedStep,
    };
  }

  // 네트워크/서버 오류
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('500') || msg.includes('502')) {
    return {
      cause: locale === 'ko'
        ? '서버 또는 네트워크 오류가 발생했습니다.'
        : 'A server or network error occurred.',
      solution: locale === 'ko'
        ? '잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의하세요.'
        : 'Please try again later. If the issue persists, contact the administrator.',
      failedStep,
    };
  }

  // 할당량 초과
  if (msg.includes('한도') || msg.includes('quota') || msg.includes('limit')) {
    return {
      cause: locale === 'ko'
        ? '배포 한도에 도달했습니다.'
        : 'Deployment quota has been reached.',
      solution: locale === 'ko'
        ? 'Pro 플랜으로 업그레이드하거나, 기존 사이트를 삭제한 후 다시 시도해주세요.'
        : 'Upgrade to Pro plan or delete existing sites and try again.',
      failedStep,
    };
  }

  // 기본
  return {
    cause: locale === 'ko'
      ? '배포 중 예기치 않은 오류가 발생했습니다.'
      : 'An unexpected error occurred during deployment.',
    solution: locale === 'ko'
      ? '다시 시도해주세요. 문제가 계속되면 다른 사이트 이름으로 시도하거나 관리자에게 문의하세요.'
      : 'Please try again. If the issue persists, try a different site name or contact the administrator.',
    failedStep,
  };
}

export function DeployStep({ status, isLoading, error, projectId, onRetry }: DeployStepProps) {
  const { locale } = useLocaleStore();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyError = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 초기 API 호출 에러 (mutation 실패)
  if (error && !status) {
    const details = getErrorDetails(error.message, null, locale);

    return (
      <div className="space-y-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-8 space-y-5">
            <div className="text-center space-y-2">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold text-red-500">
                {locale === 'ko' ? '배포 오류' : 'Deployment Error'}
              </h3>
            </div>

            {/* 원인 & 해결 방법 */}
            <div className="space-y-3 bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {locale === 'ko' ? '원인' : 'Cause'}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400/80">{details.cause}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {locale === 'ko' ? '해결 방법' : 'Solution'}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400/80">{details.solution}</p>
                </div>
              </div>
            </div>

            {/* 상세 에러 토글 */}
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {locale === 'ko' ? '기술적 상세 정보' : 'Technical Details'}
              </button>
              {showDetails && (
                <div className="mt-2 bg-muted rounded-md p-3 relative">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono pr-8">
                    {error.message}
                  </pre>
                  <button
                    onClick={() => handleCopyError(error.message)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-background transition-colors"
                    title={locale === 'ko' ? '복사' : 'Copy'}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 재시도 버튼 */}
            {onRetry && (
              <div className="flex justify-center pt-2">
                <Button onClick={onRetry} size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {locale === 'ko' ? '처음부터 다시 시도' : 'Try Again'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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

  if (!status) return null;

  const isCompleted = status.deploy_status === 'ready';
  const isError = status.deploy_status === 'error';
  const completedSteps = status.steps.filter((s) => s.status === 'completed').length;
  const progressPercent = (completedSteps / status.steps.length) * 100;

  // Use pages_url when available, fall back to deployment_url
  const liveUrl = status.pages_url || status.deployment_url;

  // 에러 상세 정보
  const errorMessage = status.deploy_error || error?.message || '';
  const errorDetails = isError ? getErrorDetails(errorMessage, status, locale) : null;

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
              {isError && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  {locale === 'ko' ? '실패' : 'Failed'}
                </Badge>
              )}
            </div>

            <Progress
              value={isError ? progressPercent : progressPercent}
              className={`h-2 ${isError ? '[&>div]:bg-red-500' : ''}`}
            />

            <div className="space-y-3">
              {status.steps.map((step) => (
                <div key={step.name} className="flex items-center gap-3">
                  <StepIcon status={step.status} />
                  <span className={`text-sm ${
                    step.status === 'completed' ? 'text-foreground' :
                    step.status === 'in_progress' ? 'text-primary font-medium' :
                    step.status === 'error' ? 'text-red-500 font-medium' :
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                    {step.status === 'error' && (
                      <span className="ml-1 text-xs">
                        ({locale === 'ko' ? '이 단계에서 실패' : 'Failed at this step'})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error details — 원인 분석 + 해결 방법 */}
      {isError && errorDetails && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-5 space-y-4">
            <div className="space-y-3 bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {locale === 'ko' ? '오류 원인' : 'Error Cause'}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400/80">{errorDetails.cause}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {locale === 'ko' ? '해결 방법' : 'How to Fix'}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400/80">{errorDetails.solution}</p>
                </div>
              </div>
            </div>

            {/* 기술적 상세 정보 토글 */}
            {errorMessage && (
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {locale === 'ko' ? '기술적 상세 정보' : 'Technical Details'}
                </button>
                {showDetails && (
                  <div className="mt-2 bg-muted rounded-md p-3 relative">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono pr-8">
                      {errorMessage}
                    </pre>
                    <button
                      onClick={() => handleCopyError(errorMessage)}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-background transition-colors"
                      title={locale === 'ko' ? '복사' : 'Copy'}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 재시도 + GitHub 레포 링크 */}
            <div className="flex flex-wrap gap-3 pt-1">
              {onRetry && (
                <Button onClick={onRetry} size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {locale === 'ko' ? '처음부터 다시 시도' : 'Try Again'}
                </Button>
              )}
              {status.forked_repo_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={status.forked_repo_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    {locale === 'ko' ? 'GitHub에서 확인' : 'Check on GitHub'}
                  </a>
                </Button>
              )}
            </div>
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

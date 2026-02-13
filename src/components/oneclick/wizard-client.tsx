'use client';

import { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AuthGateStep } from './auth-gate-step';
import { GitHubConnectStep } from './github-connect-step';
import { TemplatePickerStep } from './template-picker-step';
import { DeployStep } from './deploy-step';
import { useHomepageTemplates, useForkTemplate, useDeployToVercel, useDeployStatus } from '@/lib/queries/oneclick';
import { useQuery } from '@tanstack/react-query';
import { useLocaleStore } from '@/stores/locale-store';
import { toast } from 'sonner';

interface OneclickWizardClientProps {
  isAuthenticated: boolean;
}

export function OneclickWizardClient({ isAuthenticated }: OneclickWizardClientProps) {
  const { locale } = useLocaleStore();

  // Steps: auth(0) → github(1) → template(2) → deploy(3)
  // If authenticated, skip auth step (start at 1)
  const baseStep = isAuthenticated ? 1 : 0;
  const [currentStep, setCurrentStep] = useState(baseStep);
  const [deployId, setDeployId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Detect ?oauth_success=github from URL → auto-advance past GitHub step
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success') === 'github') {
      setCurrentStep(2); // skip to template step
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Data fetching
  const { data: templates = [], isLoading: templatesLoading } = useHomepageTemplates();
  const forkMutation = useForkTemplate();
  const deployMutation = useDeployToVercel();
  const { data: deployStatus, isLoading: statusLoading, error: statusError } = useDeployStatus(
    deployId,
    currentStep === 3
  );

  // Check GitHub connection (only when authenticated)
  const { data: githubAccount, isLoading: githubLoading } = useQuery({
    queryKey: ['github-account-check'],
    queryFn: async () => {
      const res = await fetch('/api/oneclick/github-check');
      if (!res.ok) return null;
      const data = await res.json();
      return data.account || null;
    },
    enabled: isAuthenticated,
  });

  // Step definitions based on auth state
  const steps = isAuthenticated
    ? [
        { key: 'github', number: 1 },
        { key: 'template', number: 2 },
        { key: 'deploy', number: 3 },
      ]
    : [
        { key: 'auth', number: 0 },
        { key: 'github', number: 1 },
        { key: 'template', number: 2 },
        { key: 'deploy', number: 3 },
      ];

  const stepLabels = isAuthenticated
    ? locale === 'ko'
      ? ['GitHub 연결', '템플릿 선택', '배포']
      : ['Connect GitHub', 'Choose Template', 'Deploy']
    : locale === 'ko'
      ? ['로그인', 'GitHub 연결', '템플릿 선택', '배포']
      : ['Sign In', 'Connect GitHub', 'Choose Template', 'Deploy'];

  const handleDeploy = useCallback(async (data: { templateId: string; siteName: string; vercelToken: string }) => {
    setIsDeploying(true);
    try {
      // Step 1: Fork
      const forkResult = await forkMutation.mutateAsync({
        template_id: data.templateId,
        site_name: data.siteName,
      });

      setDeployId(forkResult.deploy_id);
      setProjectId(forkResult.project_id);
      setCurrentStep(3);

      // Step 2: Deploy to Vercel
      await deployMutation.mutateAsync({
        deploy_id: forkResult.deploy_id,
        vercel_token: data.vercelToken,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '배포 중 오류가 발생했습니다';
      toast.error(message);
      if (!deployId) {
        setIsDeploying(false);
      }
    }
  }, [forkMutation, deployMutation, deployId]);

  // Map currentStep to visible step index for the indicator
  const visibleStepIndex = steps.findIndex((s) => s.number === currentStep);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="mb-2">
          {locale === 'ko' ? '원클릭 배포' : 'One-Click Deploy'}
        </Badge>
        <h1 className="text-3xl font-bold">
          {locale === 'ko' ? '3분 안에 내 홈페이지 만들기' : 'Create Your Homepage in 3 Minutes'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ko'
            ? 'GitHub 연결 → 템플릿 선택 → 자동 배포. 내 코드, 내 소유.'
            : 'Connect GitHub → Pick Template → Auto Deploy. Your code, your ownership.'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                idx === visibleStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : idx < visibleStepIndex
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="hidden sm:inline">{stepLabels[idx]}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${idx < visibleStepIndex ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {currentStep === 0 && !isAuthenticated && (
        <AuthGateStep />
      )}

      {currentStep === 1 && (
        <GitHubConnectStep
          githubAccount={githubAccount}
          isLoading={githubLoading}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <TemplatePickerStep
          templates={templates}
          isLoading={templatesLoading}
          onBack={() => setCurrentStep(1)}
          onNext={handleDeploy}
        />
      )}

      {currentStep === 3 && (
        <DeployStep
          status={deployStatus ?? null}
          isLoading={isDeploying && statusLoading}
          error={statusError || (forkMutation.error as Error) || (deployMutation.error as Error) || null}
          projectId={projectId}
        />
      )}
    </div>
  );
}

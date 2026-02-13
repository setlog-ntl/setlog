'use client';

import { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AuthGateStep } from './auth-gate-step';
import { GitHubConnectStep } from './github-connect-step';
import { TemplatePickerStep } from './template-picker-step';
import { DeployStep } from './deploy-step';
import { useHomepageTemplates, useDeployToGitHubPages, useDeployStatus } from '@/lib/queries/oneclick';
import { useQuery } from '@tanstack/react-query';
import { useLocaleStore } from '@/stores/locale-store';
import { toast } from 'sonner';

interface OneclickWizardClientProps {
  isAuthenticated: boolean;
}

export function OneclickWizardClient({ isAuthenticated }: OneclickWizardClientProps) {
  const { locale } = useLocaleStore();

  // Steps: template(0) → github(1) → deploy(2)
  const [currentStep, setCurrentStep] = useState(0);
  const [deployId, setDeployId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [pendingDeploy, setPendingDeploy] = useState<{ templateId: string; siteName: string } | null>(null);

  // Detect ?oauth_success=github from URL → auto-advance past GitHub step
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success') === 'github') {
      // Restore pending deploy data if available
      const saved = sessionStorage.getItem('linkmap-pending-deploy');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setPendingDeploy(data);
        } catch {
          // ignore
        }
        sessionStorage.removeItem('linkmap-pending-deploy');
      }
      setCurrentStep(1); // show github step (now connected)
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Data fetching
  const { data: templates = [], isLoading: templatesLoading } = useHomepageTemplates('github_pages');
  const deployPagesMutation = useDeployToGitHubPages();
  const { data: deployStatus, isLoading: statusLoading, error: statusError } = useDeployStatus(
    deployId,
    currentStep === 2
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

  const isGitHubConnected = githubAccount?.status === 'active';

  const executeDeploy = useCallback(async (data: { templateId: string; siteName: string }) => {
    setIsDeploying(true);
    try {
      const result = await deployPagesMutation.mutateAsync({
        template_id: data.templateId,
        site_name: data.siteName,
      });

      setDeployId(result.deploy_id);
      setProjectId(result.project_id);
      setCurrentStep(2);
    } catch (err) {
      const message = err instanceof Error ? err.message : '배포 중 오류가 발생했습니다';
      toast.error(message);
      setIsDeploying(false);
    }
  }, [deployPagesMutation]);

  const handleDeploy = useCallback(async (data: { templateId: string; siteName: string }) => {
    if (!isAuthenticated) {
      // Save pending deploy and redirect to login
      sessionStorage.setItem('linkmap-pending-deploy', JSON.stringify(data));
      window.location.href = `/login?redirect=/oneclick&template=${data.templateId}&site=${data.siteName}`;
      return;
    }

    if (!isGitHubConnected) {
      // Show GitHub connect step
      setPendingDeploy(data);
      setCurrentStep(1);
      return;
    }

    // Connected — deploy directly
    await executeDeploy(data);
  }, [isAuthenticated, isGitHubConnected, executeDeploy]);

  // Auto-deploy after GitHub connection if we have pending data
  const handleGitHubConnected = useCallback(async () => {
    if (pendingDeploy) {
      await executeDeploy(pendingDeploy);
      setPendingDeploy(null);
    } else {
      setCurrentStep(0); // Go back to template picker
    }
  }, [pendingDeploy, executeDeploy]);

  // Step definitions
  const steps = [
    { key: 'template', number: 0 },
    { key: 'github', number: 1 },
    { key: 'deploy', number: 2 },
  ];

  const stepLabels = locale === 'ko'
    ? ['템플릿 선택', 'GitHub 연결', '배포']
    : ['Choose Template', 'Connect GitHub', 'Deploy'];

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
            ? '템플릿 선택 → GitHub Pages 배포. GitHub 계정 하나로 끝.'
            : 'Pick a template → Deploy to GitHub Pages. Just one GitHub account.'}
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
      {currentStep === 0 && (
        <TemplatePickerStep
          templates={templates}
          isLoading={templatesLoading}
          isDeploying={isDeploying}
          onNext={handleDeploy}
        />
      )}

      {currentStep === 1 && !isAuthenticated && (
        <AuthGateStep />
      )}

      {currentStep === 1 && isAuthenticated && (
        <GitHubConnectStep
          githubAccount={githubAccount}
          isLoading={githubLoading}
          onNext={() => setCurrentStep(0)}
          onConnected={handleGitHubConnected}
        />
      )}

      {currentStep === 2 && (
        <DeployStep
          status={deployStatus ?? null}
          isLoading={isDeploying && statusLoading}
          error={statusError || (deployPagesMutation.error as Error) || null}
          projectId={projectId}
        />
      )}
    </div>
  );
}

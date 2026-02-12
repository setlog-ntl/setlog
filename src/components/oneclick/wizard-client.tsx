'use client';

import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { GitHubConnectStep } from './github-connect-step';
import { TemplatePickerStep } from './template-picker-step';
import { DeployStep } from './deploy-step';
import { useHomepageTemplates, useForkTemplate, useDeployToVercel, useDeployStatus } from '@/lib/queries/oneclick';
import { useQuery } from '@tanstack/react-query';
import { useLocaleStore } from '@/stores/locale-store';
import { toast } from 'sonner';

const STEPS = [
  { key: 'github', number: 1 },
  { key: 'template', number: 2 },
  { key: 'deploy', number: 3 },
] as const;

export function OneclickWizardClient() {
  const { locale } = useLocaleStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [deployId, setDeployId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Data fetching
  const { data: templates = [], isLoading: templatesLoading } = useHomepageTemplates();
  const forkMutation = useForkTemplate();
  const deployMutation = useDeployToVercel();
  const { data: deployStatus, isLoading: statusLoading, error: statusError } = useDeployStatus(
    deployId,
    currentStep === 2
  );

  // Check GitHub connection via a dedicated lightweight endpoint
  const { data: githubAccount, isLoading: githubLoading } = useQuery({
    queryKey: ['github-account-check'],
    queryFn: async () => {
      const res = await fetch('/api/oneclick/github-check');
      if (!res.ok) return null;
      const data = await res.json();
      return data.account || null;
    },
  });

  const stepLabels = locale === 'ko'
    ? ['GitHub 연결', '템플릿 선택', '배포']
    : ['Connect GitHub', 'Choose Template', 'Deploy'];

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
      setCurrentStep(2);

      // Step 2: Deploy to Vercel
      await deployMutation.mutateAsync({
        deploy_id: forkResult.deploy_id,
        vercel_token: data.vercelToken,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '배포 중 오류가 발생했습니다';
      toast.error(message);
      if (!deployId) {
        // If fork failed, stay on step 2
        setIsDeploying(false);
      }
    }
  }, [forkMutation, deployMutation, deployId]);

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
        {STEPS.map((step, idx) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                idx === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : idx < currentStep
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs font-bold">
                {step.number}
              </span>
              <span className="hidden sm:inline">{stepLabels[idx]}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${idx < currentStep ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {currentStep === 0 && (
        <GitHubConnectStep
          githubAccount={githubAccount}
          isLoading={githubLoading}
          onNext={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 1 && (
        <TemplatePickerStep
          templates={templates}
          isLoading={templatesLoading}
          onBack={() => setCurrentStep(0)}
          onNext={handleDeploy}
        />
      )}

      {currentStep === 2 && (
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

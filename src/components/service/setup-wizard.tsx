'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Loader2, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAddEnvVar } from '@/lib/queries/env-vars';
import { useRunHealthCheck } from '@/lib/queries/health-checks';
import type { Service, ProjectService, Environment, HealthCheck } from '@/types';

interface SetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  projectService: ProjectService;
  projectId: string;
}

type Step = 'info' | 'environment' | 'credentials' | 'verify' | 'done';
const steps: Step[] = ['info', 'environment', 'credentials', 'verify', 'done'];
const stepLabels: Record<Step, string> = {
  info: '서비스 정보',
  environment: '환경 선택',
  credentials: '인증값 입력',
  verify: '연결 검증',
  done: '완료',
};

export function SetupWizard({ open, onOpenChange, service, projectService, projectId }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [selectedEnv, setSelectedEnv] = useState<Environment>('development');
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [verifyResult, setVerifyResult] = useState<HealthCheck | null>(null);
  const [saving, setSaving] = useState(false);

  const addEnvVar = useAddEnvVar(projectId);
  const runHealthCheck = useRunHealthCheck();

  const requiredVars = service.required_env_vars || [];
  const stepIndex = steps.indexOf(currentStep);
  const progressPercent = ((stepIndex + 1) / steps.length) * 100;

  const goNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) setCurrentStep(steps[nextIndex]);
  };

  const goBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) setCurrentStep(steps[prevIndex]);
  };

  const handleSaveAndVerify = async () => {
    setSaving(true);
    try {
      // Save all env vars
      for (const varTemplate of requiredVars) {
        const value = envValues[varTemplate.name] || '';
        if (value.trim()) {
          await addEnvVar.mutateAsync({
            key_name: varTemplate.name,
            value,
            environment: selectedEnv,
            is_secret: !varTemplate.public,
            description: varTemplate.description_ko || varTemplate.description,
          });
        }
      }

      setCurrentStep('verify');

      // Run health check
      const result = await runHealthCheck.mutateAsync({
        project_service_id: projectService.id,
        environment: selectedEnv,
      });
      setVerifyResult(result);
      setCurrentStep('done');
    } catch {
      setCurrentStep('done');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('info');
    setSelectedEnv('development');
    setEnvValues({});
    setVerifyResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {service.name} 연결 설정
          </DialogTitle>
          <Progress value={progressPercent} className="mt-2" />
          <div className="flex gap-1 mt-1">
            {steps.map((step, i) => (
              <Badge
                key={step}
                variant={i <= stepIndex ? 'default' : 'outline'}
                className="text-[10px]"
              >
                {stepLabels[step]}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        <div className="min-h-[200px]">
          {/* Step 1: Info */}
          {currentStep === 'info' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {service.description_ko || service.description}
              </p>
              {service.docs_url && (
                <a
                  href={service.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  공식 문서 보기
                </a>
              )}
              <div>
                <h4 className="text-sm font-medium mb-2">필요한 환경변수 ({requiredVars.length}개)</h4>
                <div className="space-y-1.5">
                  {requiredVars.map((v) => (
                    <div key={v.name} className="flex items-center gap-2 text-sm">
                      <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {v.name}
                      </code>
                      <Badge variant={v.public ? 'secondary' : 'destructive'} className="text-[10px]">
                        {v.public ? '공개' : '비밀'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Environment */}
          {currentStep === 'environment' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                환경변수를 저장할 환경을 선택하세요.
              </p>
              <Select value={selectedEnv} onValueChange={(v) => setSelectedEnv(v as Environment)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">개발 (Development)</SelectItem>
                  <SelectItem value="staging">스테이징 (Staging)</SelectItem>
                  <SelectItem value="production">프로덕션 (Production)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Credentials */}
          {currentStep === 'credentials' && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                각 환경변수의 값을 입력하세요.
              </p>
              {requiredVars.map((v) => (
                <div key={v.name} className="space-y-1.5">
                  <Label className="text-xs font-mono">{v.name}</Label>
                  <Input
                    type={v.public ? 'text' : 'password'}
                    placeholder={v.description_ko || v.description}
                    value={envValues[v.name] || ''}
                    onChange={(e) => setEnvValues((prev) => ({ ...prev, [v.name]: e.target.value }))}
                    className="font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Verify */}
          {currentStep === 'verify' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">연결을 검증하고 있습니다...</p>
            </div>
          )}

          {/* Step 5: Done */}
          {currentStep === 'done' && (
            <div className="flex flex-col items-center justify-center py-8">
              {verifyResult?.status === 'healthy' ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-1">연결 성공!</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {service.name} 서비스가 정상적으로 연결되었습니다.
                    {verifyResult.response_time_ms && ` (${verifyResult.response_time_ms}ms)`}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-yellow-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-1">설정 완료</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    환경변수가 저장되었습니다.
                    {verifyResult?.message && (
                      <span className="block mt-1 text-xs">{verifyResult.message}</span>
                    )}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStep !== 'verify' && currentStep !== 'done' && (
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={stepIndex === 0}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                이전
              </Button>
              {currentStep === 'credentials' ? (
                <Button onClick={handleSaveAndVerify} disabled={!requiredVars.some((v) => envValues[v.name]?.trim()) || saving}>
                  {saving ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-1.5 h-4 w-4" />
                  )}
                  저장 및 검증
                </Button>
              ) : (
                <Button onClick={goNext}>
                  다음
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {currentStep === 'done' && (
            <Button onClick={handleClose} className="w-full">
              완료
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import { t } from '@/lib/i18n';
import type { HomepageTemplate } from '@/lib/queries/oneclick';

interface TemplatePickerStepProps {
  templates: HomepageTemplate[];
  isLoading: boolean;
  onBack: () => void;
  onNext: (data: { templateId: string; siteName: string; vercelToken: string }) => void;
}

const SITE_NAME_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export function TemplatePickerStep({ templates, isLoading, onBack, onNext }: TemplatePickerStepProps) {
  const { locale } = useLocaleStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [siteNameError, setSiteNameError] = useState<string | null>(null);

  const validateSiteName = (name: string) => {
    if (name.length < 2) {
      return locale === 'ko' ? '최소 2자 이상이어야 합니다' : 'Must be at least 2 characters';
    }
    if (name.length > 100) {
      return locale === 'ko' ? '100자 이하여야 합니다' : 'Must be 100 characters or less';
    }
    if (!SITE_NAME_REGEX.test(name)) {
      return locale === 'ko'
        ? '소문자, 숫자, 하이픈만 사용 가능합니다 (예: my-site-1)'
        : 'Only lowercase letters, numbers, and hyphens allowed (e.g., my-site-1)';
    }
    return null;
  };

  const handleSiteNameChange = (value: string) => {
    const lowered = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSiteName(lowered);
    if (lowered.length >= 2) {
      setSiteNameError(validateSiteName(lowered));
    } else {
      setSiteNameError(null);
    }
  };

  const canProceed = selectedTemplate && siteName.length >= 2 && !siteNameError && vercelToken.length > 0;

  const handleNext = () => {
    if (!canProceed) return;
    const error = validateSiteName(siteName);
    if (error) {
      setSiteNameError(error);
      return;
    }
    onNext({ templateId: selectedTemplate!, siteName, vercelToken });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          {locale === 'ko' ? '템플릿 선택' : 'Choose a Template'}
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <Card
                key={tpl.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : ''
                } ${tpl.is_premium ? 'opacity-60' : ''}`}
                onClick={() => !tpl.is_premium && setSelectedTemplate(tpl.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">
                      {locale === 'ko' ? tpl.name_ko : tpl.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      {tpl.is_premium && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" /> Pro
                        </Badge>
                      )}
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {locale === 'ko' ? tpl.description_ko : tpl.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tpl.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Site name input */}
      <div className="space-y-2">
        <Label htmlFor="site-name" className="text-base font-semibold">
          {locale === 'ko' ? '사이트 이름' : 'Site Name'}
        </Label>
        <Input
          id="site-name"
          placeholder={locale === 'ko' ? 'my-portfolio' : 'my-portfolio'}
          value={siteName}
          onChange={(e) => handleSiteNameChange(e.target.value)}
          className={siteNameError ? 'border-red-500' : ''}
        />
        {siteNameError && (
          <p className="text-sm text-red-500">{siteNameError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {locale === 'ko'
            ? 'GitHub 레포지토리 이름과 Vercel 프로젝트 이름으로 사용됩니다'
            : 'Used as GitHub repository name and Vercel project name'}
        </p>
      </div>

      {/* Vercel token input */}
      <div className="space-y-2">
        <Label htmlFor="vercel-token" className="text-base font-semibold">
          {locale === 'ko' ? 'Vercel 토큰' : 'Vercel Token'}
        </Label>
        <Input
          id="vercel-token"
          type="password"
          placeholder={locale === 'ko' ? 'Vercel 개인 액세스 토큰 입력' : 'Enter your Vercel personal access token'}
          value={vercelToken}
          onChange={(e) => setVercelToken(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {locale === 'ko' ? (
            <>Vercel Settings → Tokens에서 생성할 수 있습니다. 토큰은 암호화되어 안전하게 저장됩니다.</>
          ) : (
            <>Create one at Vercel Settings → Tokens. Your token is encrypted and stored securely.</>
          )}
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t(locale, 'common.back')}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed}>
          {locale === 'ko' ? '배포 시작' : 'Start Deploy'}
        </Button>
      </div>
    </div>
  );
}

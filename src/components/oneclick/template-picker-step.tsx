'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Lock, Loader2, Rocket } from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import type { HomepageTemplate } from '@/lib/queries/oneclick';

interface TemplatePickerStepProps {
  templates: HomepageTemplate[];
  isLoading: boolean;
  isDeploying?: boolean;
  onNext: (data: { templateId: string; siteName: string }) => void;
}

const SITE_NAME_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export function TemplatePickerStep({ templates, isLoading, isDeploying = false, onNext }: TemplatePickerStepProps) {
  const { locale } = useLocaleStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('');
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

  const canProceed = selectedTemplate && siteName.length >= 2 && !siteNameError;

  const handleNext = () => {
    if (!canProceed) return;
    const error = validateSiteName(siteName);
    if (error) {
      setSiteNameError(error);
      return;
    }
    onNext({ templateId: selectedTemplate!, siteName });
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
            ? `https://username.github.io/${siteName || '{사이트이름}'}에 배포됩니다`
            : `Will be deployed to https://username.github.io/${siteName || '{site-name}'}`}
        </p>
      </div>

      {/* Deploy button */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed || isDeploying} size="lg">
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {locale === 'ko' ? '배포 진행 중...' : 'Deploying...'}
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              {locale === 'ko' ? '이 템플릿으로 배포' : 'Deploy This Template'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { DemoEnvPreview } from './demo-env-preview';
import { DemoChecklistPreview } from './demo-checklist-preview';
import { ScrollReveal } from './scroll-reveal';
import { templates } from '@/data/templates';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

const DemoMapPreview = dynamic(
  () => import('./demo-map-preview').then((mod) => ({ default: mod.DemoMapPreview })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border bg-card h-full animate-pulse flex items-center justify-center">
        <span className="text-sm text-muted-foreground">로딩 중...</span>
      </div>
    ),
  }
);

export function InteractiveDemo() {
  return (
    <section className="container py-20">
      <ScrollReveal>
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">인터랙티브 데모</Badge>
          <h2 className="text-3xl font-bold mb-4">
            로그인 없이 미리 체험하세요
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            SetLog가 제공하는 핵심 기능을 직접 확인해 보세요
          </p>
        </div>
      </ScrollReveal>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {/* Service Map - 2x2 */}
        <ScrollReveal className="md:col-span-2 md:row-span-2 min-h-[300px]" delay={0.1}>
          <DemoMapPreview />
        </ScrollReveal>

        {/* Env Preview */}
        <ScrollReveal className="min-h-[250px]" delay={0.2}>
          <DemoEnvPreview />
        </ScrollReveal>

        {/* Checklist Preview */}
        <ScrollReveal className="min-h-[250px]" delay={0.3}>
          <DemoChecklistPreview />
        </ScrollReveal>

        {/* Template cards */}
        <ScrollReveal className="md:col-span-3" delay={0.4}>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">프로젝트 템플릿</h4>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="flex-shrink-0 w-48 rounded-lg border bg-muted/50 p-3 hover:border-primary/50 transition-colors cursor-default"
                >
                  <div className="font-medium text-sm mb-1">{tmpl.name_ko}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {tmpl.description_ko}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.services.slice(0, 3).map((svc) => (
                      <Badge key={svc} variant="outline" className="text-[10px] px-1.5 py-0">
                        {svc}
                      </Badge>
                    ))}
                    {tmpl.services.length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        +{tmpl.services.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

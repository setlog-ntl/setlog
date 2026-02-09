'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Globe, BookOpen, Github, Clock, Copy, Check } from 'lucide-react';
import { allCategoryLabels, allCategoryEmojis, domainLabels, domainIcons } from '@/lib/constants/service-filters';
import { DifficultyBadge, DxScoreBadge, FreeTierBadge, VendorLockInBadge, CostEstimateBadge } from './service-badges';
import type {
  Service, ServiceGuide, ServiceCostTier, ServiceDependency,
  ServiceCategory, ServiceDomain, DependencyType,
} from '@/types';

interface ServiceDetailClientProps {
  service: Service;
  guide: ServiceGuide | null;
  costTiers: ServiceCostTier[];
  dependencies: (ServiceDependency & { depends_on_service: Service })[];
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-muted rounded-md p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

const depTypeLabels: Record<DependencyType, string> = {
  alternative: '대안 서비스',
  recommended: '추천 함께 사용',
  optional: '선택적 통합',
  required: '필수 연동',
};

export function ServiceDetailClient({ service, guide, costTiers, dependencies }: ServiceDetailClientProps) {
  const hasGuide = guide && (guide.quick_start || guide.setup_steps?.length > 0);
  const hasTips = guide && (guide.common_pitfalls?.length > 0 || guide.integration_tips?.length > 0 || guide.pros?.length > 0 || guide.cons?.length > 0);

  // Group dependencies by type
  const depsByType = dependencies.reduce<Record<string, (ServiceDependency & { depends_on_service: Service })[]>>((acc, dep) => {
    const key = dep.dependency_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(dep);
    return acc;
  }, {});

  const availableTabs = [
    { value: 'overview', label: '개요' },
    ...(hasGuide ? [{ value: 'quickstart', label: '빠른 시작' }] : []),
    ...(costTiers.length > 0 ? [{ value: 'pricing', label: '가격' }] : []),
    ...(dependencies.length > 0 ? [{ value: 'related', label: '대안 & 연관' }] : []),
    ...(hasTips ? [{ value: 'tips', label: '활용 팁' }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/services">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          카탈로그로 돌아가기
        </Link>
      </Button>

      {/* Service header */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
          {allCategoryEmojis[service.category as ServiceCategory] || '🔧'}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{service.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary">
              {allCategoryLabels[service.category as ServiceCategory] || service.category}
            </Badge>
            {service.domain && (
              <Badge variant="outline">
                {domainIcons[service.domain as ServiceDomain]} {domainLabels[service.domain as ServiceDomain]}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-3">
            {service.description_ko || service.description}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetaCard label="난이도">
              <DifficultyBadge level={service.difficulty_level} />
            </MetaCard>
            <MetaCard label="DX 점수">
              <DxScoreBadge score={service.dx_score} />
            </MetaCard>
            <MetaCard label="무료 플랜">
              <FreeTierBadge quality={service.free_tier_quality} />
            </MetaCard>
            <MetaCard label="셋업 시간">
              {service.setup_time_minutes ? (
                <span className="text-sm flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  ~{service.setup_time_minutes}분
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </MetaCard>
            <MetaCard label="벤더 종속성">
              <VendorLockInBadge risk={service.vendor_lock_in_risk} />
            </MetaCard>
          </div>

          {/* Cost estimate */}
          {service.monthly_cost_estimate && Object.keys(service.monthly_cost_estimate).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">월 예상 비용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(service.monthly_cost_estimate).map(([tier, cost]) => (
                    <div key={tier} className="text-sm">
                      <span className="text-muted-foreground">{tier}:</span>{' '}
                      <span className="font-medium">{cost}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compatibility */}
          {service.compatibility && (service.compatibility.framework?.length || service.compatibility.language?.length) ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">호환성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.compatibility.framework && service.compatibility.framework.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground mb-1 block">프레임워크</span>
                    <div className="flex flex-wrap gap-1.5">
                      {service.compatibility.framework.map((fw) => (
                        <Badge key={fw} variant="outline" className="text-xs">{fw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {service.compatibility.language && service.compatibility.language.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground mb-1 block">언어</span>
                    <div className="flex flex-wrap gap-1.5">
                      {service.compatibility.language.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Official SDKs */}
          {service.official_sdks && Object.keys(service.official_sdks).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">공식 SDK</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(service.official_sdks).map(([name, url]) => (
                    <Button key={name} variant="outline" size="sm" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {name}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">태그</h3>
              <div className="flex flex-wrap gap-1.5">
                {service.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* External links */}
          <Separator />
          <div className="flex flex-wrap gap-3">
            {service.website_url && (
              <Button variant="outline" asChild>
                <a href={service.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-1.5 h-4 w-4" />
                  웹사이트
                </a>
              </Button>
            )}
            {service.docs_url && (
              <Button variant="outline" asChild>
                <a href={service.docs_url} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="mr-1.5 h-4 w-4" />
                  문서
                </a>
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Quick Start */}
        {hasGuide && (
          <TabsContent value="quickstart" className="space-y-6 mt-6">
            {guide.quick_start && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">빠른 시작</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{guide.quick_start}</p>
                </CardContent>
              </Card>
            )}

            {guide.setup_steps && guide.setup_steps.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">설정 단계</h3>
                <Accordion type="multiple" className="space-y-2">
                  {guide.setup_steps.map((step, i) => (
                    <AccordionItem key={i} value={`step-${i}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-sm">
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {step.step}
                          </Badge>
                          {step.title_ko || step.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {step.description_ko || step.description}
                        </p>
                        {step.code_snippet && (
                          <CodeBlock code={step.code_snippet} />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {guide.code_examples && Object.keys(guide.code_examples).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">코드 예제</h3>
                <div className="space-y-4">
                  {Object.entries(guide.code_examples).map(([title, code]) => (
                    <div key={title}>
                      <p className="text-sm font-medium mb-2">{title}</p>
                      <CodeBlock code={code} language="typescript" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {/* Tab 3: Pricing */}
        {costTiers.length > 0 && (
          <TabsContent value="pricing" className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">티어</th>
                    <th className="text-left py-3 px-4 font-medium">월 가격</th>
                    <th className="text-left py-3 px-4 font-medium">연 가격</th>
                    <th className="text-left py-3 px-4 font-medium">주요 기능</th>
                    <th className="text-left py-3 px-4 font-medium">제한사항</th>
                    <th className="text-left py-3 px-4 font-medium">추천 대상</th>
                  </tr>
                </thead>
                <tbody>
                  {costTiers.map((tier) => {
                    const isFree = tier.price_monthly === '$0' || tier.price_monthly === '무료' || tier.tier_name.toLowerCase().includes('free');
                    return (
                      <tr key={tier.id} className={`border-b ${isFree ? 'bg-green-50/50' : ''}`}>
                        <td className="py-3 px-4 font-medium">
                          {tier.tier_name_ko || tier.tier_name}
                          {isFree && <Badge className="ml-2 text-xs" variant="secondary">무료</Badge>}
                        </td>
                        <td className="py-3 px-4">{tier.price_monthly || '-'}</td>
                        <td className="py-3 px-4">{tier.price_yearly || '-'}</td>
                        <td className="py-3 px-4">
                          <ul className="space-y-1">
                            {tier.features?.map((f, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span>{f.included ? '✅' : '❌'}</span>
                                <span className="text-xs">{f.feature_ko || f.feature}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="py-3 px-4">
                          {tier.limits && Object.keys(tier.limits).length > 0 ? (
                            <ul className="space-y-0.5">
                              {Object.entries(tier.limits).map(([k, v]) => (
                                <li key={k} className="text-xs text-muted-foreground">
                                  {k}: {v}
                                </li>
                              ))}
                            </ul>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {tier.recommended_for || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        )}

        {/* Tab 4: Related & Alternative Services */}
        {dependencies.length > 0 && (
          <TabsContent value="related" className="space-y-6 mt-6">
            {(Object.entries(depsByType) as [DependencyType, typeof dependencies][]).map(([type, deps]) => (
              <div key={type}>
                <h3 className="text-sm font-medium mb-3">{depTypeLabels[type] || type}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {deps.map((dep) => (
                    <Card key={dep.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Link
                              href={`/services/${dep.depends_on_service?.slug}`}
                              className="font-medium text-sm hover:text-primary transition-colors"
                            >
                              {dep.depends_on_service?.name || 'Unknown'}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dep.description_ko || dep.description}
                            </p>
                          </div>
                          {dep.depends_on_service?.website_url && (
                            <Button variant="ghost" size="sm" asChild className="shrink-0">
                              <a href={dep.depends_on_service.website_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        )}

        {/* Tab 5: Tips */}
        {hasTips && (
          <TabsContent value="tips" className="space-y-6 mt-6">
            {/* Pros & Cons */}
            {(guide.pros?.length > 0 || guide.cons?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guide.pros && guide.pros.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-700">장점</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {guide.pros.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="shrink-0">✅</span>
                            {item.text_ko || item.text}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {guide.cons && guide.cons.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-700">단점</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {guide.cons.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="shrink-0">❌</span>
                            {item.text_ko || item.text}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Common pitfalls */}
            {guide.common_pitfalls && guide.common_pitfalls.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">흔한 실수</h3>
                <Accordion type="multiple" className="space-y-2">
                  {guide.common_pitfalls.map((pitfall, i) => (
                    <AccordionItem key={i} value={`pitfall-${i}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-sm">
                        {pitfall.title_ko || pitfall.title}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">문제:</span> {pitfall.problem}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">해결:</span> {pitfall.solution}
                        </p>
                        {pitfall.code && <CodeBlock code={pitfall.code} />}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Integration tips */}
            {guide.integration_tips && guide.integration_tips.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">통합 팁</h3>
                <div className="space-y-3">
                  {guide.integration_tips.map((tip, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {tip.with_service_slug}
                        </Badge>
                        <p className="text-sm">{tip.tip_ko || tip.tip}</p>
                        {tip.code && <CodeBlock code={tip.code} />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function MetaCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <span className="text-xs text-muted-foreground block mb-1">{label}</span>
      {children}
    </div>
  );
}

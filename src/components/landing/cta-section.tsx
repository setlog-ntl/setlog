'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const plans = [
  {
    name: 'Free',
    price: '₩0',
    period: '/월',
    description: '개인 프로젝트에 적합',
    features: ['프로젝트 3개', '서비스 무제한', '환경변수 관리', '서비스 맵'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₩9,900',
    period: '/월',
    description: '전문 개발자를 위한',
    features: ['프로젝트 무제한', '팀 협업', 'API 토큰', '우선 지원', '감사 로그'],
    highlighted: true,
  },
  {
    name: 'Team',
    price: '₩29,900',
    period: '/월',
    description: '팀과 조직을 위한',
    features: ['모든 Pro 기능', '팀원 무제한', 'RBAC 권한 관리', 'SSO', '전용 지원'],
    highlighted: false,
  },
];

export function CtaSection() {
  return (
    <section className="container py-20">
      {/* Pricing cards */}
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">합리적인 가격</h2>
          <p className="text-muted-foreground text-lg">
            무료로 시작하고, 필요할 때 업그레이드하세요
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
        {plans.map((plan, i) => (
          <ScrollReveal key={plan.name} delay={i * 0.1}>
            <div
              className={`rounded-2xl border p-6 flex flex-col h-full ${
                plan.highlighted
                  ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02] relative'
                  : 'bg-card'
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  인기
                </Badge>
              )}
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? 'default' : 'outline'}
                className="w-full"
                asChild
              >
                <Link href="/signup">시작하기</Link>
              </Button>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Final CTA */}
      <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-muted-foreground text-lg mb-8">
            무료로 3개 프로젝트까지 관리할 수 있습니다.
            <br />
            신용카드 없이 바로 시작하세요.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              무료로 시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
}

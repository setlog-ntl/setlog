'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { GradientBg } from './gradient-bg';
import { ScrollReveal } from './scroll-reveal';

const FlowArchitectureDiagram = dynamic(
  () => import('./flow-architecture-diagram').then((mod) => ({ default: mod.FlowArchitectureDiagram })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] md:h-[450px] lg:h-[550px] rounded-2xl bg-muted/50 animate-pulse flex items-center justify-center">
        <span className="text-sm text-muted-foreground">다이어그램 로딩 중...</span>
      </div>
    ),
  }
);

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <GradientBg />
      <div className="container py-16 md:py-24">
        {/* Top: Text content (centered) */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
              아키텍처 시각화 플랫폼
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              개발 인프라 연결을{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                한눈에 파악
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              GitHub부터 데이터베이스까지, 프로젝트의 모든 서비스 연결 상태와
              환경변수를 시각화하고 안전하게 관리하세요.
            </p>
          </div>
        </ScrollReveal>

        {/* Middle: Full-width architecture diagram */}
        <ScrollReveal delay={0.15}>
          <FlowArchitectureDiagram />
        </ScrollReveal>

        {/* Bottom: CTA + Trust indicators */}
        <ScrollReveal delay={0.3}>
          <div className="text-center mt-10">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Button size="lg" asChild>
                <Link href="/signup">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#interactive-demo">
                  인터랙티브 데모
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">✓ 무료 플랜</span>
              <span className="flex items-center gap-1">✓ 카드 불필요</span>
              <span className="flex items-center gap-1">✓ AES-256 암호화</span>
              <span className="flex items-center gap-1">✓ 실시간 연결 확인</span>
            </div>
            <div className="mt-4">
              <Link
                href="/guides/github"
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                처음이신가요? GitHub 설정부터 시작하기 →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { GradientBg } from './gradient-bg';
import { ScrollReveal } from './scroll-reveal';

const HeroDiagram = dynamic(
  () => import('./hero-diagram').then((mod) => ({ default: mod.HeroDiagram })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl bg-muted/50 animate-pulse flex items-center justify-center">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <ScrollReveal direction="left">
            <div className="max-w-lg">
              <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
                설정 관리 플랫폼
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                서비스 연결,{' '}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                  한눈에 관리
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                프로젝트에 연결된 외부 서비스의 API 키, 환경변수, 등록 ID를
                시각화하고 안전하게 관리하세요.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    무료로 시작하기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/services">서비스 카탈로그</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">✓ 무료 플랜</span>
                <span className="flex items-center gap-1">✓ 카드 불필요</span>
                <span className="flex items-center gap-1">✓ AES-256 암호화</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Interactive Diagram */}
          <ScrollReveal direction="right" delay={0.2}>
            <HeroDiagram />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

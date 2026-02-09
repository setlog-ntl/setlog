'use client';

import dynamic from 'next/dynamic';
import { ConnectionDashboard } from './connection-dashboard';
import { ScrollReveal } from './scroll-reveal';
import { Badge } from '@/components/ui/badge';

const FlowComparison = dynamic(
  () => import('./flow-comparison').then((mod) => ({ default: mod.FlowComparison })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border bg-card h-[380px] animate-pulse flex items-center justify-center">
        <span className="text-sm text-muted-foreground">로딩 중...</span>
      </div>
    ),
  }
);

export function InteractiveDemo() {
  return (
    <section id="interactive-demo" className="container py-20">
      <ScrollReveal>
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">인터랙티브 데모</Badge>
          <h2 className="text-3xl font-bold mb-4">
            간단한 블로그부터 복잡한 SaaS까지
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            프로젝트 규모에 따라 달라지는 서비스 연결 구조를 비교하고,
            연결 상태를 대시보드로 확인하세요.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Flow Comparison (Tabs) */}
        <ScrollReveal delay={0.1}>
          <FlowComparison />
        </ScrollReveal>

        {/* Connection Dashboard */}
        <ScrollReveal delay={0.2}>
          <ConnectionDashboard />
        </ScrollReveal>
      </div>
    </section>
  );
}

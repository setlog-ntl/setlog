'use client';

import { ScrollReveal } from './scroll-reveal';
import { AnimatedCounter } from './animated-counter';

const stats = [
  { value: 20, suffix: '+', label: '지원 서비스' },
  { value: 116, suffix: '+', label: '체크리스트 항목' },
  { value: 5, suffix: '', label: '프로젝트 템플릿' },
  { value: 256, suffix: '', label: '비트 암호화' },
];

export function StatsSection() {
  return (
    <section className="bg-muted/50 py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold font-mono mb-2">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

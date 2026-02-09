'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ScrollReveal } from './scroll-reveal';
import { FolderPlus, Puzzle, Download } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: FolderPlus,
    title: '프로젝트 생성',
    description: '새 프로젝트를 만들거나 템플릿에서 시작하세요. SaaS, AI 앱 등 5종 템플릿이 준비되어 있습니다.',
  },
  {
    number: '2',
    icon: Puzzle,
    title: '서비스 추가',
    description: '20개 이상의 서비스 카탈로그에서 선택하고, 단계별 한국어 체크리스트를 따라가세요.',
  },
  {
    number: '3',
    icon: Download,
    title: '환경변수 관리',
    description: 'API 키를 안전하게 저장하고, .env 파일을 한 클릭으로 다운로드하세요.',
  },
];

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-muted/50 py-20">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">이렇게 사용하세요</h2>
            <p className="text-muted-foreground text-lg">3단계로 간단하게</p>
          </div>
        </ScrollReveal>

        <div className="relative max-w-4xl mx-auto">
          {/* Connection line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-[2px]">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="currentColor"
                className="text-border"
                strokeWidth="2"
                strokeDasharray="8 6"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="text-center relative">
                    {/* Number circle */}
                    <div className="relative mx-auto mb-6 w-[104px] h-[104px]">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5" />
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-2xl font-bold text-primary-foreground">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Icon + Text */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

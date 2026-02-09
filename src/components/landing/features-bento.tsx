'use client';

import { Map, Key, CheckCircle2, Layers } from 'lucide-react';
import { FeatureCard } from './feature-card';
import { ScrollReveal } from './scroll-reveal';

function ServiceMapVisual() {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Animated connection lines */}
      <div className="relative w-32 h-24">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-primary/40 animate-pulse" />
        </div>
        {[
          'top-0 left-0',
          'top-0 right-0',
          'bottom-0 left-0',
          'bottom-0 right-0',
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 animate-float`}
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 96">
          <line x1="16" y1="16" x2="54" y2="42" className="stroke-border" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="112" y1="16" x2="74" y2="42" className="stroke-border" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="16" y1="80" x2="54" y2="54" className="stroke-border" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="112" y1="80" x2="74" y2="54" className="stroke-border" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
      </div>
    </div>
  );
}

function EnvVarVisual() {
  return (
    <div className="font-mono text-[10px] text-left px-6 space-y-1 text-muted-foreground">
      <div><span className="text-green-600 dark:text-green-400">SUPABASE_URL</span>=https://...</div>
      <div><span className="text-yellow-600 dark:text-yellow-400">STRIPE_KEY</span>=<span className="text-muted-foreground/50">••••••••••</span></div>
      <div><span className="text-blue-600 dark:text-blue-400">OPENAI_KEY</span>=<span className="text-muted-foreground/50">••••••••••</span></div>
      <div className="flex items-center gap-1 mt-2 text-primary">
        <Key className="w-3 h-3" />
        <span className="text-[9px]">AES-256-GCM</span>
      </div>
    </div>
  );
}

function ChecklistVisual() {
  return (
    <div className="px-6 space-y-2">
      {['프로젝트 생성', 'API 키 발급', 'SDK 설치'].map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <CheckCircle2 className={`w-4 h-4 ${i < 2 ? 'text-green-500' : 'text-muted-foreground/30'}`} />
          <span className={i < 2 ? 'text-muted-foreground line-through' : ''}>{item}</span>
        </div>
      ))}
      <div className="h-1.5 rounded-full bg-muted mt-2">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-green-500 to-green-400" />
      </div>
    </div>
  );
}

function TemplateVisual() {
  return (
    <div className="flex justify-center -space-x-4 group-hover:space-x-1 transition-all duration-500">
      {['SaaS', 'AI 앱', '블로그'].map((name, i) => (
        <div
          key={i}
          className="w-20 h-24 rounded-lg border bg-card shadow-sm flex items-center justify-center text-xs font-medium transition-transform duration-300"
          style={{ transform: `rotate(${(i - 1) * 6}deg)`, zIndex: 3 - i }}
        >
          {name}
        </div>
      ))}
    </div>
  );
}

export function FeaturesBento() {
  return (
    <section className="container py-20">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">핵심 기능</h2>
          <p className="text-muted-foreground text-lg">
            프로젝트 설정에 필요한 모든 것을 한 곳에서
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {/* Service Map - 2x2 */}
        <ScrollReveal className="md:col-span-2 md:row-span-2" delay={0.1}>
          <FeatureCard
            icon={<Map className="w-4 h-4 text-primary" />}
            title="서비스 맵 시각화"
            description="프로젝트의 서비스 아키텍처를 인터랙티브 다이어그램으로 시각화합니다. 팀원과 쉽게 공유하고, 의존성을 한눈에 파악하세요."
            visual={<ServiceMapVisual />}
            className="h-full"
          />
        </ScrollReveal>

        {/* Checklist */}
        <ScrollReveal delay={0.2}>
          <FeatureCard
            icon={<CheckCircle2 className="w-4 h-4 text-primary" />}
            title="연결 체크리스트"
            description="서비스별 단계별 한국어 가이드로 초보자도 쉽게 연결할 수 있습니다."
            visual={<ChecklistVisual />}
          />
        </ScrollReveal>

        {/* Templates */}
        <ScrollReveal delay={0.3}>
          <FeatureCard
            icon={<Layers className="w-4 h-4 text-primary" />}
            title="프로젝트 템플릿"
            description="SaaS, AI 앱 등 검증된 템플릿으로 빠르게 시작하세요."
            visual={<TemplateVisual />}
          />
        </ScrollReveal>

        {/* Env Vars - full width */}
        <ScrollReveal className="md:col-span-3" delay={0.4}>
          <FeatureCard
            icon={<Key className="w-4 h-4 text-primary" />}
            title="환경변수 관리"
            description="API 키와 시크릿을 AES-256 암호화로 안전하게 저장하고, .env 파일을 한 클릭으로 다운로드하세요. 개발/스테이징/프로덕션 환경별로 분리 관리합니다."
            visual={<EnvVarVisual />}
            badge="AES-256"
            className="md:flex-row"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}

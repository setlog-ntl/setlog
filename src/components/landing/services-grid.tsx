'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ScrollReveal } from './scroll-reveal';
import type { ServiceDomain } from '@/types';

interface ServiceEntry {
  name: string;
  category: string;
  domain: ServiceDomain;
  emoji: string;
  difficulty: string;
  freeTier: boolean;
}

const SERVICES: ServiceEntry[] = [
  { name: 'Supabase', category: 'database', domain: 'infrastructure', emoji: '🗄️', difficulty: 'beginner', freeTier: true },
  { name: 'Firebase', category: 'database', domain: 'infrastructure', emoji: '🔥', difficulty: 'beginner', freeTier: true },
  { name: 'Vercel', category: 'deploy', domain: 'infrastructure', emoji: '▲', difficulty: 'beginner', freeTier: true },
  { name: 'Netlify', category: 'deploy', domain: 'infrastructure', emoji: '🌐', difficulty: 'beginner', freeTier: true },
  { name: 'Railway', category: 'deploy', domain: 'infrastructure', emoji: '🚂', difficulty: 'beginner', freeTier: true },
  { name: 'Stripe', category: 'payment', domain: 'business', emoji: '💳', difficulty: 'intermediate', freeTier: true },
  { name: 'Lemon Squeezy', category: 'payment', domain: 'business', emoji: '🍋', difficulty: 'beginner', freeTier: true },
  { name: 'Clerk', category: 'auth', domain: 'backend', emoji: '🔐', difficulty: 'beginner', freeTier: true },
  { name: 'NextAuth', category: 'auth', domain: 'backend', emoji: '🔑', difficulty: 'intermediate', freeTier: true },
  { name: 'Resend', category: 'email', domain: 'communication', emoji: '📧', difficulty: 'beginner', freeTier: true },
  { name: 'SendGrid', category: 'email', domain: 'communication', emoji: '✉️', difficulty: 'intermediate', freeTier: true },
  { name: 'OpenAI', category: 'ai', domain: 'ai_ml', emoji: '🤖', difficulty: 'beginner', freeTier: false },
  { name: 'Anthropic', category: 'ai', domain: 'ai_ml', emoji: '🧠', difficulty: 'beginner', freeTier: false },
  { name: 'Cloudinary', category: 'storage', domain: 'infrastructure', emoji: '☁️', difficulty: 'beginner', freeTier: true },
  { name: 'Sentry', category: 'monitoring', domain: 'devtools', emoji: '📊', difficulty: 'beginner', freeTier: true },
  { name: 'PostHog', category: 'monitoring', domain: 'devtools', emoji: '🦔', difficulty: 'beginner', freeTier: true },
  { name: 'PlanetScale', category: 'database', domain: 'infrastructure', emoji: '🪐', difficulty: 'intermediate', freeTier: true },
  { name: 'Neon', category: 'database', domain: 'infrastructure', emoji: '⚡', difficulty: 'beginner', freeTier: true },
  { name: 'Uploadthing', category: 'storage', domain: 'infrastructure', emoji: '📁', difficulty: 'beginner', freeTier: true },
  { name: 'AWS S3', category: 'storage', domain: 'infrastructure', emoji: '🪣', difficulty: 'advanced', freeTier: true },
];

const DOMAIN_FILTERS: { label: string; value: ServiceDomain | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '인프라', value: 'infrastructure' },
  { label: '백엔드', value: 'backend' },
  { label: '개발도구', value: 'devtools' },
  { label: '커뮤니케이션', value: 'communication' },
  { label: '비즈니스', value: 'business' },
  { label: 'AI', value: 'ai_ml' },
];

const categoryColorMap: Record<string, string> = {
  database: 'border-blue-300 dark:border-blue-700',
  deploy: 'border-green-300 dark:border-green-700',
  payment: 'border-orange-300 dark:border-orange-700',
  auth: 'border-purple-300 dark:border-purple-700',
  email: 'border-yellow-300 dark:border-yellow-700',
  ai: 'border-indigo-300 dark:border-indigo-700',
  storage: 'border-cyan-300 dark:border-cyan-700',
  monitoring: 'border-pink-300 dark:border-pink-700',
  other: 'border-gray-300 dark:border-gray-700',
};

export function ServicesGrid() {
  const [filter, setFilter] = useState<ServiceDomain | 'all'>('all');
  const prefersReducedMotion = useReducedMotion();

  const filtered = filter === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.domain === filter);

  return (
    <section className="container py-20">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">지원 서비스</h2>
          <p className="text-muted-foreground text-lg">
            인기 있는 20개 서비스를 모두 지원합니다
          </p>
        </div>
      </ScrollReveal>

      {/* Filter tabs */}
      <ScrollReveal>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DOMAIN_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((svc) => (
            <motion.div
              key={svc.name}
              layout={!prefersReducedMotion}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`aspect-square rounded-xl border-2 bg-card p-3 flex flex-col items-center justify-center gap-2 cursor-default hover:-translate-y-1 hover:shadow-md transition-all ${
                categoryColorMap[svc.category] || categoryColorMap.other
              }`}
            >
              <span className="text-2xl">{svc.emoji}</span>
              <span className="font-medium text-sm text-center">{svc.name}</span>
              <div className="flex gap-1">
                {svc.freeTier && (
                  <span className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                    Free
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

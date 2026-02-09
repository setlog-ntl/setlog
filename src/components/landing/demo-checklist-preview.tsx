'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

const CHECKLIST_ITEMS = [
  { title: 'Supabase 프로젝트 생성', done: true },
  { title: 'API 키 발급 및 저장', done: true },
  { title: 'RLS 정책 설정', done: true },
  { title: '클라이언트 SDK 설치', done: false },
  { title: '환경변수 설정', done: false },
];

export function DemoChecklistPreview() {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (prefersReducedMotion) {
            setVisibleCount(CHECKLIST_ITEMS.length);
          } else {
            CHECKLIST_ITEMS.forEach((_, i) => {
              setTimeout(() => setVisibleCount(i + 1), (i + 1) * 400);
            });
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const completedCount = CHECKLIST_ITEMS.filter((item) => item.done).length;
  const progress = (completedCount / CHECKLIST_ITEMS.length) * 100;

  return (
    <div ref={ref} className="rounded-xl border bg-card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">🗄️ Supabase 연결</h4>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{CHECKLIST_ITEMS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={
              i < visibleCount
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -10 }
            }
            transition={{ duration: 0.3 }}
          >
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span
              className={`text-xs ${
                item.done
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              }`}
            >
              {item.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

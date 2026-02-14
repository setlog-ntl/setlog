'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Download } from 'lucide-react';
import type { SiteConfig } from '@/lib/config';
import { useLocale } from '@/lib/i18n';

interface Props {
  config: SiteConfig;
}

function useTypingAnimation(texts: string[], speed = 80, pause = 2000) {
  const stateRef = useRef({
    displayed: '',
    textIndex: 0,
    charIndex: 0,
    deleting: false,
  });
  const listenersRef = useRef(new Set<() => void>());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  const subscribe = useCallback((cb: () => void) => {
    listenersRef.current.add(cb);
    return () => { listenersRef.current.delete(cb); };
  }, []);

  const notify = useCallback(() => {
    listenersRef.current.forEach((cb) => cb());
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    const current = texts[s.textIndex];

    if (!s.deleting && s.charIndex <= current.length) {
      s.displayed = current.slice(0, s.charIndex);
      s.charIndex++;
      notify();
      timerRef.current = setTimeout(tick, speed);
    } else if (!s.deleting && s.charIndex > current.length) {
      s.deleting = true;
      timerRef.current = setTimeout(tick, pause);
    } else if (s.deleting && s.charIndex > 0) {
      s.charIndex--;
      s.displayed = current.slice(0, s.charIndex);
      notify();
      timerRef.current = setTimeout(tick, speed / 2);
    } else if (s.deleting && s.charIndex === 0) {
      s.deleting = false;
      s.textIndex = (s.textIndex + 1) % texts.length;
      timerRef.current = setTimeout(tick, speed);
    }
  }, [texts, speed, pause, notify]);

  // Start animation on first subscribe (client only)
  if (typeof window !== 'undefined' && !startedRef.current) {
    startedRef.current = true;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      stateRef.current.displayed = texts[0];
    } else {
      setTimeout(tick, speed);
    }
  }

  const getSnapshot = useCallback(() => stateRef.current.displayed, []);
  const getServerSnapshot = useCallback(() => '', []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function HeroSection({ config }: Props) {
  const { locale, t } = useLocale();
  const name = locale === 'en' && config.nameEn ? config.nameEn : config.name;
  const taglineRaw = locale === 'en' && config.taglineEn ? config.taglineEn : config.tagline;

  const taglines = taglineRaw.includes('|')
    ? taglineRaw.split('|').map((s) => s.trim())
    : [taglineRaw];
  const typed = useTypingAnimation(taglines);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(75,85,99,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }}
    >
      <motion.div
        className="text-center max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono text-green-400 dark:text-green-400 text-sm mb-4">
          $ whoami
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {name}
        </h1>
        <p className="text-xl text-gray-400 dark:text-gray-400 mb-2 h-8">
          {typed}
          <span className="animate-pulse ml-0.5">|</span>
        </p>
      </motion.div>

      <motion.div
        className="flex items-center gap-4 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {config.githubUsername && (
          <a
            href={`https://github.com/${config.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        )}
        {config.linkedinUrl && (
          <a
            href={config.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        )}
        {config.email && (
          <a
            href={`mailto:${config.email}`}
            aria-label="Email"
            className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <Mail className="w-5 h-5" />
          </a>
        )}
        {config.resumeUrl && (
          <a
            href={config.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            {t('hero.resume')}
          </a>
        )}
      </motion.div>
    </section>
  );
}

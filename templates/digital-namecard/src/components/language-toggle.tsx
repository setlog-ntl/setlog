'use client';

import { useLocale } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      <Globe className="w-3.5 h-3.5" />
      {locale === 'ko' ? 'EN' : '한국어'}
    </button>
  );
}

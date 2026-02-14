'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';
import { LanguageToggle } from './language-toggle';

const sectionIds = ['hero', 'about', 'projects', 'experience', 'contact'];

const sectionKeys: Record<string, string> = {
  hero: 'nav.home',
  about: 'nav.about',
  projects: 'nav.projects',
  experience: 'nav.experience',
  contact: 'nav.contact',
};

export function NavHeader() {
  const [active, setActive] = useState('hero');
  const { t } = useLocale();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-gray-950/80 dark:bg-gray-950/80 border-b border-gray-800/50">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-center gap-1">
        {sectionIds.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              active === id
                ? 'text-white bg-gray-800'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t(sectionKeys[id])}
          </a>
        ))}
        <LanguageToggle />
      </nav>
    </header>
  );
}

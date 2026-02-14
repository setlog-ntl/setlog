'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

export type Locale = 'ko' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  ko: {
    'nav.home': '홈',
    'nav.about': '소개',
    'nav.projects': '프로젝트',
    'nav.experience': '경력',
    'nav.contact': '연락처',
    'hero.resume': '이력서 다운로드',
    'about.title': '소개',
    'about.skills': '기술 스택',
    'level.beginner': '입문',
    'level.intermediate': '중급',
    'level.advanced': '고급',
    'projects.title': '프로젝트',
    'experience.title': '경력',
    'blog.title': '블로그',
    'contact.title': '함께 일하고 싶다면',
    'contact.desc': '새로운 프로젝트나 협업 제안은 언제든 환영합니다.',
    'contact.email': '이메일 보내기',
    'github.alt': 'GitHub 기여 그래프',
    'theme.light': '라이트 모드로 전환',
    'theme.dark': '다크 모드로 전환',
    'footer.powered': 'Powered by',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',
    'hero.resume': 'Download Resume',
    'about.title': 'About',
    'about.skills': 'Tech Stack',
    'level.beginner': 'Beginner',
    'level.intermediate': 'Intermediate',
    'level.advanced': 'Advanced',
    'projects.title': 'Projects',
    'experience.title': 'Experience',
    'blog.title': 'Blog',
    'contact.title': "Let's Work Together",
    'contact.desc': 'Open to new projects and collaboration opportunities.',
    'contact.email': 'Send Email',
    'github.alt': 'GitHub Contribution Graph',
    'theme.light': 'Switch to light mode',
    'theme.dark': 'Switch to dark mode',
    'footer.powered': 'Powered by',
  },
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'ko',
  setLocale: () => {},
  t: (k) => k,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved === 'ko' || saved === 'en') {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? key,
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

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
    'contact.call': '전화하기',
    'contact.email': '이메일 보내기',
    'contact.map': '지도에서 보기',
    'contact.website': '웹사이트 방문',
    'qr.hint': 'QR 코드를 스캔하면 연락처가 저장됩니다',
    'save.contact': '연락처에 저장',
    'theme.light': '라이트 모드로 전환',
    'theme.dark': '다크 모드로 전환',
    'footer.powered': 'Powered by',
  },
  en: {
    'contact.call': 'Call',
    'contact.email': 'Send email',
    'contact.map': 'View on map',
    'contact.website': 'Visit website',
    'qr.hint': 'Scan QR code to save contact',
    'save.contact': 'Save Contact',
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

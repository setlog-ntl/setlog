'use client';

import type { SiteConfig } from '@/lib/config';
import type { ThemePreset } from '@/lib/themes';
import { useLocale } from '@/lib/i18n';

interface Props {
  config: SiteConfig;
  theme: ThemePreset;
}

export function ProfileSection({ config, theme }: Props) {
  const { locale } = useLocale();
  const name = locale === 'en' && config.siteNameEn ? config.siteNameEn : config.siteName;
  const bio = locale === 'en' && config.bioEn ? config.bioEn : config.bio;

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {config.avatarUrl ? (
        <img
          src={config.avatarUrl}
          alt={name}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover ring-2 ring-white/30"
        />
      ) : (
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ring-2 ring-white/30"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
          aria-label={name}
        >
          {initials}
        </div>
      )}
      <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
        {name}
      </h1>
      <p className="text-base max-w-xs" style={{ color: theme.textMuted }}>
        {bio}
      </p>
    </div>
  );
}

'use client';

import type { SiteConfig } from '@/lib/config';
import { useLocale } from '@/lib/i18n';

interface Props {
  config: SiteConfig;
}

export function ProfileCard({ config }: Props) {
  const { locale } = useLocale();
  const name = locale === 'en' && config.nameEn ? config.nameEn : config.name;
  const title = locale === 'en' && config.titleEn ? config.titleEn : config.title;
  const company = locale === 'en' && config.companyEn ? config.companyEn : config.company;

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center text-center gap-2">
      {config.avatarUrl ? (
        <img
          src={config.avatarUrl}
          alt={name}
          width={80}
          height={80}
          className="w-20 h-20 rounded-full object-cover"
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white"
          style={{ backgroundColor: config.accentColor }}
          aria-label={name}
        >
          {initials}
        </div>
      )}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        {name}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        {title}
      </p>
      {company && (
        <p className="text-base text-gray-500">{company}</p>
      )}
    </div>
  );
}

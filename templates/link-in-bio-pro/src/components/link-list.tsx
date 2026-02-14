'use client';

import {
  Youtube,
  PenLine,
  Briefcase,
  ShoppingBag,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import type { LinkItem } from '@/lib/config';
import type { ThemePreset } from '@/lib/themes';
import { useLocale } from '@/lib/i18n';

const iconMap: Record<string, LucideIcon> = {
  youtube: Youtube,
  'pen-line': PenLine,
  briefcase: Briefcase,
  'shopping-bag': ShoppingBag,
};

interface Props {
  links: LinkItem[];
  theme: ThemePreset;
}

export function LinkList({ links, theme }: Props) {
  const { locale } = useLocale();

  return (
    <div className="w-full flex flex-col gap-3">
      {links.map((link, i) => {
        const Icon = iconMap[link.icon || ''] || ExternalLink;
        const title = locale === 'en' && link.titleEn ? link.titleEn : link.title;
        return (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              color: theme.text,
            }}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm sm:text-base font-medium flex-1">
              {title}
            </span>
            <ExternalLink className="w-4 h-4 opacity-40 shrink-0" />
          </a>
        );
      })}
    </div>
  );
}

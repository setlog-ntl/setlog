'use client';

import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import type { SiteConfig } from '@/lib/config';
import { useLocale } from '@/lib/i18n';

interface Props {
  config: SiteConfig;
}

export function ContactInfo({ config }: Props) {
  const { t, locale } = useLocale();
  const address = locale === 'en' && config.addressEn ? config.addressEn : config.address;

  const items = [
    config.phone
      ? {
          icon: Phone,
          label: config.phone,
          href: `tel:${config.phone.replace(/[^+\d]/g, '')}`,
          ariaLabel: t('contact.call'),
        }
      : null,
    config.email
      ? {
          icon: Mail,
          label: config.email,
          href: `mailto:${config.email}`,
          ariaLabel: t('contact.email'),
        }
      : null,
    address
      ? {
          icon: MapPin,
          label: address,
          href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
          ariaLabel: t('contact.map'),
        }
      : null,
    config.website
      ? {
          icon: Globe,
          label: config.website.replace(/^https?:\/\//, ''),
          href: config.website,
          ariaLabel: t('contact.website'),
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Phone;
    label: string;
    href: string;
    ariaLabel: string;
  }>;

  if (items.length === 0) return null;

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.href}
          target={item.icon === Globe || item.icon === MapPin ? '_blank' : undefined}
          rel={item.icon === Globe || item.icon === MapPin ? 'noopener noreferrer' : undefined}
          aria-label={item.ariaLabel}
          className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
          <span className="text-sm truncate">{item.label}</span>
        </a>
      ))}
    </div>
  );
}

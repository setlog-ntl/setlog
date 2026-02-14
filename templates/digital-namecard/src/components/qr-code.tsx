'use client';

import { QRCodeSVG } from 'qrcode.react';
import { generateVCard } from '@/lib/vcard';
import type { SiteConfig } from '@/lib/config';
import { useLocale } from '@/lib/i18n';

interface Props {
  config: SiteConfig;
}

export function QrCode({ config }: Props) {
  const { t } = useLocale();
  const vcard = generateVCard({
    name: config.name,
    title: config.title,
    company: config.company,
    email: config.email,
    phone: config.phone,
    address: config.address,
    website: config.website,
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 bg-white rounded-xl">
        <QRCodeSVG
          value={vcard}
          size={160}
          level="M"
          bgColor="#ffffff"
          fgColor="#111827"
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        {t('qr.hint')}
      </p>
    </div>
  );
}

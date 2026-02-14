'use client';

import { Download } from 'lucide-react';
import { generateVCard } from '@/lib/vcard';
import type { SiteConfig } from '@/lib/config';
import { useLocale } from '@/lib/i18n';

interface Props {
  config: SiteConfig;
}

export function SaveContactButton({ config }: Props) {
  const { t } = useLocale();

  const handleSave = () => {
    const vcard = generateVCard({
      name: config.name,
      title: config.title,
      company: config.company,
      email: config.email,
      phone: config.phone,
      address: config.address,
      website: config.website,
    });

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleSave}
      className="w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-80"
      style={{ backgroundColor: config.accentColor }}
    >
      <Download className="w-4 h-4" />
      {t('save.contact')}
    </button>
  );
}

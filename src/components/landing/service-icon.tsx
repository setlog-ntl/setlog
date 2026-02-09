'use client';

// Service icon mapping: slug for cdn.simpleicons.org, brand color, and dark mode flag
export const SERVICE_ICONS: Record<string, { slug: string; color: string; darkInvert?: boolean }> = {
  github: { slug: 'github', color: '181717', darkInvert: true },
  nextjs: { slug: 'nextdotjs', color: '000000', darkInvert: true },
  vercel: { slug: 'vercel', color: '000000', darkInvert: true },
  sentry: { slug: 'sentry', color: '362D59' },
  posthog: { slug: 'posthog', color: 'F54E00' },
  supabase: { slug: 'supabase', color: '3ECF8E' },
  clerk: { slug: 'clerk', color: '6C47FF' },
  s3: { slug: 'amazons3', color: '569A31' },
  stripe: { slug: 'stripe', color: '635BFF' },
  openai: { slug: 'openai', color: '412991' },
  resend: { slug: 'resend', color: '000000', darkInvert: true },
  cloudinary: { slug: 'cloudinary', color: '3448C5' },
  backend: { slug: 'fastapi', color: '009688' },
};

function iconUrl(slug: string, color: string) {
  return `https://cdn.simpleicons.org/${slug}/${color}`;
}

interface ServiceIconProps {
  serviceId: string;
  size?: number;
  className?: string;
}

export function ServiceIcon({ serviceId, size = 20, className }: ServiceIconProps) {
  const icon = SERVICE_ICONS[serviceId];

  if (!icon) {
    return <span className={className}>⚙️</span>;
  }

  return (
    <img
      src={iconUrl(icon.slug, icon.color)}
      alt={serviceId}
      width={size}
      height={size}
      className={`inline-block ${icon.darkInvert ? 'dark:invert' : ''} ${className ?? ''}`}
      loading="lazy"
    />
  );
}

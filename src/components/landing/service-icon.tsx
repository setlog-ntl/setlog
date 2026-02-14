'use client';

// Verified icon URLs via jsdelivr CDN (all tested and confirmed working)
// CSS mask-image technique: SVG as mask shape, backgroundColor as brand color
const CDN = 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons';

interface IconEntry {
  slug?: string;        // Simple Icons CDN slug
  localPath?: string;   // /public 로컬 SVG 경로
  color: string;
  darkColor: string;
}

export const SERVICE_ICONS: Record<string, IconEntry> = {
  // --- 28 services (matching src/data/services.ts slugs) ---
  supabase:       { slug: 'supabase',      color: '#3ECF8E', darkColor: '#3ECF8E' },
  firebase:       { slug: 'firebase',      color: '#DD2C00', darkColor: '#FFCA28' },
  vercel:         { slug: 'vercel',        color: '#000000', darkColor: '#ffffff' },
  netlify:        { slug: 'netlify',       color: '#00C7B7', darkColor: '#00C7B7' },
  stripe:         { slug: 'stripe',        color: '#635BFF', darkColor: '#7A73FF' },
  clerk:          { slug: 'clerk',         color: '#6C47FF', darkColor: '#8B6FFF' },
  nextauth:       { localPath: '/icons/authjs.svg',    color: '#000000', darkColor: '#ffffff' },
  resend:         { slug: 'resend',        color: '#000000', darkColor: '#ffffff' },
  sendgrid:       { localPath: '/icons/sendgrid.svg',  color: '#1A82E2', darkColor: '#4DA3EC' },
  openai:         { slug: 'openai',        color: '#412991', darkColor: '#A78BFA' },
  anthropic:      { slug: 'anthropic',     color: '#191919', darkColor: '#D4A574' },
  cloudinary:     { slug: 'cloudinary',    color: '#3448C5', darkColor: '#6B7FE0' },
  sentry:         { slug: 'sentry',        color: '#362D59', darkColor: '#b4a7d6' },
  planetscale:    { slug: 'planetscale',   color: '#000000', darkColor: '#ffffff' },
  neon:           { localPath: '/icons/neon.svg',      color: '#00E599', darkColor: '#00E599' },
  railway:        { slug: 'railway',       color: '#0B0D0E', darkColor: '#ffffff' },
  'lemon-squeezy': { slug: 'lemonsqueezy', color: '#FFC233', darkColor: '#FFC233' },
  uploadthing:    { localPath: '/icons/uploadthing.svg', color: '#EF4444', darkColor: '#F87171' },
  posthog:        { slug: 'posthog',       color: '#F54E00', darkColor: '#F54E00' },
  'aws-s3':       { slug: 'amazons3',     color: '#569A31', darkColor: '#7BC74D' },
  github:         { slug: 'github',        color: '#181717', darkColor: '#e6edf3' },
  'claude-code':  { slug: 'anthropic',     color: '#D4A27F', darkColor: '#D4A27F' },
  'google-gemini': { slug: 'googlegemini', color: '#8E75B2', darkColor: '#B39DDB' },
  'kakao-login':  { slug: 'kakao',         color: '#FFCD00', darkColor: '#FFCD00' },
  'google-oauth': { slug: 'google',        color: '#4285F4', darkColor: '#8AB4F8' },
  'naver-login':  { slug: 'naver',         color: '#03C75A', darkColor: '#03C75A' },
  'apple-login':  { slug: 'apple',         color: '#000000', darkColor: '#ffffff' },
  'github-oauth': { slug: 'github',        color: '#181717', darkColor: '#e6edf3' },

  // --- 3 flow-preset aliases (used in flow-presets.ts) ---
  nextjs:         { slug: 'nextdotjs',     color: '#000000', darkColor: '#ffffff' },
  backend:        { slug: 'fastapi',       color: '#009688', darkColor: '#4DB6AC' },
  s3:             { slug: 'amazons3',      color: '#569A31', darkColor: '#7BC74D' },
};

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

  const svgUrl = icon.slug ? `${CDN}/${icon.slug}.svg` : icon.localPath!;

  return (
    <span
      role="img"
      aria-label={serviceId}
      className={`inline-block shrink-0 ${className ?? ''}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Light mode */}
      <span
        className="block dark:hidden"
        style={{
          width: size,
          height: size,
          backgroundColor: icon.color,
          WebkitMaskImage: `url(${svgUrl})`,
          maskImage: `url(${svgUrl})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
      {/* Dark mode */}
      <span
        className="hidden dark:block"
        style={{
          width: size,
          height: size,
          backgroundColor: icon.darkColor,
          WebkitMaskImage: `url(${svgUrl})`,
          maskImage: `url(${svgUrl})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    </span>
  );
}

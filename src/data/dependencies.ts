import type { DependencyType } from '@/types';

export interface DependencySeed {
  service_id: string;
  depends_on_service_id: string;
  dependency_type: DependencyType;
  description: string;
  description_ko: string;
}

const S = {
  supabase: '10000000-0000-4000-a000-000000000001',
  firebase: '10000000-0000-4000-a000-000000000002',
  vercel: '10000000-0000-4000-a000-000000000003',
  netlify: '10000000-0000-4000-a000-000000000004',
  stripe: '10000000-0000-4000-a000-000000000005',
  clerk: '10000000-0000-4000-a000-000000000006',
  nextauth: '10000000-0000-4000-a000-000000000007',
  resend: '10000000-0000-4000-a000-000000000008',
  sendgrid: '10000000-0000-4000-a000-000000000009',
  openai: '10000000-0000-4000-a000-000000000010',
  anthropic: '10000000-0000-4000-a000-000000000011',
  cloudinary: '10000000-0000-4000-a000-000000000012',
  sentry: '10000000-0000-4000-a000-000000000013',
  planetscale: '10000000-0000-4000-a000-000000000014',
  neon: '10000000-0000-4000-a000-000000000015',
  railway: '10000000-0000-4000-a000-000000000016',
  lemonsqueezy: '10000000-0000-4000-a000-000000000017',
  uploadthing: '10000000-0000-4000-a000-000000000018',
  posthog: '10000000-0000-4000-a000-000000000019',
  awss3: '10000000-0000-4000-a000-000000000020',
  github_actions: '10000000-0000-4000-a000-000000000021',
  twilio: '10000000-0000-4000-a000-000000000022',
  onesignal: '10000000-0000-4000-a000-000000000023',
  algolia: '10000000-0000-4000-a000-000000000024',
  sanity: '10000000-0000-4000-a000-000000000025',
  ga4: '10000000-0000-4000-a000-000000000026',
  upstash_redis: '10000000-0000-4000-a000-000000000027',
  cloudflare: '10000000-0000-4000-a000-000000000028',
  fly_io: '10000000-0000-4000-a000-000000000029',
  datadog: '10000000-0000-4000-a000-000000000030',
  mixpanel: '10000000-0000-4000-a000-000000000031',
  contentful: '10000000-0000-4000-a000-000000000032',
  meilisearch: '10000000-0000-4000-a000-000000000033',
  pusher: '10000000-0000-4000-a000-000000000034',
  trigger_dev: '10000000-0000-4000-a000-000000000035',
  launchdarkly: '10000000-0000-4000-a000-000000000036',
  groq: '10000000-0000-4000-a000-000000000037',
  render: '10000000-0000-4000-a000-000000000038',
  logrocket: '10000000-0000-4000-a000-000000000039',
  playwright: '10000000-0000-4000-a000-000000000040',
  slack_api: '10000000-0000-4000-a000-000000000041',
  discord_api: '10000000-0000-4000-a000-000000000042',
  mapbox: '10000000-0000-4000-a000-000000000043',
  elevenlabs: '10000000-0000-4000-a000-000000000044',
  inngest: '10000000-0000-4000-a000-000000000045',
  strapi: '10000000-0000-4000-a000-000000000046',
  plausible: '10000000-0000-4000-a000-000000000047',
  cypress: '10000000-0000-4000-a000-000000000048',
  bullmq: '10000000-0000-4000-a000-000000000049',
  shopify_api: '10000000-0000-4000-a000-000000000050',
} as const;

export const dependencies: DependencySeed[] = [
  // --- Alternatives (same category, interchangeable) ---
  { service_id: S.supabase, depends_on_service_id: S.firebase, dependency_type: 'alternative', description: 'Firebase is an alternative BaaS platform', description_ko: 'Firebase는 대안 BaaS 플랫폼입니다' },
  { service_id: S.supabase, depends_on_service_id: S.neon, dependency_type: 'alternative', description: 'Neon is an alternative Postgres provider', description_ko: 'Neon은 대안 Postgres 제공자입니다' },
  { service_id: S.supabase, depends_on_service_id: S.planetscale, dependency_type: 'alternative', description: 'PlanetScale is an alternative managed database', description_ko: 'PlanetScale은 대안 관리형 데이터베이스입니다' },

  { service_id: S.vercel, depends_on_service_id: S.netlify, dependency_type: 'alternative', description: 'Netlify is an alternative deployment platform', description_ko: 'Netlify는 대안 배포 플랫폼입니다' },
  { service_id: S.vercel, depends_on_service_id: S.fly_io, dependency_type: 'alternative', description: 'Fly.io is an alternative for container-based deployment', description_ko: 'Fly.io는 컨테이너 기반 배포의 대안입니다' },
  { service_id: S.vercel, depends_on_service_id: S.render, dependency_type: 'alternative', description: 'Render is an alternative cloud hosting platform', description_ko: 'Render는 대안 클라우드 호스팅 플랫폼입니다' },
  { service_id: S.vercel, depends_on_service_id: S.railway, dependency_type: 'alternative', description: 'Railway is an alternative deployment platform', description_ko: 'Railway는 대안 배포 플랫폼입니다' },

  { service_id: S.clerk, depends_on_service_id: S.nextauth, dependency_type: 'alternative', description: 'NextAuth is an alternative auth solution', description_ko: 'NextAuth는 대안 인증 솔루션입니다' },

  { service_id: S.resend, depends_on_service_id: S.sendgrid, dependency_type: 'alternative', description: 'SendGrid is an alternative email service', description_ko: 'SendGrid는 대안 이메일 서비스입니다' },

  { service_id: S.openai, depends_on_service_id: S.anthropic, dependency_type: 'alternative', description: 'Anthropic is an alternative LLM provider', description_ko: 'Anthropic은 대안 LLM 제공자입니다' },
  { service_id: S.openai, depends_on_service_id: S.groq, dependency_type: 'alternative', description: 'Groq offers fast LLM inference as an alternative', description_ko: 'Groq는 빠른 LLM 추론을 대안으로 제공합니다' },

  { service_id: S.stripe, depends_on_service_id: S.lemonsqueezy, dependency_type: 'alternative', description: 'Lemon Squeezy is an alternative payment platform', description_ko: 'Lemon Squeezy는 대안 결제 플랫폼입니다' },

  { service_id: S.algolia, depends_on_service_id: S.meilisearch, dependency_type: 'alternative', description: 'Meilisearch is an open-source alternative to Algolia', description_ko: 'Meilisearch는 Algolia의 오픈소스 대안입니다' },

  { service_id: S.sanity, depends_on_service_id: S.contentful, dependency_type: 'alternative', description: 'Contentful is an alternative headless CMS', description_ko: 'Contentful은 대안 헤드리스 CMS입니다' },
  { service_id: S.sanity, depends_on_service_id: S.strapi, dependency_type: 'alternative', description: 'Strapi is a self-hosted CMS alternative', description_ko: 'Strapi는 자체 호스팅 CMS 대안입니다' },

  { service_id: S.trigger_dev, depends_on_service_id: S.inngest, dependency_type: 'alternative', description: 'Inngest is an alternative for background jobs', description_ko: 'Inngest는 백그라운드 잡의 대안입니다' },

  { service_id: S.playwright, depends_on_service_id: S.cypress, dependency_type: 'alternative', description: 'Cypress is an alternative E2E testing framework', description_ko: 'Cypress는 대안 E2E 테스팅 프레임워크입니다' },

  { service_id: S.ga4, depends_on_service_id: S.mixpanel, dependency_type: 'alternative', description: 'Mixpanel is an alternative analytics platform', description_ko: 'Mixpanel은 대안 분석 플랫폼입니다' },
  { service_id: S.ga4, depends_on_service_id: S.plausible, dependency_type: 'alternative', description: 'Plausible is a privacy-friendly analytics alternative', description_ko: 'Plausible은 프라이버시 친화적 분석 대안입니다' },
  { service_id: S.ga4, depends_on_service_id: S.posthog, dependency_type: 'alternative', description: 'PostHog is an open-source analytics alternative', description_ko: 'PostHog는 오픈소스 분석 대안입니다' },

  { service_id: S.onesignal, depends_on_service_id: S.pusher, dependency_type: 'alternative', description: 'Pusher is an alternative for realtime messaging', description_ko: 'Pusher는 실시간 메시징의 대안입니다' },

  { service_id: S.uploadthing, depends_on_service_id: S.cloudinary, dependency_type: 'alternative', description: 'Cloudinary is an alternative for file/image management', description_ko: 'Cloudinary는 파일/이미지 관리의 대안입니다' },
  { service_id: S.uploadthing, depends_on_service_id: S.awss3, dependency_type: 'alternative', description: 'AWS S3 is an alternative for object storage', description_ko: 'AWS S3는 오브젝트 스토리지의 대안입니다' },

  // --- Recommended (commonly used together) ---
  { service_id: S.vercel, depends_on_service_id: S.supabase, dependency_type: 'recommended', description: 'Supabase is commonly used with Vercel for backend', description_ko: 'Supabase는 Vercel과 함께 백엔드로 자주 사용됩니다' },
  { service_id: S.vercel, depends_on_service_id: S.sentry, dependency_type: 'recommended', description: 'Sentry provides error tracking for Vercel deployments', description_ko: 'Sentry는 Vercel 배포에 에러 추적을 제공합니다' },
  { service_id: S.vercel, depends_on_service_id: S.clerk, dependency_type: 'recommended', description: 'Clerk provides authentication for Next.js on Vercel', description_ko: 'Clerk는 Vercel의 Next.js에 인증을 제공합니다' },

  { service_id: S.stripe, depends_on_service_id: S.supabase, dependency_type: 'recommended', description: 'Use Supabase to store Stripe customer data', description_ko: 'Supabase를 사용하여 Stripe 고객 데이터를 저장합니다' },
  { service_id: S.stripe, depends_on_service_id: S.resend, dependency_type: 'recommended', description: 'Use Resend to send payment receipts via email', description_ko: 'Resend를 사용하여 결제 영수증을 이메일로 전송합니다' },

  { service_id: S.nextauth, depends_on_service_id: S.supabase, dependency_type: 'recommended', description: 'Use Supabase as NextAuth database adapter', description_ko: 'Supabase를 NextAuth 데이터베이스 어댑터로 사용합니다' },

  { service_id: S.github_actions, depends_on_service_id: S.vercel, dependency_type: 'recommended', description: 'GitHub Actions can trigger Vercel deployments', description_ko: 'GitHub Actions로 Vercel 배포를 트리거할 수 있습니다' },
  { service_id: S.github_actions, depends_on_service_id: S.playwright, dependency_type: 'recommended', description: 'Run Playwright tests in GitHub Actions CI', description_ko: 'GitHub Actions CI에서 Playwright 테스트를 실행합니다' },
  { service_id: S.github_actions, depends_on_service_id: S.cypress, dependency_type: 'recommended', description: 'Run Cypress tests in GitHub Actions CI', description_ko: 'GitHub Actions CI에서 Cypress 테스트를 실행합니다' },

  { service_id: S.bullmq, depends_on_service_id: S.upstash_redis, dependency_type: 'required', description: 'BullMQ requires Redis as its backend', description_ko: 'BullMQ는 Redis를 백엔드로 필요합니다' },

  { service_id: S.trigger_dev, depends_on_service_id: S.vercel, dependency_type: 'recommended', description: 'Trigger.dev integrates well with Vercel deployments', description_ko: 'Trigger.dev는 Vercel 배포와 잘 통합됩니다' },

  { service_id: S.inngest, depends_on_service_id: S.vercel, dependency_type: 'recommended', description: 'Inngest works seamlessly with Vercel serverless functions', description_ko: 'Inngest는 Vercel 서버리스 함수와 원활하게 작동합니다' },

  { service_id: S.sentry, depends_on_service_id: S.vercel, dependency_type: 'recommended', description: 'Sentry has a first-party Vercel integration', description_ko: 'Sentry는 공식 Vercel 통합을 제공합니다' },

  { service_id: S.posthog, depends_on_service_id: S.vercel, dependency_type: 'recommended', description: 'PostHog integrates easily with Next.js on Vercel', description_ko: 'PostHog는 Vercel의 Next.js와 쉽게 통합됩니다' },

  { service_id: S.cloudflare, depends_on_service_id: S.vercel, dependency_type: 'optional', description: 'Use Cloudflare DNS/CDN in front of Vercel', description_ko: 'Vercel 앞에 Cloudflare DNS/CDN을 사용합니다' },

  { service_id: S.datadog, depends_on_service_id: S.sentry, dependency_type: 'optional', description: 'Use Datadog alongside Sentry for full observability', description_ko: '전체 관찰성을 위해 Sentry와 함께 Datadog를 사용합니다' },

  { service_id: S.logrocket, depends_on_service_id: S.sentry, dependency_type: 'recommended', description: 'Combine LogRocket session replay with Sentry errors', description_ko: 'LogRocket 세션 리플레이를 Sentry 에러와 결합합니다' },

  { service_id: S.launchdarkly, depends_on_service_id: S.posthog, dependency_type: 'optional', description: 'Combine feature flags with PostHog analytics', description_ko: '피처 플래그를 PostHog 분석과 결합합니다' },

  { service_id: S.shopify_api, depends_on_service_id: S.stripe, dependency_type: 'optional', description: 'Use Stripe for custom payment flows with Shopify', description_ko: 'Shopify에서 커스텀 결제 흐름을 위해 Stripe를 사용합니다' },

  { service_id: S.strapi, depends_on_service_id: S.cloudinary, dependency_type: 'recommended', description: 'Use Cloudinary for media management with Strapi', description_ko: 'Strapi에서 미디어 관리를 위해 Cloudinary를 사용합니다' },

  { service_id: S.slack_api, depends_on_service_id: S.sentry, dependency_type: 'optional', description: 'Send Sentry alerts to Slack channels', description_ko: 'Sentry 알림을 Slack 채널로 전송합니다' },
];

import type { ServiceCategory, ServiceDomain, DifficultyLevel, FreeTierQuality, VendorLockInRisk, EnvVarTemplate } from '@/types';

// ---------------------------------------------------------------------------
// Seed-specific types: omit auto-generated fields (created_at, updated_at)
// ---------------------------------------------------------------------------

export interface ServiceSeed {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  description_ko: string;
  icon_url: string | null;
  website_url: string;
  docs_url: string;
  pricing_info: Record<string, unknown>;
  required_env_vars: EnvVarTemplate[];
  // V2 extended fields
  domain?: ServiceDomain;
  subcategory?: string;
  popularity_score?: number;
  difficulty_level?: DifficultyLevel;
  tags?: string[];
  alternatives?: string[];
  compatibility?: { framework?: string[]; language?: string[] };
  official_sdks?: Record<string, string>;
  free_tier_quality?: FreeTierQuality;
  vendor_lock_in_risk?: VendorLockInRisk;
  setup_time_minutes?: number;
  monthly_cost_estimate?: Record<string, string>;
  dx_score?: number;
}

export interface ChecklistItemSeed {
  id: string;
  service_id: string;
  order_index: number;
  title: string;
  title_ko: string;
  description: string;
  description_ko: string;
  guide_url: string | null;
}

// ---------------------------------------------------------------------------
// Fixed UUIDs – deterministic so seed operations are idempotent
// ---------------------------------------------------------------------------

const SERVICE_IDS = {
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
  github: '10000000-0000-4000-a000-000000000051',
  claude_code: '10000000-0000-4000-a000-000000000052',
  google_gemini: '10000000-0000-4000-a000-000000000053',
} as const;

// ---------------------------------------------------------------------------
// 20 Services
// ---------------------------------------------------------------------------

export const services: ServiceSeed[] = [
  // -----------------------------------------------------------------------
  // 1. Supabase
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.supabase,
    name: 'Supabase',
    slug: 'supabase',
    category: 'database',
    description:
      'Postgres 데이터베이스, 인증, 즉시 API, 엣지 함수, 실시간 구독 및 스토리지를 제공하는 오픈소스 Firebase 대안 플랫폼입니다.',
    description_ko:
      'Postgres 데이터베이스, 인증, 즉시 API, 엣지 함수, 실시간 구독 및 스토리지를 제공하는 오픈소스 Firebase 대안 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://supabase.com',
    docs_url: 'https://supabase.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '500 MB 데이터베이스, 1 GB 스토리지, 50,000 월간 활성 사용자',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pro', price: '$25/월' },
        { name: 'Team', price: '$599/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        public: true,
        description: 'Supabase 프로젝트 URL',
        description_ko: 'Supabase 프로젝트 URL',
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        public: true,
        description: 'Supabase 익명(공개) 키',
        description_ko: 'Supabase 익명(공개) 키',
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        public: false,
        description: 'Supabase 서비스 역할 키 (서버 전용)',
        description_ko: 'Supabase 서비스 역할 키 (서버 전용)',
      },
    ],
    // V2 extended fields
    domain: 'backend',
    subcategory: 'postgres',
    popularity_score: 92,
    difficulty_level: 'beginner',
    tags: ['postgres', 'realtime', 'auth', 'storage', 'open-source', 'baas'],
    alternatives: ['firebase', 'neon', 'planetscale'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'svelte', 'flutter'],
      language: ['typescript', 'javascript', 'python', 'dart'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@supabase/supabase-js' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 10,
    monthly_cost_estimate: { starter: '$0', growth: '$25-50', enterprise: '$599+' },
    dx_score: 9.2,
  },

  // -----------------------------------------------------------------------
  // 2. Firebase
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.firebase,
    name: 'Firebase',
    slug: 'firebase',
    category: 'database',
    description:
      'Google이 지원하는 플랫폼으로 NoSQL 클라우드 데이터베이스(Firestore), 인증, 호스팅, 클라우드 함수 및 분석 기능을 제공합니다.',
    description_ko:
      'Google이 지원하는 플랫폼으로 NoSQL 클라우드 데이터베이스(Firestore), 인증, 호스팅, 클라우드 함수 및 분석 기능을 제공합니다.',
    icon_url: null,
    website_url: 'https://firebase.google.com',
    docs_url: 'https://firebase.google.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Spark 플랜: 1 GiB Firestore 저장소, 10 GB 호스팅 저장소',
      plans: [
        { name: 'Spark (무료)', price: '$0/월' },
        { name: 'Blaze (종량제)', price: '사용량 기반' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
        public: true,
        description: 'Firebase API 키',
        description_ko: 'Firebase API 키',
      },
      {
        name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        public: true,
        description: 'Firebase 인증 도메인',
        description_ko: 'Firebase 인증 도메인',
      },
      {
        name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        public: true,
        description: 'Firebase 프로젝트 ID',
        description_ko: 'Firebase 프로젝트 ID',
      },
      {
        name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        public: true,
        description: 'Firebase 스토리지 버킷',
        description_ko: 'Firebase 스토리지 버킷',
      },
      {
        name: 'FIREBASE_ADMIN_PRIVATE_KEY',
        public: false,
        description: 'Firebase Admin SDK 비공개 키 (서버 전용)',
        description_ko: 'Firebase Admin SDK 비공개 키 (서버 전용)',
      },
      {
        name: 'FIREBASE_ADMIN_CLIENT_EMAIL',
        public: false,
        description: 'Firebase Admin SDK 클라이언트 이메일',
        description_ko: 'Firebase Admin SDK 클라이언트 이메일',
      },
    ],
    // V2 extended fields
    domain: 'backend',
    subcategory: 'nosql',
    popularity_score: 90,
    difficulty_level: 'beginner',
    tags: ['nosql', 'firestore', 'realtime', 'auth', 'google', 'baas', 'mobile'],
    alternatives: ['supabase'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'angular', 'flutter'],
      language: ['typescript', 'javascript', 'python', 'java', 'swift', 'kotlin'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/firebase' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 10,
    monthly_cost_estimate: { starter: '$0', growth: '$25-100', enterprise: '$200+' },
    dx_score: 8.5,
  },

  // -----------------------------------------------------------------------
  // 3. Vercel
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.vercel,
    name: 'Vercel',
    slug: 'vercel',
    category: 'deploy',
    description:
      'Next.js, React 및 기타 웹 프레임워크를 자동 CI/CD, 서버리스 함수, 엣지 네트워크와 함께 배포할 수 있는 프론트엔드 클라우드 플랫폼입니다.',
    description_ko:
      'Next.js, React 및 기타 웹 프레임워크를 자동 CI/CD, 서버리스 함수, 엣지 네트워크와 함께 배포할 수 있는 프론트엔드 클라우드 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://vercel.com',
    docs_url: 'https://vercel.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Hobby: 무제한 배포, 100 GB 대역폭, 서버리스 함수 포함',
      plans: [
        { name: 'Hobby', price: '$0/월' },
        { name: 'Pro', price: '$20/월/멤버' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'VERCEL_TOKEN',
        public: false,
        description: 'CLI 및 자동화를 위한 Vercel API 토큰',
        description_ko: 'CLI 및 자동화를 위한 Vercel API 토큰',
      },
      {
        name: 'VERCEL_ORG_ID',
        public: false,
        description: 'Vercel 조직 ID',
        description_ko: 'Vercel 조직 ID',
      },
      {
        name: 'VERCEL_PROJECT_ID',
        public: false,
        description: 'Vercel 프로젝트 ID',
        description_ko: 'Vercel 프로젝트 ID',
      },
    ],
    // V2 extended fields
    domain: 'infrastructure',
    subcategory: 'jamstack',
    popularity_score: 95,
    difficulty_level: 'beginner',
    tags: ['nextjs', 'hosting', 'serverless', 'edge', 'preview-deploys', 'cdn'],
    alternatives: ['netlify', 'railway', 'fly-io', 'render'],
    compatibility: {
      framework: ['nextjs', 'react', 'svelte', 'nuxt', 'astro'],
      language: ['typescript', 'javascript', 'python', 'go', 'ruby'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/vercel' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$0', growth: '$20', enterprise: '$Custom' },
    dx_score: 9.5,
  },

  // -----------------------------------------------------------------------
  // 4. Netlify
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.netlify,
    name: 'Netlify',
    slug: 'netlify',
    category: 'deploy',
    description:
      '지속적 배포, 서버리스 함수, 폼 처리 및 ID 관리를 제공하는 현대적인 웹 개발 플랫폼입니다.',
    description_ko:
      '지속적 배포, 서버리스 함수, 폼 처리 및 ID 관리를 제공하는 현대적인 웹 개발 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://www.netlify.com',
    docs_url: 'https://docs.netlify.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Starter: 100 GB 대역폭, 300 빌드 분/월, 125K 서버리스 함수 호출',
      plans: [
        { name: 'Starter', price: '$0/월' },
        { name: 'Pro', price: '$19/월/멤버' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NETLIFY_AUTH_TOKEN',
        public: false,
        description: 'Netlify 개인 액세스 토큰',
        description_ko: 'Netlify 개인 액세스 토큰',
      },
      {
        name: 'NETLIFY_SITE_ID',
        public: false,
        description: 'Netlify 사이트 ID',
        description_ko: 'Netlify 사이트 ID',
      },
    ],
    // V2 extended fields
    domain: 'infrastructure',
    subcategory: 'jamstack',
    popularity_score: 82,
    difficulty_level: 'beginner',
    tags: ['jamstack', 'static', 'hosting', 'serverless', 'forms', 'edge'],
    alternatives: ['vercel', 'render'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'gatsby', 'hugo', 'astro'],
      language: ['typescript', 'javascript'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/netlify' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$0', growth: '$19', enterprise: '$Custom' },
    dx_score: 8.8,
  },

  // -----------------------------------------------------------------------
  // 5. Stripe
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.stripe,
    name: 'Stripe',
    slug: 'stripe',
    category: 'payment',
    description:
      '구독, 일회성 결제, 인보이스 및 글로벌 결제 수단을 지원하는 인터넷 비즈니스용 결제 처리 플랫폼입니다.',
    description_ko:
      '구독, 일회성 결제, 인보이스 및 글로벌 결제 수단을 지원하는 인터넷 비즈니스용 결제 처리 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://stripe.com',
    docs_url: 'https://stripe.com/docs',
    pricing_info: {
      free_tier: false,
      free_tier_details: '테스트 모드 무료, 거래 수수료: 2.9% + 30 센트 (미국 카드)',
      plans: [
        { name: 'Standard', price: '거래당 2.9% + 30¢' },
        { name: 'Custom', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        public: true,
        description: 'Stripe 공개 키 (클라이언트 측)',
        description_ko: 'Stripe 공개 키 (클라이언트 측)',
      },
      {
        name: 'STRIPE_SECRET_KEY',
        public: false,
        description: 'Stripe 비밀 키 (서버 전용)',
        description_ko: 'Stripe 비밀 키 (서버 전용)',
      },
      {
        name: 'STRIPE_WEBHOOK_SECRET',
        public: false,
        description: 'Stripe 웹훅 서명 시크릿',
        description_ko: 'Stripe 웹훅 서명 시크릿',
      },
    ],
    // V2 extended fields
    domain: 'business',
    subcategory: 'payment_gateway',
    popularity_score: 96,
    difficulty_level: 'intermediate',
    tags: ['payment', 'subscription', 'billing', 'invoicing', 'marketplace'],
    alternatives: ['lemonsqueezy'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'ruby-on-rails'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'java', 'php'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/stripe' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 30,
    monthly_cost_estimate: { starter: '2.9%+30\u00A2/tx', growth: '2.9%+30\u00A2/tx', enterprise: 'Custom' },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 6. Clerk
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.clerk,
    name: 'Clerk',
    slug: 'clerk',
    category: 'auth',
    description:
      '사전 구축된 UI 컴포넌트, 소셜 로그인, MFA 및 조직 관리를 갖춘 즉시 사용 가능한 인증 및 사용자 관리 솔루션입니다.',
    description_ko:
      '사전 구축된 UI 컴포넌트, 소셜 로그인, MFA 및 조직 관리를 갖춘 즉시 사용 가능한 인증 및 사용자 관리 솔루션입니다.',
    icon_url: null,
    website_url: 'https://clerk.com',
    docs_url: 'https://clerk.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 10,000 월간 활성 사용자, 소셜 로그인, 사전 구축 컴포넌트',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pro', price: '$25/월 + MAU당 $0.02' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        public: true,
        description: 'Clerk 공개 키',
        description_ko: 'Clerk 공개 키',
      },
      {
        name: 'CLERK_SECRET_KEY',
        public: false,
        description: 'Clerk 비밀 키 (서버 전용)',
        description_ko: 'Clerk 비밀 키 (서버 전용)',
      },
      {
        name: 'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
        public: true,
        description: '로그인 페이지 URL',
        description_ko: '로그인 페이지 URL',
      },
      {
        name: 'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
        public: true,
        description: '회원가입 페이지 URL',
        description_ko: '회원가입 페이지 URL',
      },
    ],
    // V2 extended fields
    domain: 'backend',
    subcategory: 'auth_platform',
    popularity_score: 85,
    difficulty_level: 'beginner',
    tags: ['auth', 'oauth', 'social-login', 'user-management', 'mfa', 'pre-built-ui'],
    alternatives: ['nextauth', 'supabase'],
    compatibility: {
      framework: ['nextjs', 'react', 'remix', 'gatsby'],
      language: ['typescript', 'javascript'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@clerk/nextjs' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 10,
    monthly_cost_estimate: { starter: '$0', growth: '$25', enterprise: '$99+' },
    dx_score: 9.5,
  },

  // -----------------------------------------------------------------------
  // 7. NextAuth / Auth.js
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.nextauth,
    name: 'NextAuth / Auth.js',
    slug: 'nextauth',
    category: 'auth',
    description:
      'OAuth 프로바이더, 이메일/비밀번호, 매직 링크 및 데이터베이스 세션 전략을 지원하는 Next.js용 오픈소스 인증 라이브러리입니다.',
    description_ko:
      'OAuth 프로바이더, 이메일/비밀번호, 매직 링크 및 데이터베이스 세션 전략을 지원하는 Next.js용 오픈소스 인증 라이브러리입니다.',
    icon_url: null,
    website_url: 'https://authjs.dev',
    docs_url: 'https://authjs.dev/getting-started',
    pricing_info: {
      free_tier: true,
      free_tier_details: '완전 무료 오픈소스 라이브러리',
      plans: [{ name: 'Open Source', price: '무료' }],
    },
    required_env_vars: [
      {
        name: 'NEXTAUTH_URL',
        public: false,
        description: '사이트의 정규 URL (프로덕션에서 사용)',
        description_ko: '사이트의 정규 URL (프로덕션에서 사용)',
      },
      {
        name: 'NEXTAUTH_SECRET',
        public: false,
        description: '토큰 암호화 및 쿠키 서명에 사용되는 시크릿',
        description_ko: '토큰 암호화 및 쿠키 서명에 사용되는 시크릿',
      },
      {
        name: 'GITHUB_CLIENT_ID',
        public: false,
        description: 'GitHub OAuth 앱 클라이언트 ID (GitHub 프로바이더 사용 시)',
        description_ko: 'GitHub OAuth 앱 클라이언트 ID (GitHub 프로바이더 사용 시)',
      },
      {
        name: 'GITHUB_CLIENT_SECRET',
        public: false,
        description: 'GitHub OAuth 앱 클라이언트 시크릿',
        description_ko: 'GitHub OAuth 앱 클라이언트 시크릿',
      },
      {
        name: 'GOOGLE_CLIENT_ID',
        public: false,
        description: 'Google OAuth 클라이언트 ID (Google 프로바이더 사용 시)',
        description_ko: 'Google OAuth 클라이언트 ID (Google 프로바이더 사용 시)',
      },
      {
        name: 'GOOGLE_CLIENT_SECRET',
        public: false,
        description: 'Google OAuth 클라이언트 시크릿',
        description_ko: 'Google OAuth 클라이언트 시크릿',
      },
    ],
    // V2 extended fields
    domain: 'backend',
    subcategory: 'auth_platform',
    popularity_score: 80,
    difficulty_level: 'intermediate',
    tags: ['auth', 'oauth', 'open-source', 'self-hosted', 'nextjs'],
    alternatives: ['clerk', 'supabase'],
    compatibility: {
      framework: ['nextjs', 'sveltekit'],
      language: ['typescript', 'javascript'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/next-auth' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 20,
    monthly_cost_estimate: { starter: '$0', growth: '$0', enterprise: '$0' },
    dx_score: 7.5,
  },

  // -----------------------------------------------------------------------
  // 8. Resend
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.resend,
    name: 'Resend',
    slug: 'resend',
    category: 'email',
    description:
      '신뢰성을 위해 구축된 개발자용 현대적 이메일 API입니다. React Email 템플릿, 트랜잭션 이메일 및 상세 분석을 지원합니다.',
    description_ko:
      '신뢰성을 위해 구축된 개발자용 현대적 이메일 API입니다. React Email 템플릿, 트랜잭션 이메일 및 상세 분석을 지원합니다.',
    icon_url: null,
    website_url: 'https://resend.com',
    docs_url: 'https://resend.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 일 100통, 월 3,000통, 1개 도메인',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pro', price: '$20/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'RESEND_API_KEY',
        public: false,
        description: 'Resend API 키',
        description_ko: 'Resend API 키',
      },
    ],
    // V2 extended fields
    domain: 'communication',
    subcategory: 'transactional_email',
    popularity_score: 78,
    difficulty_level: 'beginner',
    tags: ['email', 'transactional', 'react-email', 'developer-friendly'],
    alternatives: ['sendgrid'],
    compatibility: {
      framework: ['nextjs', 'react', 'express'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'php'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/resend' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 10,
    monthly_cost_estimate: { starter: '$0', growth: '$20', enterprise: '$Custom' },
    dx_score: 9.3,
  },

  // -----------------------------------------------------------------------
  // 9. SendGrid
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.sendgrid,
    name: 'SendGrid',
    slug: 'sendgrid',
    category: 'email',
    description:
      'Twilio이 소유한 이메일 전송 서비스로 트랜잭션 및 마케팅 이메일의 전송률 최적화와 분석 기능을 제공합니다.',
    description_ko:
      'Twilio이 소유한 이메일 전송 서비스로 트랜잭션 및 마케팅 이메일의 전송률 최적화와 분석 기능을 제공합니다.',
    icon_url: null,
    website_url: 'https://sendgrid.com',
    docs_url: 'https://docs.sendgrid.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 일 100통',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Essentials', price: '$19.95/월' },
        { name: 'Pro', price: '$89.95/월' },
        { name: 'Premier', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'SENDGRID_API_KEY',
        public: false,
        description: 'SendGrid API 키',
        description_ko: 'SendGrid API 키',
      },
      {
        name: 'SENDGRID_FROM_EMAIL',
        public: false,
        description: '인증된 발신자 이메일 주소',
        description_ko: '인증된 발신자 이메일 주소',
      },
    ],
    // V2 extended fields
    domain: 'communication',
    subcategory: 'transactional_email',
    popularity_score: 75,
    difficulty_level: 'intermediate',
    tags: ['email', 'transactional', 'marketing', 'smtp', 'twilio'],
    alternatives: ['resend'],
    compatibility: {
      framework: ['nextjs', 'react', 'express', 'django', 'rails'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'java', 'php', 'c#'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@sendgrid/mail' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 15,
    monthly_cost_estimate: { starter: '$0', growth: '$19.95', enterprise: '$89.95+' },
    dx_score: 7.5,
  },

  // -----------------------------------------------------------------------
  // 10. OpenAI
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.openai,
    name: 'OpenAI',
    slug: 'openai',
    category: 'ai',
    description:
      'GPT 모델, DALL-E 이미지 생성, Whisper 음성-텍스트 변환 및 임베딩을 REST API로 제공하는 AI 플랫폼입니다.',
    description_ko:
      'GPT 모델, DALL-E 이미지 생성, Whisper 음성-텍스트 변환 및 임베딩을 REST API로 제공하는 AI 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://openai.com',
    docs_url: 'https://platform.openai.com/docs',
    pricing_info: {
      free_tier: false,
      free_tier_details: '무료 크레딧 제공 (신규 계정), 이후 종량제',
      plans: [{ name: '종량제', price: '토큰당 과금 (모델별 상이)' }],
    },
    required_env_vars: [
      {
        name: 'OPENAI_API_KEY',
        public: false,
        description: 'OpenAI API 키',
        description_ko: 'OpenAI API 키',
      },
      {
        name: 'OPENAI_ORG_ID',
        public: false,
        description: 'OpenAI 조직 ID (선택사항)',
        description_ko: 'OpenAI 조직 ID (선택사항)',
      },
    ],
    // V2 extended fields
    domain: 'ai_ml',
    subcategory: 'llm',
    popularity_score: 98,
    difficulty_level: 'beginner',
    tags: ['llm', 'gpt', 'chatgpt', 'dall-e', 'whisper', 'embeddings', 'ai'],
    alternatives: ['anthropic', 'groq'],
    compatibility: {
      framework: ['nextjs', 'react', 'express', 'fastapi'],
      language: ['typescript', 'javascript', 'python', 'go', 'ruby', 'java', 'c#'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/openai' },
    free_tier_quality: 'limited',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$5-20', growth: '$50-200', enterprise: '$500+' },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 11. Anthropic
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.anthropic,
    name: 'Anthropic',
    slug: 'anthropic',
    category: 'ai',
    description:
      'Claude 모델을 API로 제공하여 텍스트 생성, 분석, 코드 지원 및 멀티모달 이해를 가능하게 하는 AI 안전 기업입니다.',
    description_ko:
      'Claude 모델을 API로 제공하여 텍스트 생성, 분석, 코드 지원 및 멀티모달 이해를 가능하게 하는 AI 안전 기업입니다.',
    icon_url: null,
    website_url: 'https://www.anthropic.com',
    docs_url: 'https://docs.anthropic.com',
    pricing_info: {
      free_tier: false,
      free_tier_details: '무료 체험 크레딧 제공, 이후 종량제',
      plans: [{ name: '종량제', price: '토큰당 과금 (모델별 상이)' }],
    },
    required_env_vars: [
      {
        name: 'ANTHROPIC_API_KEY',
        public: false,
        description: 'Anthropic API 키',
        description_ko: 'Anthropic API 키',
      },
    ],
    // V2 extended fields
    domain: 'ai_ml',
    subcategory: 'llm',
    popularity_score: 88,
    difficulty_level: 'beginner',
    tags: ['llm', 'claude', 'ai', 'safety', 'long-context'],
    alternatives: ['openai', 'groq'],
    compatibility: {
      framework: ['nextjs', 'react', 'express', 'fastapi'],
      language: ['typescript', 'javascript', 'python'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@anthropic-ai/sdk' },
    free_tier_quality: 'limited',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$5-20', growth: '$50-200', enterprise: '$500+' },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 12. Cloudinary
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.cloudinary,
    name: 'Cloudinary',
    slug: 'cloudinary',
    category: 'storage',
    description:
      '실시간 변환, 최적화, CDN 전송 및 AI 기반 태깅을 지원하는 클라우드 기반 이미지 및 비디오 관리 서비스입니다.',
    description_ko:
      '실시간 변환, 최적화, CDN 전송 및 AI 기반 태깅을 지원하는 클라우드 기반 이미지 및 비디오 관리 서비스입니다.',
    icon_url: null,
    website_url: 'https://cloudinary.com',
    docs_url: 'https://cloudinary.com/documentation',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 25 크레딧/월, 25K 변환, 25 GB 저장소/대역폭',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Plus', price: '$89/월' },
        { name: 'Advanced', price: '$224/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
        public: true,
        description: 'Cloudinary 클라우드 이름',
        description_ko: 'Cloudinary 클라우드 이름',
      },
      {
        name: 'CLOUDINARY_API_KEY',
        public: false,
        description: 'Cloudinary API 키',
        description_ko: 'Cloudinary API 키',
      },
      {
        name: 'CLOUDINARY_API_SECRET',
        public: false,
        description: 'Cloudinary API 시크릿',
        description_ko: 'Cloudinary API 시크릿',
      },
    ],
    // V2 extended fields
    domain: 'business',
    subcategory: 'image_video',
    popularity_score: 80,
    difficulty_level: 'intermediate',
    tags: ['image', 'video', 'media', 'cdn', 'optimization', 'transformation'],
    alternatives: ['uploadthing', 'aws-s3'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'angular'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'php', 'java'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/cloudinary' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 10,
    monthly_cost_estimate: { starter: '$0', growth: '$89', enterprise: '$224+' },
    dx_score: 7.8,
  },

  // -----------------------------------------------------------------------
  // 13. Sentry
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.sentry,
    name: 'Sentry',
    slug: 'sentry',
    category: 'monitoring',
    description:
      '실시간 알림, 성능 모니터링, 세션 리플레이 및 릴리스 상태 추적을 제공하는 애플리케이션 모니터링 및 오류 추적 플랫폼입니다.',
    description_ko:
      '실시간 알림, 성능 모니터링, 세션 리플레이 및 릴리스 상태 추적을 제공하는 애플리케이션 모니터링 및 오류 추적 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://sentry.io',
    docs_url: 'https://docs.sentry.io',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Developer: 5K 에러 이벤트, 10K 트랜잭션, 1 GB 첨부파일',
      plans: [
        { name: 'Developer', price: '$0/월' },
        { name: 'Team', price: '$26/월' },
        { name: 'Business', price: '$80/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_SENTRY_DSN',
        public: true,
        description: 'Sentry DSN (데이터 소스 이름)',
        description_ko: 'Sentry DSN (데이터 소스 이름)',
      },
      {
        name: 'SENTRY_AUTH_TOKEN',
        public: false,
        description: '소스맵 업로드를 위한 Sentry 인증 토큰',
        description_ko: '소스맵 업로드를 위한 Sentry 인증 토큰',
      },
      {
        name: 'SENTRY_ORG',
        public: false,
        description: 'Sentry 조직 슬러그',
        description_ko: 'Sentry 조직 슬러그',
      },
      {
        name: 'SENTRY_PROJECT',
        public: false,
        description: 'Sentry 프로젝트 슬러그',
        description_ko: 'Sentry 프로젝트 슬러그',
      },
    ],
    // V2 extended fields
    domain: 'observability',
    subcategory: 'error_tracking',
    popularity_score: 90,
    difficulty_level: 'beginner',
    tags: ['error-tracking', 'monitoring', 'performance', 'debugging', 'open-source'],
    alternatives: [],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'angular', 'svelte', 'django', 'rails', 'flask'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'java', 'php', 'c#', 'rust'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@sentry/nextjs' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 10,
    monthly_cost_estimate: { starter: '$0', growth: '$26', enterprise: '$80+' },
    dx_score: 8.8,
  },

  // -----------------------------------------------------------------------
  // 14. PlanetScale
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.planetscale,
    name: 'PlanetScale',
    slug: 'planetscale',
    category: 'database',
    description:
      'Vitess 기반의 브랜칭, 논블로킹 스키마 변경 및 수평 확장을 지원하는 서버리스 MySQL 호환 데이터베이스 플랫폼입니다.',
    description_ko:
      'Vitess 기반의 브랜칭, 논블로킹 스키마 변경 및 수평 확장을 지원하는 서버리스 MySQL 호환 데이터베이스 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://planetscale.com',
    docs_url: 'https://planetscale.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Hobby: 5 GB 저장소, 1B 행 읽기/월, 10M 행 쓰기/월',
      plans: [
        { name: 'Hobby', price: '$0/월' },
        { name: 'Scaler', price: '$29/월' },
        { name: 'Scaler Pro', price: '$39/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'DATABASE_URL',
        public: false,
        description: 'PlanetScale 데이터베이스 연결 문자열',
        description_ko: 'PlanetScale 데이터베이스 연결 문자열',
      },
    ],
    // V2 extended fields
    domain: 'backend',
    subcategory: 'mysql',
    popularity_score: 78,
    difficulty_level: 'intermediate',
    tags: ['mysql', 'vitess', 'branching', 'serverless', 'horizontal-scaling'],
    alternatives: ['neon', 'supabase'],
    compatibility: {
      framework: ['nextjs', 'react', 'express', 'django', 'rails'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'java', 'php'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@planetscale/database' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 10,
    monthly_cost_estimate: { starter: '$0', growth: '$29', enterprise: '$Custom' },
    dx_score: 8.8,
  },

  // -----------------------------------------------------------------------
  // 15. Neon
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.neon,
    name: 'Neon',
    slug: 'neon',
    category: 'database',
    description:
      '자동 확장, 브랜칭 및 넉넉한 무료 티어를 제공하는 서버리스 Postgres입니다. 제로까지 축소되는 컴퓨팅과 즉시 데이터베이스 브랜칭을 지원합니다.',
    description_ko:
      '자동 확장, 브랜칭 및 넉넉한 무료 티어를 제공하는 서버리스 Postgres입니다. 제로까지 축소되는 컴퓨팅과 즉시 데이터베이스 브랜칭을 지원합니다.',
    icon_url: null,
    website_url: 'https://neon.tech',
    docs_url: 'https://neon.tech/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 0.5 GiB 저장소, 자동 일시 중지, 브랜칭',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Launch', price: '$19/월' },
        { name: 'Scale', price: '$69/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'DATABASE_URL',
        public: false,
        description: 'Neon Postgres 연결 문자열 (풀링)',
        description_ko: 'Neon Postgres 연결 문자열 (풀링)',
      },
      {
        name: 'DATABASE_URL_UNPOOLED',
        public: false,
        description: 'Neon Postgres 직접 연결 문자열 (마이그레이션용)',
        description_ko: 'Neon Postgres 직접 연결 문자열 (마이그레이션용)',
      },
    ],
    // V2 extended fields
    domain: 'backend',
    subcategory: 'postgres',
    popularity_score: 82,
    difficulty_level: 'beginner',
    tags: ['postgres', 'serverless', 'branching', 'auto-scaling', 'open-source'],
    alternatives: ['supabase', 'planetscale'],
    compatibility: {
      framework: ['nextjs', 'react', 'express', 'django', 'rails'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'java'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@neondatabase/serverless' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$0', growth: '$19', enterprise: '$Custom' },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 16. Railway
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.railway,
    name: 'Railway',
    slug: 'railway',
    category: 'deploy',
    description:
      '데이터베이스, 크론 작업 및 자동 확장을 갖춘 풀스택 애플리케이션 배포를 위한 인프라 플랫폼입니다. GitHub에서 설정 없이 배포할 수 있습니다.',
    description_ko:
      '데이터베이스, 크론 작업 및 자동 확장을 갖춘 풀스택 애플리케이션 배포를 위한 인프라 플랫폼입니다. GitHub에서 설정 없이 배포할 수 있습니다.',
    icon_url: null,
    website_url: 'https://railway.app',
    docs_url: 'https://docs.railway.app',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Trial: $5 크레딧 또는 500시간 실행, 512 MB RAM',
      plans: [
        { name: 'Trial', price: '$0 (제한적)' },
        { name: 'Hobby', price: '$5/월' },
        { name: 'Pro', price: '$20/월/멤버' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'RAILWAY_TOKEN',
        public: false,
        description: 'CLI 배포를 위한 Railway API 토큰',
        description_ko: 'CLI 배포를 위한 Railway API 토큰',
      },
    ],
    // V2 extended fields
    domain: 'infrastructure',
    subcategory: 'paas',
    popularity_score: 80,
    difficulty_level: 'beginner',
    tags: ['hosting', 'docker', 'databases', 'paas', 'deploy', 'full-stack'],
    alternatives: ['vercel', 'render', 'fly-io'],
    compatibility: {
      framework: ['nextjs', 'react', 'express', 'django', 'rails', 'flask'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'java', 'rust', 'elixir'],
    },
    official_sdks: {},
    free_tier_quality: 'limited',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$5', growth: '$20-50', enterprise: '$Custom' },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 17. Lemon Squeezy
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.lemonsqueezy,
    name: 'Lemon Squeezy',
    slug: 'lemon-squeezy',
    category: 'payment',
    description:
      '디지털 제품 및 SaaS 판매를 위한 올인원 플랫폼으로 결제, 구독, 세금 준수 및 사기 방지를 판매 대행(MoR)으로 처리합니다.',
    description_ko:
      '디지털 제품 및 SaaS 판매를 위한 올인원 플랫폼으로 결제, 구독, 세금 준수 및 사기 방지를 판매 대행(MoR)으로 처리합니다.',
    icon_url: null,
    website_url: 'https://www.lemonsqueezy.com',
    docs_url: 'https://docs.lemonsqueezy.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '플랫폼 무료, 거래 수수료: 5% + 50¢',
      plans: [{ name: 'Standard', price: '거래당 5% + 50¢' }],
    },
    required_env_vars: [
      {
        name: 'LEMONSQUEEZY_API_KEY',
        public: false,
        description: 'Lemon Squeezy API 키',
        description_ko: 'Lemon Squeezy API 키',
      },
      {
        name: 'LEMONSQUEEZY_STORE_ID',
        public: false,
        description: 'Lemon Squeezy 스토어 ID',
        description_ko: 'Lemon Squeezy 스토어 ID',
      },
      {
        name: 'LEMONSQUEEZY_WEBHOOK_SECRET',
        public: false,
        description: 'Lemon Squeezy 웹훅 서명 시크릿',
        description_ko: 'Lemon Squeezy 웹훅 서명 시크릿',
      },
    ],
    // V2 extended fields
    domain: 'business',
    subcategory: 'payment_gateway',
    popularity_score: 70,
    difficulty_level: 'beginner',
    tags: ['payment', 'subscription', 'digital-products', 'merchant-of-record', 'tax'],
    alternatives: ['stripe'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'php'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@lemonsqueezy/lemonsqueezy.js' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 15,
    monthly_cost_estimate: { starter: '5%+50\u00A2/tx', growth: '5%+50\u00A2/tx', enterprise: '3.5%+50\u00A2/tx' },
    dx_score: 8.5,
  },

  // -----------------------------------------------------------------------
  // 18. UploadThing
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.uploadthing,
    name: 'UploadThing',
    slug: 'uploadthing',
    category: 'storage',
    description:
      '타입 안전 API, 내장 UI 컴포넌트 및 S3 호환 스토리지를 갖춘 풀스택 TypeScript 애플리케이션용 파일 업로드 솔루션입니다.',
    description_ko:
      '타입 안전 API, 내장 UI 컴포넌트 및 S3 호환 스토리지를 갖춘 풀스택 TypeScript 애플리케이션용 파일 업로드 솔루션입니다.',
    icon_url: null,
    website_url: 'https://uploadthing.com',
    docs_url: 'https://docs.uploadthing.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 2 GB 저장소, 무제한 업로드',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pro', price: '$10/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'UPLOADTHING_SECRET',
        public: false,
        description: 'UploadThing 비밀 키',
        description_ko: 'UploadThing 비밀 키',
      },
      {
        name: 'UPLOADTHING_APP_ID',
        public: false,
        description: 'UploadThing 앱 ID',
        description_ko: 'UploadThing 앱 ID',
      },
    ],
    // V2 extended fields
    domain: 'backend',
    subcategory: 'file_upload',
    popularity_score: 72,
    difficulty_level: 'beginner',
    tags: ['file-upload', 'storage', 'nextjs', 'react', 'typesafe'],
    alternatives: ['cloudinary', 'aws-s3'],
    compatibility: {
      framework: ['nextjs', 'react', 'solid', 'svelte', 'vue', 'express'],
      language: ['typescript', 'javascript'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/uploadthing' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 10,
    monthly_cost_estimate: { starter: '$0', growth: '$10', enterprise: '$Custom' },
    dx_score: 9.2,
  },

  // -----------------------------------------------------------------------
  // 19. PostHog
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.posthog,
    name: 'PostHog',
    slug: 'posthog',
    category: 'monitoring',
    description:
      '이벤트 추적, 세션 녹화, 기능 플래그, A/B 테스트 및 사용자 설문조사를 제공하는 오픈소스 제품 분석 플랫폼입니다.',
    description_ko:
      '이벤트 추적, 세션 녹화, 기능 플래그, A/B 테스트 및 사용자 설문조사를 제공하는 오픈소스 제품 분석 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://posthog.com',
    docs_url: 'https://posthog.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 월 1M 이벤트, 5K 세션 녹화, 1M 기능 플래그 요청',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pay-as-you-go', price: '이벤트당 $0.00031~' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_POSTHOG_KEY',
        public: true,
        description: 'PostHog 프로젝트 API 키',
        description_ko: 'PostHog 프로젝트 API 키',
      },
      {
        name: 'NEXT_PUBLIC_POSTHOG_HOST',
        public: true,
        description: 'PostHog 인스턴스 호스트 URL',
        description_ko: 'PostHog 인스턴스 호스트 URL',
      },
    ],
    // V2 extended fields
    domain: 'observability',
    subcategory: 'product_analytics',
    popularity_score: 82,
    difficulty_level: 'beginner',
    tags: ['analytics', 'session-replay', 'feature-flags', 'open-source', 'a-b-testing', 'product-analytics'],
    alternatives: ['ga4', 'mixpanel', 'plausible'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'angular', 'svelte', 'django', 'rails', 'flask'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'java', 'php'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/posthog-js' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$0', growth: '$0-450', enterprise: '$Custom' },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 20. AWS S3
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.awss3,
    name: 'AWS S3',
    slug: 'aws-s3',
    category: 'storage',
    description:
      '세밀한 액세스 제어, 버전 관리, 수명 주기 관리 및 CloudFront를 통한 CDN 통합을 제공하는 확장 가능한 객체 스토리지 서비스입니다.',
    description_ko:
      '세밀한 액세스 제어, 버전 관리, 수명 주기 관리 및 CloudFront를 통한 CDN 통합을 제공하는 확장 가능한 객체 스토리지 서비스입니다.',
    icon_url: null,
    website_url: 'https://aws.amazon.com/s3',
    docs_url: 'https://docs.aws.amazon.com/s3',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free Tier (12개월): 5 GB 스토리지, 20,000 GET, 2,000 PUT 요청',
      plans: [
        { name: 'S3 Standard', price: 'GB당 $0.023/월 (첫 50 TB)' },
        { name: 'S3 Intelligent-Tiering', price: '자동 계층화' },
      ],
    },
    required_env_vars: [
      {
        name: 'AWS_ACCESS_KEY_ID',
        public: false,
        description: 'AWS IAM 액세스 키 ID',
        description_ko: 'AWS IAM 액세스 키 ID',
      },
      {
        name: 'AWS_SECRET_ACCESS_KEY',
        public: false,
        description: 'AWS IAM 비밀 액세스 키',
        description_ko: 'AWS IAM 비밀 액세스 키',
      },
      {
        name: 'AWS_REGION',
        public: false,
        description: 'AWS 리전 (예: ap-northeast-2)',
        description_ko: 'AWS 리전 (예: ap-northeast-2)',
      },
      {
        name: 'AWS_S3_BUCKET_NAME',
        public: false,
        description: 'S3 버킷 이름',
        description_ko: 'S3 버킷 이름',
      },
    ],
    // V2 extended fields
    domain: 'infrastructure',
    subcategory: 'object_storage',
    popularity_score: 95,
    difficulty_level: 'intermediate',
    tags: ['storage', 'object-storage', 'static-hosting', 'cdn', 'aws', 'enterprise'],
    alternatives: ['cloudinary', 'uploadthing'],
    compatibility: {
      framework: ['nextjs', 'react', 'express', 'django', 'rails', 'flask', 'spring'],
      language: ['typescript', 'javascript', 'python', 'ruby', 'go', 'java', 'c#', 'php', 'rust'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@aws-sdk/client-s3' },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 20,
    monthly_cost_estimate: { starter: '$0-5', growth: '$20-100', enterprise: '$500+' },
    dx_score: 7.0,
  },

  // -----------------------------------------------------------------------
  // 21. GitHub
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.github,
    name: 'GitHub',
    slug: 'github',
    category: 'cicd',
    description:
      'Git-based source code hosting with pull requests, Actions CI/CD, issue tracking, and the world\'s largest developer community.',
    description_ko:
      'Git 기반 소스 코드 호스팅으로 풀 리퀘스트, Actions CI/CD, 이슈 트래킹, 세계 최대 개발자 커뮤니티를 제공합니다.',
    icon_url: null,
    website_url: 'https://github.com',
    docs_url: 'https://docs.github.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 무제한 퍼블릭 리포, 프라이빗 리포, Actions 2,000분/월',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Team', price: '$4/사용자/월' },
        { name: 'Enterprise', price: '$21/사용자/월' },
      ],
    },
    required_env_vars: [
      {
        name: 'GITHUB_TOKEN',
        public: false,
        description: 'GitHub Personal Access Token',
        description_ko: 'GitHub 개인 액세스 토큰',
      },
      {
        name: 'GITHUB_CLIENT_ID',
        public: false,
        description: 'GitHub OAuth App Client ID',
        description_ko: 'GitHub OAuth 앱 클라이언트 ID',
      },
      {
        name: 'GITHUB_CLIENT_SECRET',
        public: false,
        description: 'GitHub OAuth App Client Secret',
        description_ko: 'GitHub OAuth 앱 클라이언트 시크릿',
      },
    ],
    domain: 'devtools',
    subcategory: 'version_control',
    popularity_score: 98,
    difficulty_level: 'beginner',
    tags: ['git', 'ci/cd', 'version-control', 'actions', 'open-source', 'devtools'],
    alternatives: ['gitlab', 'bitbucket'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'svelte', 'angular', 'express'],
      language: ['typescript', 'javascript', 'python', 'go', 'rust', 'java', 'ruby'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@octokit/rest' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$0', growth: '$4/사용자', enterprise: '$21/사용자' },
    dx_score: 9.5,
  },

  // -----------------------------------------------------------------------
  // 22. Claude Code
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.claude_code,
    name: 'Claude Code',
    slug: 'claude-code',
    category: 'ai',
    description:
      'Anthropic\'s agentic coding tool for CLI. Understands codebases, edits files, runs commands, and assists with complex software engineering tasks.',
    description_ko:
      'Anthropic의 에이전트형 코딩 도구로, CLI에서 코드베이스를 이해하고 파일 편집, 명령 실행, 복잡한 소프트웨어 엔지니어링 작업을 지원합니다.',
    icon_url: null,
    website_url: 'https://claude.ai/claude-code',
    docs_url: 'https://docs.anthropic.com/en/docs/claude-code',
    pricing_info: {
      free_tier: false,
      free_tier_details: 'Anthropic API 사용량 기반 과금',
      plans: [
        { name: 'API 기반', price: '사용량 기반' },
        { name: 'Max 플랜', price: '$100/월~' },
      ],
    },
    required_env_vars: [
      {
        name: 'ANTHROPIC_API_KEY',
        public: false,
        description: 'Anthropic API Key for Claude',
        description_ko: 'Claude용 Anthropic API 키',
      },
    ],
    domain: 'ai_ml',
    subcategory: 'code_assistant',
    popularity_score: 88,
    difficulty_level: 'beginner',
    tags: ['ai', 'coding-assistant', 'cli', 'agent', 'anthropic', 'claude'],
    alternatives: ['github-copilot', 'cursor'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'svelte', 'express', 'django', 'rails'],
      language: ['typescript', 'javascript', 'python', 'go', 'rust', 'java', 'ruby', 'c#'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@anthropic-ai/sdk' },
    free_tier_quality: 'none',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$20', growth: '$100', enterprise: '$200+' },
    dx_score: 9.3,
  },

  // -----------------------------------------------------------------------
  // 23. Google Gemini
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS.google_gemini,
    name: 'Google Gemini',
    slug: 'google-gemini',
    category: 'ai',
    description:
      'Google\'s multimodal AI model family supporting text, image, audio, and video understanding with generous free tier and competitive pricing.',
    description_ko:
      'Google의 멀티모달 AI 모델로, 텍스트·이미지·오디오·비디오를 이해하며 넉넉한 무료 티어와 경쟁력 있는 가격을 제공합니다.',
    icon_url: null,
    website_url: 'https://ai.google.dev',
    docs_url: 'https://ai.google.dev/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Free: 15 RPM, 1,500 일일 요청, 1M 토큰 컨텍스트',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pay-as-you-go', price: '사용량 기반' },
      ],
    },
    required_env_vars: [
      {
        name: 'GOOGLE_GEMINI_API_KEY',
        public: false,
        description: 'Google Gemini API Key',
        description_ko: 'Google Gemini API 키',
      },
    ],
    domain: 'ai_ml',
    subcategory: 'multimodal_ai',
    popularity_score: 85,
    difficulty_level: 'beginner',
    tags: ['ai', 'multimodal', 'google', 'llm', 'vision', 'gemini'],
    alternatives: ['openai', 'anthropic'],
    compatibility: {
      framework: ['nextjs', 'react', 'vue', 'express', 'flask', 'django'],
      language: ['typescript', 'javascript', 'python', 'go', 'java', 'kotlin', 'swift'],
    },
    official_sdks: { npm: 'https://www.npmjs.com/package/@google/generative-ai' },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: { starter: '$0', growth: '$10-50', enterprise: '$100+' },
    dx_score: 8.5,
  },
];

// ---------------------------------------------------------------------------
// Checklist items – each service has 4-8 setup steps
// ---------------------------------------------------------------------------

let _checklistId = 0;
function cid(serviceSlug: string): string {
  _checklistId += 1;
  const padded = String(_checklistId).padStart(4, '0');
  return `20000000-0000-4000-b000-00000000${padded}`;
}

export const checklistItems: ChecklistItemSeed[] = [
  // =======================================================================
  // 1. Supabase
  // =======================================================================
  {
    id: cid('supabase'),
    service_id: SERVICE_IDS.supabase,
    order_index: 0,
    title: 'Supabase 프로젝트 생성',
    title_ko: 'Supabase 프로젝트 생성',
    description: 'supabase.com에서 새 프로젝트를 생성하세요. 사용자에게 가장 가까운 리전을 선택하세요.',
    description_ko: 'supabase.com에서 새 프로젝트를 생성하세요. 사용자에게 가장 가까운 리전을 선택하세요.',
    guide_url: 'https://supabase.com/docs/guides/getting-started',
  },
  {
    id: cid('supabase'),
    service_id: SERVICE_IDS.supabase,
    order_index: 1,
    title: 'API 키를 환경 변수에 복사',
    title_ko: 'API 키를 환경 변수에 복사',
    description: '설정 > API에서 프로젝트 URL, anon 키, 서비스 역할 키를 .env.local 파일에 복사하세요.',
    description_ko: '설정 > API에서 프로젝트 URL, anon 키, 서비스 역할 키를 .env.local 파일에 복사하세요.',
    guide_url: 'https://supabase.com/docs/guides/getting-started/quickstarts/nextjs',
  },
  {
    id: cid('supabase'),
    service_id: SERVICE_IDS.supabase,
    order_index: 2,
    title: 'Supabase 클라이언트 라이브러리 설치',
    title_ko: 'Supabase 클라이언트 라이브러리 설치',
    description: 'npm install @supabase/supabase-js @supabase/ssr 명령으로 필요한 패키지를 설치하세요.',
    description_ko: 'npm install @supabase/supabase-js @supabase/ssr 명령으로 필요한 패키지를 설치하세요.',
    guide_url: 'https://supabase.com/docs/reference/javascript/installing',
  },
  {
    id: cid('supabase'),
    service_id: SERVICE_IDS.supabase,
    order_index: 3,
    title: '데이터베이스 테이블 및 RLS 정책 생성',
    title_ko: '데이터베이스 테이블 및 RLS 정책 생성',
    description: '스키마를 설계하고 각 테이블에 행 수준 보안(RLS)을 활성화하여 데이터를 보호하세요.',
    description_ko: '스키마를 설계하고 각 테이블에 행 수준 보안(RLS)을 활성화하여 데이터를 보호하세요.',
    guide_url: 'https://supabase.com/docs/guides/auth/row-level-security',
  },
  {
    id: cid('supabase'),
    service_id: SERVICE_IDS.supabase,
    order_index: 4,
    title: '인증 프로바이더 설정',
    title_ko: '인증 프로바이더 설정',
    description: 'Supabase 대시보드에서 이메일/비밀번호, OAuth 또는 매직 링크 인증을 설정하세요.',
    description_ko: 'Supabase 대시보드에서 이메일/비밀번호, OAuth 또는 매직 링크 인증을 설정하세요.',
    guide_url: 'https://supabase.com/docs/guides/auth',
  },
  {
    id: cid('supabase'),
    service_id: SERVICE_IDS.supabase,
    order_index: 5,
    title: '연결 테스트',
    title_ko: '연결 테스트',
    description: 'Supabase 클라이언트가 애플리케이션에서 연결 및 CRUD 작업을 수행할 수 있는지 확인하세요.',
    description_ko: 'Supabase 클라이언트가 애플리케이션에서 연결 및 CRUD 작업을 수행할 수 있는지 확인하세요.',
    guide_url: null,
  },

  // =======================================================================
  // 2. Firebase
  // =======================================================================
  {
    id: cid('firebase'),
    service_id: SERVICE_IDS.firebase,
    order_index: 0,
    title: 'Firebase 프로젝트 생성',
    title_ko: 'Firebase 프로젝트 생성',
    description: 'Firebase 콘솔에서 새 프로젝트를 생성하세요. 필요한 경우 Google Analytics를 활성화하세요.',
    description_ko: 'Firebase 콘솔에서 새 프로젝트를 생성하세요. 필요한 경우 Google Analytics를 활성화하세요.',
    guide_url: 'https://firebase.google.com/docs/web/setup',
  },
  {
    id: cid('firebase'),
    service_id: SERVICE_IDS.firebase,
    order_index: 1,
    title: '웹 앱을 등록하고 설정 정보 가져오기',
    title_ko: '웹 앱을 등록하고 설정 정보 가져오기',
    description: '콘솔에서 웹 앱을 추가하여 API 키가 포함된 Firebase 설정 객체를 가져오세요.',
    description_ko: '콘솔에서 웹 앱을 추가하여 API 키가 포함된 Firebase 설정 객체를 가져오세요.',
    guide_url: 'https://firebase.google.com/docs/web/setup#register-app',
  },
  {
    id: cid('firebase'),
    service_id: SERVICE_IDS.firebase,
    order_index: 2,
    title: 'Firebase SDK 설치',
    title_ko: 'Firebase SDK 설치',
    description: 'npm install firebase 명령으로 Firebase JavaScript SDK를 프로젝트에 추가하세요.',
    description_ko: 'npm install firebase 명령으로 Firebase JavaScript SDK를 프로젝트에 추가하세요.',
    guide_url: 'https://firebase.google.com/docs/web/setup#add-sdks-initialize',
  },
  {
    id: cid('firebase'),
    service_id: SERVICE_IDS.firebase,
    order_index: 3,
    title: 'Firestore 데이터베이스 설정',
    title_ko: 'Firestore 데이터베이스 설정',
    description: 'Firestore 데이터베이스를 생성하고 데이터 모델에 맞는 보안 규칙을 설정하세요.',
    description_ko: 'Firestore 데이터베이스를 생성하고 데이터 모델에 맞는 보안 규칙을 설정하세요.',
    guide_url: 'https://firebase.google.com/docs/firestore/quickstart',
  },
  {
    id: cid('firebase'),
    service_id: SERVICE_IDS.firebase,
    order_index: 4,
    title: 'Firebase 인증 설정',
    title_ko: 'Firebase 인증 설정',
    description: '인증 섹션에서 원하는 로그인 프로바이더(Google, 이메일 등)를 활성화하세요.',
    description_ko: '인증 섹션에서 원하는 로그인 프로바이더(Google, 이메일 등)를 활성화하세요.',
    guide_url: 'https://firebase.google.com/docs/auth/web/start',
  },
  {
    id: cid('firebase'),
    service_id: SERVICE_IDS.firebase,
    order_index: 5,
    title: 'Firebase Admin SDK 설정 (서버 측)',
    title_ko: 'Firebase Admin SDK 설정 (서버 측)',
    description: '서비스 계정 키를 생성하고 서버 측 작업을 위해 Admin SDK를 설정하세요.',
    description_ko: '서비스 계정 키를 생성하고 서버 측 작업을 위해 Admin SDK를 설정하세요.',
    guide_url: 'https://firebase.google.com/docs/admin/setup',
  },

  // =======================================================================
  // 3. Vercel
  // =======================================================================
  {
    id: cid('vercel'),
    service_id: SERVICE_IDS.vercel,
    order_index: 0,
    title: 'Vercel 계정 생성',
    title_ko: 'Vercel 계정 생성',
    description: 'GitHub, GitLab 또는 Bitbucket 계정을 사용하여 vercel.com에서 가입하세요.',
    description_ko: 'GitHub, GitLab 또는 Bitbucket 계정을 사용하여 vercel.com에서 가입하세요.',
    guide_url: 'https://vercel.com/docs/getting-started-with-vercel',
  },
  {
    id: cid('vercel'),
    service_id: SERVICE_IDS.vercel,
    order_index: 1,
    title: 'Git 리포지토리 가져오기 및 연결',
    title_ko: 'Git 리포지토리 가져오기 및 연결',
    description: 'GitHub에서 프로젝트 리포지토리를 가져와 자동 배포를 활성화하세요.',
    description_ko: 'GitHub에서 프로젝트 리포지토리를 가져와 자동 배포를 활성화하세요.',
    guide_url: 'https://vercel.com/docs/deployments/git',
  },
  {
    id: cid('vercel'),
    service_id: SERVICE_IDS.vercel,
    order_index: 2,
    title: '환경 변수 설정',
    title_ko: '환경 변수 설정',
    description: '프로젝트 설정 > 환경 변수에서 필요한 모든 환경 변수를 추가하세요.',
    description_ko: '프로젝트 설정 > 환경 변수에서 필요한 모든 환경 변수를 추가하세요.',
    guide_url: 'https://vercel.com/docs/environment-variables',
  },
  {
    id: cid('vercel'),
    service_id: SERVICE_IDS.vercel,
    order_index: 3,
    title: '커스텀 도메인 설정',
    title_ko: '커스텀 도메인 설정',
    description: '커스텀 도메인을 추가하고 프로덕션 배포를 위한 DNS 설정을 구성하세요.',
    description_ko: '커스텀 도메인을 추가하고 프로덕션 배포를 위한 DNS 설정을 구성하세요.',
    guide_url: 'https://vercel.com/docs/custom-domains',
  },
  {
    id: cid('vercel'),
    service_id: SERVICE_IDS.vercel,
    order_index: 4,
    title: '배포 및 프리뷰 URL 확인',
    title_ko: '배포 및 프리뷰 URL 확인',
    description: '배포가 올바르게 작동하고 PR에 대한 프리뷰 URL이 생성되는지 확인하세요.',
    description_ko: '배포가 올바르게 작동하고 PR에 대한 프리뷰 URL이 생성되는지 확인하세요.',
    guide_url: 'https://vercel.com/docs/deployments/preview-deployments',
  },

  // =======================================================================
  // 4. Netlify
  // =======================================================================
  {
    id: cid('netlify'),
    service_id: SERVICE_IDS.netlify,
    order_index: 0,
    title: 'Netlify 계정 및 팀 생성',
    title_ko: 'Netlify 계정 및 팀 생성',
    description: 'netlify.com에서 가입하고 프로젝트를 위한 팀을 생성하세요.',
    description_ko: 'netlify.com에서 가입하고 프로젝트를 위한 팀을 생성하세요.',
    guide_url: 'https://docs.netlify.com/get-started',
  },
  {
    id: cid('netlify'),
    service_id: SERVICE_IDS.netlify,
    order_index: 1,
    title: 'Git 리포지토리 연결',
    title_ko: 'Git 리포지토리 연결',
    description: '지속적 배포를 위해 GitHub/GitLab/Bitbucket 리포지토리를 연결하세요.',
    description_ko: '지속적 배포를 위해 GitHub/GitLab/Bitbucket 리포지토리를 연결하세요.',
    guide_url: 'https://docs.netlify.com/git/overview',
  },
  {
    id: cid('netlify'),
    service_id: SERVICE_IDS.netlify,
    order_index: 2,
    title: '빌드 설정 구성',
    title_ko: '빌드 설정 구성',
    description: '빌드 명령어, 퍼블리시 디렉토리 및 필요한 빌드 플러그인을 설정하세요.',
    description_ko: '빌드 명령어, 퍼블리시 디렉토리 및 필요한 빌드 플러그인을 설정하세요.',
    guide_url: 'https://docs.netlify.com/configure-builds/overview',
  },
  {
    id: cid('netlify'),
    service_id: SERVICE_IDS.netlify,
    order_index: 3,
    title: '환경 변수 설정',
    title_ko: '환경 변수 설정',
    description: '사이트 설정 > 빌드 및 배포 > 환경에서 환경 변수를 추가하세요.',
    description_ko: '사이트 설정 > 빌드 및 배포 > 환경에서 환경 변수를 추가하세요.',
    guide_url: 'https://docs.netlify.com/environment-variables/overview',
  },
  {
    id: cid('netlify'),
    service_id: SERVICE_IDS.netlify,
    order_index: 4,
    title: '커스텀 도메인 및 HTTPS 설정',
    title_ko: '커스텀 도메인 및 HTTPS 설정',
    description: '커스텀 도메인을 추가하면 Netlify가 자동으로 SSL 인증서를 프로비저닝합니다.',
    description_ko: '커스텀 도메인을 추가하면 Netlify가 자동으로 SSL 인증서를 프로비저닝합니다.',
    guide_url: 'https://docs.netlify.com/domains-https/custom-domains',
  },
  {
    id: cid('netlify'),
    service_id: SERVICE_IDS.netlify,
    order_index: 5,
    title: '배포 프리뷰 테스트',
    title_ko: '배포 프리뷰 테스트',
    description: 'Pull Request에 대한 배포 프리뷰가 생성되고 올바르게 작동하는지 확인하세요.',
    description_ko: 'Pull Request에 대한 배포 프리뷰가 생성되고 올바르게 작동하는지 확인하세요.',
    guide_url: null,
  },

  // =======================================================================
  // 5. Stripe
  // =======================================================================
  {
    id: cid('stripe'),
    service_id: SERVICE_IDS.stripe,
    order_index: 0,
    title: 'Stripe 계정 생성',
    title_ko: 'Stripe 계정 생성',
    description: 'stripe.com에서 가입하고 실제 결제를 위해 사업자 인증을 완료하세요.',
    description_ko: 'stripe.com에서 가입하고 실제 결제를 위해 사업자 인증을 완료하세요.',
    guide_url: 'https://stripe.com/docs/development/quickstart',
  },
  {
    id: cid('stripe'),
    service_id: SERVICE_IDS.stripe,
    order_index: 1,
    title: 'API 키 복사 (먼저 테스트 모드)',
    title_ko: 'API 키 복사 (먼저 테스트 모드)',
    description: '개발자 > API 키에서 공개 키와 비밀 키를 가져오세요. 테스트 모드 키부터 시작하세요.',
    description_ko: '개발자 > API 키에서 공개 키와 비밀 키를 가져오세요. 테스트 모드 키부터 시작하세요.',
    guide_url: 'https://stripe.com/docs/keys',
  },
  {
    id: cid('stripe'),
    service_id: SERVICE_IDS.stripe,
    order_index: 2,
    title: 'Stripe SDK 설치',
    title_ko: 'Stripe SDK 설치',
    description: 'npm install stripe @stripe/stripe-js 명령으로 서버 및 클라이언트 라이브러리를 추가하세요.',
    description_ko: 'npm install stripe @stripe/stripe-js 명령으로 서버 및 클라이언트 라이브러리를 추가하세요.',
    guide_url: 'https://stripe.com/docs/payments/quickstart',
  },
  {
    id: cid('stripe'),
    service_id: SERVICE_IDS.stripe,
    order_index: 3,
    title: '상품 및 가격 생성',
    title_ko: '상품 및 가격 생성',
    description: 'Stripe 대시보드 또는 API를 통해 상품 및 가격 플랜을 설정하세요.',
    description_ko: 'Stripe 대시보드 또는 API를 통해 상품 및 가격 플랜을 설정하세요.',
    guide_url: 'https://stripe.com/docs/products-prices/overview',
  },
  {
    id: cid('stripe'),
    service_id: SERVICE_IDS.stripe,
    order_index: 4,
    title: '웹훅 엔드포인트 설정',
    title_ko: '웹훅 엔드포인트 설정',
    description: '결제 이벤트(checkout.session.completed 등)를 처리할 웹훅 엔드포인트를 생성하세요.',
    description_ko: '결제 이벤트(checkout.session.completed 등)를 처리할 웹훅 엔드포인트를 생성하세요.',
    guide_url: 'https://stripe.com/docs/webhooks',
  },
  {
    id: cid('stripe'),
    service_id: SERVICE_IDS.stripe,
    order_index: 5,
    title: 'Stripe CLI로 테스트',
    title_ko: 'Stripe CLI로 테스트',
    description: 'Stripe CLI를 사용하여 웹훅을 로컬로 전달하고 결제 흐름을 엔드투엔드로 테스트하세요.',
    description_ko: 'Stripe CLI를 사용하여 웹훅을 로컬로 전달하고 결제 흐름을 엔드투엔드로 테스트하세요.',
    guide_url: 'https://stripe.com/docs/stripe-cli',
  },
  {
    id: cid('stripe'),
    service_id: SERVICE_IDS.stripe,
    order_index: 6,
    title: 'Checkout 또는 Payment Elements 구현',
    title_ko: 'Checkout 또는 Payment Elements 구현',
    description: '결제 수집을 위해 Stripe Checkout(호스팅) 또는 Payment Elements(임베디드)를 통합하세요.',
    description_ko: '결제 수집을 위해 Stripe Checkout(호스팅) 또는 Payment Elements(임베디드)를 통합하세요.',
    guide_url: 'https://stripe.com/docs/payments/checkout',
  },

  // =======================================================================
  // 6. Clerk
  // =======================================================================
  {
    id: cid('clerk'),
    service_id: SERVICE_IDS.clerk,
    order_index: 0,
    title: 'Clerk 애플리케이션 생성',
    title_ko: 'Clerk 애플리케이션 생성',
    description: 'clerk.com에서 가입하고 원하는 인증 방식으로 새 애플리케이션을 생성하세요.',
    description_ko: 'clerk.com에서 가입하고 원하는 인증 방식으로 새 애플리케이션을 생성하세요.',
    guide_url: 'https://clerk.com/docs/quickstarts/nextjs',
  },
  {
    id: cid('clerk'),
    service_id: SERVICE_IDS.clerk,
    order_index: 1,
    title: 'Clerk SDK 설치',
    title_ko: 'Clerk SDK 설치',
    description: 'npm install @clerk/nextjs 명령으로 Clerk Next.js 통합을 추가하세요.',
    description_ko: 'npm install @clerk/nextjs 명령으로 Clerk Next.js 통합을 추가하세요.',
    guide_url: 'https://clerk.com/docs/references/nextjs/overview',
  },
  {
    id: cid('clerk'),
    service_id: SERVICE_IDS.clerk,
    order_index: 2,
    title: '환경 변수 추가',
    title_ko: '환경 변수 추가',
    description: 'Clerk 대시보드에서 공개 키와 비밀 키를 .env.local에 복사하세요.',
    description_ko: 'Clerk 대시보드에서 공개 키와 비밀 키를 .env.local에 복사하세요.',
    guide_url: 'https://clerk.com/docs/quickstarts/nextjs#set-environment-keys',
  },
  {
    id: cid('clerk'),
    service_id: SERVICE_IDS.clerk,
    order_index: 3,
    title: 'ClerkProvider로 앱 감싸기',
    title_ko: 'ClerkProvider로 앱 감싸기',
    description: '루트 레이아웃에 ClerkProvider를 추가하여 앱 전체에서 인증을 활성화하세요.',
    description_ko: '루트 레이아웃에 ClerkProvider를 추가하여 앱 전체에서 인증을 활성화하세요.',
    guide_url: 'https://clerk.com/docs/components/clerk-provider',
  },
  {
    id: cid('clerk'),
    service_id: SERVICE_IDS.clerk,
    order_index: 4,
    title: '라우트 보호를 위한 미들웨어 설정',
    title_ko: '라우트 보호를 위한 미들웨어 설정',
    description: 'middleware.ts를 생성하여 라우트를 보호하고 공개/비공개 페이지를 정의하세요.',
    description_ko: 'middleware.ts를 생성하여 라우트를 보호하고 공개/비공개 페이지를 정의하세요.',
    guide_url: 'https://clerk.com/docs/references/nextjs/clerk-middleware',
  },
  {
    id: cid('clerk'),
    service_id: SERVICE_IDS.clerk,
    order_index: 5,
    title: '로그인 및 회원가입 페이지 추가',
    title_ko: '로그인 및 회원가입 페이지 추가',
    description: 'Clerk 사전 구축 컴포넌트를 사용하여 로그인 및 회원가입 페이지를 생성하세요.',
    description_ko: 'Clerk 사전 구축 컴포넌트를 사용하여 로그인 및 회원가입 페이지를 생성하세요.',
    guide_url: 'https://clerk.com/docs/components/authentication/sign-in',
  },

  // =======================================================================
  // 7. NextAuth / Auth.js
  // =======================================================================
  {
    id: cid('nextauth'),
    service_id: SERVICE_IDS.nextauth,
    order_index: 0,
    title: 'NextAuth.js 설치',
    title_ko: 'NextAuth.js 설치',
    description: 'npm install next-auth 명령으로 인증 라이브러리를 추가하세요.',
    description_ko: 'npm install next-auth 명령으로 인증 라이브러리를 추가하세요.',
    guide_url: 'https://authjs.dev/getting-started/installation',
  },
  {
    id: cid('nextauth'),
    service_id: SERVICE_IDS.nextauth,
    order_index: 1,
    title: 'NEXTAUTH_SECRET 생성',
    title_ko: 'NEXTAUTH_SECRET 생성',
    description: 'openssl rand -base64 32 명령으로 토큰 암호화를 위한 랜덤 시크릿을 생성하세요.',
    description_ko: 'openssl rand -base64 32 명령으로 토큰 암호화를 위한 랜덤 시크릿을 생성하세요.',
    guide_url: 'https://authjs.dev/getting-started/deployment',
  },
  {
    id: cid('nextauth'),
    service_id: SERVICE_IDS.nextauth,
    order_index: 2,
    title: 'OAuth 프로바이더 설정',
    title_ko: 'OAuth 프로바이더 설정',
    description: '인증 설정 파일에서 GitHub, Google 또는 Discord 등의 프로바이더를 설정하세요.',
    description_ko: '인증 설정 파일에서 GitHub, Google 또는 Discord 등의 프로바이더를 설정하세요.',
    guide_url: 'https://authjs.dev/getting-started/providers',
  },
  {
    id: cid('nextauth'),
    service_id: SERVICE_IDS.nextauth,
    order_index: 3,
    title: '프로바이더 플랫폼에서 OAuth 앱 생성',
    title_ko: '프로바이더 플랫폼에서 OAuth 앱 생성',
    description: 'GitHub/Google 등에서 OAuth 애플리케이션을 등록하고 클라이언트 ID와 시크릿을 받으세요.',
    description_ko: 'GitHub/Google 등에서 OAuth 애플리케이션을 등록하고 클라이언트 ID와 시크릿을 받으세요.',
    guide_url: 'https://authjs.dev/getting-started/providers/github',
  },
  {
    id: cid('nextauth'),
    service_id: SERVICE_IDS.nextauth,
    order_index: 4,
    title: 'API 라우트 및 세션 프로바이더 설정',
    title_ko: 'API 라우트 및 세션 프로바이더 설정',
    description: '인증 API 라우트 핸들러를 생성하고 앱을 SessionProvider로 감싸세요.',
    description_ko: '인증 API 라우트 핸들러를 생성하고 앱을 SessionProvider로 감싸세요.',
    guide_url: 'https://authjs.dev/getting-started/session-management',
  },
  {
    id: cid('nextauth'),
    service_id: SERVICE_IDS.nextauth,
    order_index: 5,
    title: '데이터베이스 어댑터 연결 (선택사항)',
    title_ko: '데이터베이스 어댑터 연결 (선택사항)',
    description: '지속적인 세션 저장을 위해 데이터베이스 어댑터(Prisma, Drizzle 등)를 설치하세요.',
    description_ko: '지속적인 세션 저장을 위해 데이터베이스 어댑터(Prisma, Drizzle 등)를 설치하세요.',
    guide_url: 'https://authjs.dev/getting-started/adapters',
  },

  // =======================================================================
  // 8. Resend
  // =======================================================================
  {
    id: cid('resend'),
    service_id: SERVICE_IDS.resend,
    order_index: 0,
    title: 'Resend 계정 생성',
    title_ko: 'Resend 계정 생성',
    description: 'resend.com에서 가입하고 이메일 주소를 인증하세요.',
    description_ko: 'resend.com에서 가입하고 이메일 주소를 인증하세요.',
    guide_url: 'https://resend.com/docs/introduction',
  },
  {
    id: cid('resend'),
    service_id: SERVICE_IDS.resend,
    order_index: 1,
    title: 'API 키 생성',
    title_ko: 'API 키 생성',
    description: 'Resend 대시보드에서 API 키를 생성하고 환경 변수에 추가하세요.',
    description_ko: 'Resend 대시보드에서 API 키를 생성하고 환경 변수에 추가하세요.',
    guide_url: 'https://resend.com/docs/api-reference/api-keys/create-api-key',
  },
  {
    id: cid('resend'),
    service_id: SERVICE_IDS.resend,
    order_index: 2,
    title: '발신 도메인 인증',
    title_ko: '발신 도메인 인증',
    description: '이메일 발송을 위해 DNS 레코드를 추가하여 커스텀 도메인을 인증하세요.',
    description_ko: '이메일 발송을 위해 DNS 레코드를 추가하여 커스텀 도메인을 인증하세요.',
    guide_url: 'https://resend.com/docs/dashboard/domains/introduction',
  },
  {
    id: cid('resend'),
    service_id: SERVICE_IDS.resend,
    order_index: 3,
    title: 'Resend SDK 설치',
    title_ko: 'Resend SDK 설치',
    description: 'npm install resend 명령으로 Resend Node.js SDK를 추가하세요.',
    description_ko: 'npm install resend 명령으로 Resend Node.js SDK를 추가하세요.',
    guide_url: 'https://resend.com/docs/sdks/typescript',
  },
  {
    id: cid('resend'),
    service_id: SERVICE_IDS.resend,
    order_index: 4,
    title: '테스트 이메일 전송',
    title_ko: '테스트 이메일 전송',
    description: 'Resend API를 사용하여 테스트 이메일을 전송하고 설정이 올바르게 작동하는지 확인하세요.',
    description_ko: 'Resend API를 사용하여 테스트 이메일을 전송하고 설정이 올바르게 작동하는지 확인하세요.',
    guide_url: 'https://resend.com/docs/send-with-nextjs',
  },

  // =======================================================================
  // 9. SendGrid
  // =======================================================================
  {
    id: cid('sendgrid'),
    service_id: SERVICE_IDS.sendgrid,
    order_index: 0,
    title: 'SendGrid 계정 생성',
    title_ko: 'SendGrid 계정 생성',
    description: 'sendgrid.com에서 가입하고 발신자 ID 인증을 완료하세요.',
    description_ko: 'sendgrid.com에서 가입하고 발신자 ID 인증을 완료하세요.',
    guide_url: 'https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs',
  },
  {
    id: cid('sendgrid'),
    service_id: SERVICE_IDS.sendgrid,
    order_index: 1,
    title: 'API 키 생성',
    title_ko: 'API 키 생성',
    description: '설정 > API 키에서 Mail Send 권한이 있는 API 키를 생성하세요.',
    description_ko: '설정 > API 키에서 Mail Send 권한이 있는 API 키를 생성하세요.',
    guide_url: 'https://docs.sendgrid.com/ui/account-and-settings/api-keys',
  },
  {
    id: cid('sendgrid'),
    service_id: SERVICE_IDS.sendgrid,
    order_index: 2,
    title: '발신자 ID 인증',
    title_ko: '발신자 ID 인증',
    description: '단일 발신자를 인증하거나 이메일 발송을 위해 도메인을 인증하세요.',
    description_ko: '단일 발신자를 인증하거나 이메일 발송을 위해 도메인을 인증하세요.',
    guide_url: 'https://docs.sendgrid.com/ui/sending-email/sender-verification',
  },
  {
    id: cid('sendgrid'),
    service_id: SERVICE_IDS.sendgrid,
    order_index: 3,
    title: 'SendGrid SDK 설치',
    title_ko: 'SendGrid SDK 설치',
    description: 'npm install @sendgrid/mail 명령으로 SendGrid 이메일 클라이언트를 추가하세요.',
    description_ko: 'npm install @sendgrid/mail 명령으로 SendGrid 이메일 클라이언트를 추가하세요.',
    guide_url: 'https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs',
  },
  {
    id: cid('sendgrid'),
    service_id: SERVICE_IDS.sendgrid,
    order_index: 4,
    title: '테스트 이메일 전송',
    title_ko: '테스트 이메일 전송',
    description: 'SDK를 사용하여 테스트 이메일을 전송하고 SendGrid 활동 피드에서 전송을 확인하세요.',
    description_ko: 'SDK를 사용하여 테스트 이메일을 전송하고 SendGrid 활동 피드에서 전송을 확인하세요.',
    guide_url: null,
  },

  // =======================================================================
  // 10. OpenAI
  // =======================================================================
  {
    id: cid('openai'),
    service_id: SERVICE_IDS.openai,
    order_index: 0,
    title: 'OpenAI 계정 생성 및 API 키 받기',
    title_ko: 'OpenAI 계정 생성 및 API 키 받기',
    description: 'platform.openai.com에서 가입하고 설정에서 API 키를 생성하세요.',
    description_ko: 'platform.openai.com에서 가입하고 설정에서 API 키를 생성하세요.',
    guide_url: 'https://platform.openai.com/docs/quickstart',
  },
  {
    id: cid('openai'),
    service_id: SERVICE_IDS.openai,
    order_index: 1,
    title: '결제 및 사용량 제한 설정',
    title_ko: '결제 및 사용량 제한 설정',
    description: '결제 수단을 추가하고 예상치 못한 요금을 방지하기 위해 월간 지출 한도를 설정하세요.',
    description_ko: '결제 수단을 추가하고 예상치 못한 요금을 방지하기 위해 월간 지출 한도를 설정하세요.',
    guide_url: 'https://platform.openai.com/docs/guides/production-best-practices',
  },
  {
    id: cid('openai'),
    service_id: SERVICE_IDS.openai,
    order_index: 2,
    title: 'OpenAI SDK 설치',
    title_ko: 'OpenAI SDK 설치',
    description: 'npm install openai 명령으로 공식 OpenAI Node.js 라이브러리를 추가하세요.',
    description_ko: 'npm install openai 명령으로 공식 OpenAI Node.js 라이브러리를 추가하세요.',
    guide_url: 'https://platform.openai.com/docs/libraries/node-js-library',
  },
  {
    id: cid('openai'),
    service_id: SERVICE_IDS.openai,
    order_index: 3,
    title: '테스트 API 호출 수행',
    title_ko: '테스트 API 호출 수행',
    description: '테스트 채팅 완성 요청을 전송하여 API 키 및 SDK 설정을 확인하세요.',
    description_ko: '테스트 채팅 완성 요청을 전송하여 API 키 및 SDK 설정을 확인하세요.',
    guide_url: 'https://platform.openai.com/docs/api-reference/chat/create',
  },
  {
    id: cid('openai'),
    service_id: SERVICE_IDS.openai,
    order_index: 4,
    title: '에러 처리 및 속도 제한 구현',
    title_ko: '에러 처리 및 속도 제한 구현',
    description: 'API 호출에 적절한 에러 처리, 재시도 및 속도 제한 관리를 추가하세요.',
    description_ko: 'API 호출에 적절한 에러 처리, 재시도 및 속도 제한 관리를 추가하세요.',
    guide_url: 'https://platform.openai.com/docs/guides/rate-limits',
  },
  {
    id: cid('openai'),
    service_id: SERVICE_IDS.openai,
    order_index: 5,
    title: '스트리밍 응답 설정 (선택사항)',
    title_ko: '스트리밍 응답 설정 (선택사항)',
    description: 'Vercel AI SDK 또는 SSE를 사용하여 실시간 토큰 전달을 위한 스트리밍을 구현하세요.',
    description_ko: 'Vercel AI SDK 또는 SSE를 사용하여 실시간 토큰 전달을 위한 스트리밍을 구현하세요.',
    guide_url: 'https://platform.openai.com/docs/api-reference/streaming',
  },

  // =======================================================================
  // 11. Anthropic
  // =======================================================================
  {
    id: cid('anthropic'),
    service_id: SERVICE_IDS.anthropic,
    order_index: 0,
    title: 'Anthropic 계정 생성 및 API 키 받기',
    title_ko: 'Anthropic 계정 생성 및 API 키 받기',
    description: 'console.anthropic.com에서 가입하고 API 키를 생성하세요.',
    description_ko: 'console.anthropic.com에서 가입하고 API 키를 생성하세요.',
    guide_url: 'https://docs.anthropic.com/en/docs/initial-setup',
  },
  {
    id: cid('anthropic'),
    service_id: SERVICE_IDS.anthropic,
    order_index: 1,
    title: '결제 설정',
    title_ko: '결제 설정',
    description: '콘솔에서 결제 수단을 추가하고 지출 한도를 설정하세요.',
    description_ko: '콘솔에서 결제 수단을 추가하고 지출 한도를 설정하세요.',
    guide_url: 'https://docs.anthropic.com/en/docs/initial-setup#prerequisites',
  },
  {
    id: cid('anthropic'),
    service_id: SERVICE_IDS.anthropic,
    order_index: 2,
    title: 'Anthropic SDK 설치',
    title_ko: 'Anthropic SDK 설치',
    description: 'npm install @anthropic-ai/sdk 명령으로 공식 SDK를 추가하세요.',
    description_ko: 'npm install @anthropic-ai/sdk 명령으로 공식 SDK를 추가하세요.',
    guide_url: 'https://docs.anthropic.com/en/docs/quickstart',
  },
  {
    id: cid('anthropic'),
    service_id: SERVICE_IDS.anthropic,
    order_index: 3,
    title: '테스트 API 호출 수행',
    title_ko: '테스트 API 호출 수행',
    description: '테스트 메시지를 전송하여 API 키 및 SDK 통합을 확인하세요.',
    description_ko: '테스트 메시지를 전송하여 API 키 및 SDK 통합을 확인하세요.',
    guide_url: 'https://docs.anthropic.com/en/api/messages',
  },
  {
    id: cid('anthropic'),
    service_id: SERVICE_IDS.anthropic,
    order_index: 4,
    title: '스트리밍 구현 (선택사항)',
    title_ko: '스트리밍 구현 (선택사항)',
    description: 'SSE 또는 Vercel AI SDK를 사용하여 실시간 출력을 위한 스트리밍 응답을 설정하세요.',
    description_ko: 'SSE 또는 Vercel AI SDK를 사용하여 실시간 출력을 위한 스트리밍 응답을 설정하세요.',
    guide_url: 'https://docs.anthropic.com/en/api/messages-streaming',
  },

  // =======================================================================
  // 12. Cloudinary
  // =======================================================================
  {
    id: cid('cloudinary'),
    service_id: SERVICE_IDS.cloudinary,
    order_index: 0,
    title: 'Cloudinary 계정 생성',
    title_ko: 'Cloudinary 계정 생성',
    description: 'cloudinary.com에서 가입하고 클라우드 이름, API 키, API 시크릿을 받으세요.',
    description_ko: 'cloudinary.com에서 가입하고 클라우드 이름, API 키, API 시크릿을 받으세요.',
    guide_url: 'https://cloudinary.com/documentation/how_to_integrate_cloudinary',
  },
  {
    id: cid('cloudinary'),
    service_id: SERVICE_IDS.cloudinary,
    order_index: 1,
    title: 'Cloudinary SDK 설치',
    title_ko: 'Cloudinary SDK 설치',
    description: 'npm install cloudinary next-cloudinary 명령으로 서버 및 React 통합을 설치하세요.',
    description_ko: 'npm install cloudinary next-cloudinary 명령으로 서버 및 React 통합을 설치하세요.',
    guide_url: 'https://next.cloudinary.dev/installation',
  },
  {
    id: cid('cloudinary'),
    service_id: SERVICE_IDS.cloudinary,
    order_index: 2,
    title: '환경 변수 설정',
    title_ko: '환경 변수 설정',
    description: '.env.local 파일에 CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET을 추가하세요.',
    description_ko: '.env.local 파일에 CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET을 추가하세요.',
    guide_url: 'https://cloudinary.com/documentation/node_integration#setting_configuration_parameters',
  },
  {
    id: cid('cloudinary'),
    service_id: SERVICE_IDS.cloudinary,
    order_index: 3,
    title: '업로드 프리셋 설정',
    title_ko: '업로드 프리셋 설정',
    description: '다양한 사용 사례(프로필 이미지, 콘텐츠 미디어 등)에 맞는 업로드 프리셋을 생성하세요.',
    description_ko: '다양한 사용 사례(프로필 이미지, 콘텐츠 미디어 등)에 맞는 업로드 프리셋을 생성하세요.',
    guide_url: 'https://cloudinary.com/documentation/upload_presets',
  },
  {
    id: cid('cloudinary'),
    service_id: SERVICE_IDS.cloudinary,
    order_index: 4,
    title: '이미지 업로드 및 변환 테스트',
    title_ko: '이미지 업로드 및 변환 테스트',
    description: '테스트 이미지를 업로드하고 변환(크기 조정, 자르기, 형식)이 올바르게 작동하는지 확인하세요.',
    description_ko: '테스트 이미지를 업로드하고 변환(크기 조정, 자르기, 형식)이 올바르게 작동하는지 확인하세요.',
    guide_url: 'https://cloudinary.com/documentation/image_transformations',
  },

  // =======================================================================
  // 13. Sentry
  // =======================================================================
  {
    id: cid('sentry'),
    service_id: SERVICE_IDS.sentry,
    order_index: 0,
    title: 'Sentry 프로젝트 생성',
    title_ko: 'Sentry 프로젝트 생성',
    description: 'sentry.io에서 가입하고 Next.js 애플리케이션용 새 프로젝트를 생성하세요.',
    description_ko: 'sentry.io에서 가입하고 Next.js 애플리케이션용 새 프로젝트를 생성하세요.',
    guide_url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/',
  },
  {
    id: cid('sentry'),
    service_id: SERVICE_IDS.sentry,
    order_index: 1,
    title: '위저드로 Sentry SDK 설치',
    title_ko: '위저드로 Sentry SDK 설치',
    description: 'npx @sentry/wizard@latest -i nextjs 명령으로 Sentry를 자동 설정하세요.',
    description_ko: 'npx @sentry/wizard@latest -i nextjs 명령으로 Sentry를 자동 설정하세요.',
    guide_url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/#install',
  },
  {
    id: cid('sentry'),
    service_id: SERVICE_IDS.sentry,
    order_index: 2,
    title: 'DSN 및 인증 토큰 설정',
    title_ko: 'DSN 및 인증 토큰 설정',
    description: '환경 변수에 SENTRY_DSN, SENTRY_AUTH_TOKEN, 조직, 프로젝트를 추가하세요.',
    description_ko: '환경 변수에 SENTRY_DSN, SENTRY_AUTH_TOKEN, 조직, 프로젝트를 추가하세요.',
    guide_url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/',
  },
  {
    id: cid('sentry'),
    service_id: SERVICE_IDS.sentry,
    order_index: 3,
    title: '소스맵 업로드 설정',
    title_ko: '소스맵 업로드 설정',
    description: '빌드 프로세스 중 소스맵을 업로드하도록 Sentry 웹팩 플러그인을 설정하세요.',
    description_ko: '빌드 프로세스 중 소스맵을 업로드하도록 Sentry 웹팩 플러그인을 설정하세요.',
    guide_url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/',
  },
  {
    id: cid('sentry'),
    service_id: SERVICE_IDS.sentry,
    order_index: 4,
    title: '에러 리포팅 테스트',
    title_ko: '에러 리포팅 테스트',
    description: '테스트 에러를 발생시키고 Sentry 대시보드에 표시되는지 확인하세요.',
    description_ko: '테스트 에러를 발생시키고 Sentry 대시보드에 표시되는지 확인하세요.',
    guide_url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/verify/',
  },
  {
    id: cid('sentry'),
    service_id: SERVICE_IDS.sentry,
    order_index: 5,
    title: '성능 모니터링 설정',
    title_ko: '성능 모니터링 설정',
    description: '트랜잭션 지속 시간 및 웹 바이탈을 추적하기 위한 성능 모니터링을 활성화하세요.',
    description_ko: '트랜잭션 지속 시간 및 웹 바이탈을 추적하기 위한 성능 모니터링을 활성화하세요.',
    guide_url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/performance/',
  },

  // =======================================================================
  // 14. PlanetScale
  // =======================================================================
  {
    id: cid('planetscale'),
    service_id: SERVICE_IDS.planetscale,
    order_index: 0,
    title: 'PlanetScale 데이터베이스 생성',
    title_ko: 'PlanetScale 데이터베이스 생성',
    description: 'planetscale.com에서 가입하고 새 데이터베이스를 생성하세요. 사용자에게 가까운 리전을 선택하세요.',
    description_ko: 'planetscale.com에서 가입하고 새 데이터베이스를 생성하세요. 사용자에게 가까운 리전을 선택하세요.',
    guide_url: 'https://planetscale.com/docs/tutorials/planetscale-quick-start-guide',
  },
  {
    id: cid('planetscale'),
    service_id: SERVICE_IDS.planetscale,
    order_index: 1,
    title: '연결 문자열 가져오기',
    title_ko: '연결 문자열 가져오기',
    description: '브랜치 탭에서 연결 문자열을 생성하고 DATABASE_URL에 추가하세요.',
    description_ko: '브랜치 탭에서 연결 문자열을 생성하고 DATABASE_URL에 추가하세요.',
    guide_url: 'https://planetscale.com/docs/concepts/connection-strings',
  },
  {
    id: cid('planetscale'),
    service_id: SERVICE_IDS.planetscale,
    order_index: 2,
    title: 'Prisma 또는 Drizzle로 스키마 설정',
    title_ko: 'Prisma 또는 Drizzle로 스키마 설정',
    description: 'ORM이 PlanetScale 드라이버를 사용하도록 설정하고 스키마를 푸시하세요.',
    description_ko: 'ORM이 PlanetScale 드라이버를 사용하도록 설정하고 스키마를 푸시하세요.',
    guide_url: 'https://planetscale.com/docs/prisma/prisma-quickstart',
  },
  {
    id: cid('planetscale'),
    service_id: SERVICE_IDS.planetscale,
    order_index: 3,
    title: '개발 브랜치 생성',
    title_ko: '개발 브랜치 생성',
    description: '스키마 변경을 안전하게 테스트하기 위해 개발용 별도 브랜치를 생성하세요.',
    description_ko: '스키마 변경을 안전하게 테스트하기 위해 개발용 별도 브랜치를 생성하세요.',
    guide_url: 'https://planetscale.com/docs/concepts/branching',
  },
  {
    id: cid('planetscale'),
    service_id: SERVICE_IDS.planetscale,
    order_index: 4,
    title: '데이터베이스 연결 테스트',
    title_ko: '데이터베이스 연결 테스트',
    description: '데이터베이스에 연결하고 기본 CRUD 작업을 수행할 수 있는지 확인하세요.',
    description_ko: '데이터베이스에 연결하고 기본 CRUD 작업을 수행할 수 있는지 확인하세요.',
    guide_url: null,
  },

  // =======================================================================
  // 15. Neon
  // =======================================================================
  {
    id: cid('neon'),
    service_id: SERVICE_IDS.neon,
    order_index: 0,
    title: 'Neon 프로젝트 생성',
    title_ko: 'Neon 프로젝트 생성',
    description: 'neon.tech에서 가입하고 Postgres 데이터베이스로 새 프로젝트를 생성하세요.',
    description_ko: 'neon.tech에서 가입하고 Postgres 데이터베이스로 새 프로젝트를 생성하세요.',
    guide_url: 'https://neon.tech/docs/get-started-with-neon/signing-up',
  },
  {
    id: cid('neon'),
    service_id: SERVICE_IDS.neon,
    order_index: 1,
    title: '연결 문자열 복사',
    title_ko: '연결 문자열 복사',
    description: '대시보드에서 풀링 및 직접 연결 문자열을 가져와 .env.local에 추가하세요.',
    description_ko: '대시보드에서 풀링 및 직접 연결 문자열을 가져와 .env.local에 추가하세요.',
    guide_url: 'https://neon.tech/docs/connect/connect-from-any-app',
  },
  {
    id: cid('neon'),
    service_id: SERVICE_IDS.neon,
    order_index: 2,
    title: 'Neon 서버리스 드라이버 설치',
    title_ko: 'Neon 서버리스 드라이버 설치',
    description: 'npm install @neondatabase/serverless 명령으로 엣지 호환 데이터베이스 액세스를 설치하세요.',
    description_ko: 'npm install @neondatabase/serverless 명령으로 엣지 호환 데이터베이스 액세스를 설치하세요.',
    guide_url: 'https://neon.tech/docs/serverless/serverless-driver',
  },
  {
    id: cid('neon'),
    service_id: SERVICE_IDS.neon,
    order_index: 3,
    title: '데이터베이스 스키마 설정',
    title_ko: '데이터베이스 스키마 설정',
    description: '직접 연결 문자열을 사용하여 SQL, Prisma 또는 Drizzle ORM으로 테이블을 생성하세요.',
    description_ko: '직접 연결 문자열을 사용하여 SQL, Prisma 또는 Drizzle ORM으로 테이블을 생성하세요.',
    guide_url: 'https://neon.tech/docs/guides/prisma',
  },
  {
    id: cid('neon'),
    service_id: SERVICE_IDS.neon,
    order_index: 4,
    title: '개발 브랜치 생성',
    title_ko: '개발 브랜치 생성',
    description: 'Neon 브랜칭을 사용하여 프로덕션 데이터로부터 격리된 개발 데이터베이스를 생성하세요.',
    description_ko: 'Neon 브랜칭을 사용하여 프로덕션 데이터로부터 격리된 개발 데이터베이스를 생성하세요.',
    guide_url: 'https://neon.tech/docs/introduction/branching',
  },
  {
    id: cid('neon'),
    service_id: SERVICE_IDS.neon,
    order_index: 5,
    title: '연결 및 쿼리 테스트',
    title_ko: '연결 및 쿼리 테스트',
    description: '데이터베이스 연결이 작동하는지 확인하고 샘플 쿼리를 실행하여 설정을 테스트하세요.',
    description_ko: '데이터베이스 연결이 작동하는지 확인하고 샘플 쿼리를 실행하여 설정을 테스트하세요.',
    guide_url: null,
  },

  // =======================================================================
  // 16. Railway
  // =======================================================================
  {
    id: cid('railway'),
    service_id: SERVICE_IDS.railway,
    order_index: 0,
    title: 'Railway 계정 생성',
    title_ko: 'Railway 계정 생성',
    description: '쉬운 리포지토리 연결을 위해 GitHub 계정으로 railway.app에서 가입하세요.',
    description_ko: '쉬운 리포지토리 연결을 위해 GitHub 계정으로 railway.app에서 가입하세요.',
    guide_url: 'https://docs.railway.app/getting-started',
  },
  {
    id: cid('railway'),
    service_id: SERVICE_IDS.railway,
    order_index: 1,
    title: '새 프로젝트 생성 및 리포지토리 연결',
    title_ko: '새 프로젝트 생성 및 리포지토리 연결',
    description: '프로젝트를 생성하고 자동 감지를 통해 GitHub 리포지토리에서 배포하세요.',
    description_ko: '프로젝트를 생성하고 자동 감지를 통해 GitHub 리포지토리에서 배포하세요.',
    guide_url: 'https://docs.railway.app/deploy/deployments',
  },
  {
    id: cid('railway'),
    service_id: SERVICE_IDS.railway,
    order_index: 2,
    title: '환경 변수 설정',
    title_ko: '환경 변수 설정',
    description: 'Railway 프로젝트 설정에서 필요한 모든 환경 변수를 추가하세요.',
    description_ko: 'Railway 프로젝트 설정에서 필요한 모든 환경 변수를 추가하세요.',
    guide_url: 'https://docs.railway.app/develop/variables',
  },
  {
    id: cid('railway'),
    service_id: SERVICE_IDS.railway,
    order_index: 3,
    title: '데이터베이스 서비스 추가 (필요한 경우)',
    title_ko: '데이터베이스 서비스 추가 (필요한 경우)',
    description: 'Railway 프로젝트에 직접 PostgreSQL, MySQL 또는 Redis 데이터베이스를 추가하세요.',
    description_ko: 'Railway 프로젝트에 직접 PostgreSQL, MySQL 또는 Redis 데이터베이스를 추가하세요.',
    guide_url: 'https://docs.railway.app/databases/overview',
  },
  {
    id: cid('railway'),
    service_id: SERVICE_IDS.railway,
    order_index: 4,
    title: '커스텀 도메인 설정',
    title_ko: '커스텀 도메인 설정',
    description: '설정 탭에서 배포된 서비스에 대한 커스텀 도메인을 설정하세요.',
    description_ko: '설정 탭에서 배포된 서비스에 대한 커스텀 도메인을 설정하세요.',
    guide_url: 'https://docs.railway.app/deploy/exposing-your-app',
  },

  // =======================================================================
  // 17. Lemon Squeezy
  // =======================================================================
  {
    id: cid('lemonsqueezy'),
    service_id: SERVICE_IDS.lemonsqueezy,
    order_index: 0,
    title: 'Lemon Squeezy 계정 생성',
    title_ko: 'Lemon Squeezy 계정 생성',
    description: 'lemonsqueezy.com에서 가입하고 디지털 제품 판매를 위한 스토어를 설정하세요.',
    description_ko: 'lemonsqueezy.com에서 가입하고 디지털 제품 판매를 위한 스토어를 설정하세요.',
    guide_url: 'https://docs.lemonsqueezy.com/guides/getting-started',
  },
  {
    id: cid('lemonsqueezy'),
    service_id: SERVICE_IDS.lemonsqueezy,
    order_index: 1,
    title: '상품 및 변형 생성',
    title_ko: '상품 및 변형 생성',
    description: '대시보드에서 가격, 변형 및 구독 플랜이 포함된 상품을 설정하세요.',
    description_ko: '대시보드에서 가격, 변형 및 구독 플랜이 포함된 상품을 설정하세요.',
    guide_url: 'https://docs.lemonsqueezy.com/guides/tutorials/saas-subscription',
  },
  {
    id: cid('lemonsqueezy'),
    service_id: SERVICE_IDS.lemonsqueezy,
    order_index: 2,
    title: 'API 키 생성',
    title_ko: 'API 키 생성',
    description: '설정 > API에서 API 키를 생성하고 환경 변수에 추가하세요.',
    description_ko: '설정 > API에서 API 키를 생성하고 환경 변수에 추가하세요.',
    guide_url: 'https://docs.lemonsqueezy.com/guides/developer-guide/getting-started#create-an-api-key',
  },
  {
    id: cid('lemonsqueezy'),
    service_id: SERVICE_IDS.lemonsqueezy,
    order_index: 3,
    title: '웹훅 엔드포인트 설정',
    title_ko: '웹훅 엔드포인트 설정',
    description: '결제 및 구독 이벤트를 수신하기 위한 웹훅을 스토어에 생성하세요.',
    description_ko: '결제 및 구독 이벤트를 수신하기 위한 웹훅을 스토어에 생성하세요.',
    guide_url: 'https://docs.lemonsqueezy.com/guides/developer-guide/webhooks',
  },
  {
    id: cid('lemonsqueezy'),
    service_id: SERVICE_IDS.lemonsqueezy,
    order_index: 4,
    title: '결제 흐름 구현',
    title_ko: '결제 흐름 구현',
    description: 'Lemon Squeezy 결제 오버레이 또는 호스팅 결제 페이지를 통합하세요.',
    description_ko: 'Lemon Squeezy 결제 오버레이 또는 호스팅 결제 페이지를 통합하세요.',
    guide_url: 'https://docs.lemonsqueezy.com/guides/developer-guide/taking-payments',
  },
  {
    id: cid('lemonsqueezy'),
    service_id: SERVICE_IDS.lemonsqueezy,
    order_index: 5,
    title: '샌드박스 모드에서 테스트',
    title_ko: '샌드박스 모드에서 테스트',
    description: '테스트 모드를 활성화하고 출시 전에 전체 구매 흐름을 확인하세요.',
    description_ko: '테스트 모드를 활성화하고 출시 전에 전체 구매 흐름을 확인하세요.',
    guide_url: 'https://docs.lemonsqueezy.com/guides/developer-guide/testing',
  },

  // =======================================================================
  // 18. UploadThing
  // =======================================================================
  {
    id: cid('uploadthing'),
    service_id: SERVICE_IDS.uploadthing,
    order_index: 0,
    title: 'UploadThing 계정 생성',
    title_ko: 'UploadThing 계정 생성',
    description: 'uploadthing.com에서 가입하고 새 앱을 생성하여 자격 증명을 받으세요.',
    description_ko: 'uploadthing.com에서 가입하고 새 앱을 생성하여 자격 증명을 받으세요.',
    guide_url: 'https://docs.uploadthing.com/getting-started/appdir',
  },
  {
    id: cid('uploadthing'),
    service_id: SERVICE_IDS.uploadthing,
    order_index: 1,
    title: 'UploadThing 패키지 설치',
    title_ko: 'UploadThing 패키지 설치',
    description: 'npm install uploadthing @uploadthing/react 명령으로 필요한 패키지를 설치하세요.',
    description_ko: 'npm install uploadthing @uploadthing/react 명령으로 필요한 패키지를 설치하세요.',
    guide_url: 'https://docs.uploadthing.com/getting-started/appdir#install-the-packages',
  },
  {
    id: cid('uploadthing'),
    service_id: SERVICE_IDS.uploadthing,
    order_index: 2,
    title: '환경 변수 설정',
    title_ko: '환경 변수 설정',
    description: '.env.local 파일에 UPLOADTHING_SECRET과 UPLOADTHING_APP_ID를 추가하세요.',
    description_ko: '.env.local 파일에 UPLOADTHING_SECRET과 UPLOADTHING_APP_ID를 추가하세요.',
    guide_url: 'https://docs.uploadthing.com/getting-started/appdir#add-env-variables',
  },
  {
    id: cid('uploadthing'),
    service_id: SERVICE_IDS.uploadthing,
    order_index: 3,
    title: '파일 라우터 정의',
    title_ko: '파일 라우터 정의',
    description: '파일 타입 및 크기 제한이 포함된 업로드 엔드포인트를 정의하는 파일 라우터를 생성하세요.',
    description_ko: '파일 타입 및 크기 제한이 포함된 업로드 엔드포인트를 정의하는 파일 라우터를 생성하세요.',
    guide_url: 'https://docs.uploadthing.com/getting-started/appdir#set-up-a-filerouter',
  },
  {
    id: cid('uploadthing'),
    service_id: SERVICE_IDS.uploadthing,
    order_index: 4,
    title: 'UI에 업로드 컴포넌트 추가',
    title_ko: 'UI에 업로드 컴포넌트 추가',
    description: 'React 페이지에 UploadButton 또는 UploadDropzone 컴포넌트를 사용하세요.',
    description_ko: 'React 페이지에 UploadButton 또는 UploadDropzone 컴포넌트를 사용하세요.',
    guide_url: 'https://docs.uploadthing.com/getting-started/appdir#create-the-upload-thing-components',
  },
  {
    id: cid('uploadthing'),
    service_id: SERVICE_IDS.uploadthing,
    order_index: 5,
    title: '파일 업로드 테스트',
    title_ko: '파일 업로드 테스트',
    description: '테스트 파일을 업로드하고 올바르게 저장되었으며 URL이 반환되는지 확인하세요.',
    description_ko: '테스트 파일을 업로드하고 올바르게 저장되었으며 URL이 반환되는지 확인하세요.',
    guide_url: null,
  },

  // =======================================================================
  // 19. PostHog
  // =======================================================================
  {
    id: cid('posthog'),
    service_id: SERVICE_IDS.posthog,
    order_index: 0,
    title: 'PostHog 계정 생성',
    title_ko: 'PostHog 계정 생성',
    description: 'posthog.com(클라우드)에서 가입하거나 오픈소스 버전을 자체 호스팅하세요.',
    description_ko: 'posthog.com(클라우드)에서 가입하거나 오픈소스 버전을 자체 호스팅하세요.',
    guide_url: 'https://posthog.com/docs/getting-started/cloud',
  },
  {
    id: cid('posthog'),
    service_id: SERVICE_IDS.posthog,
    order_index: 1,
    title: 'PostHog SDK 설치',
    title_ko: 'PostHog SDK 설치',
    description: 'npm install posthog-js posthog-node 명령으로 클라이언트 및 서버 라이브러리를 추가하세요.',
    description_ko: 'npm install posthog-js posthog-node 명령으로 클라이언트 및 서버 라이브러리를 추가하세요.',
    guide_url: 'https://posthog.com/docs/libraries/next-js',
  },
  {
    id: cid('posthog'),
    service_id: SERVICE_IDS.posthog,
    order_index: 2,
    title: '앱에 PostHog 프로바이더 추가',
    title_ko: '앱에 PostHog 프로바이더 추가',
    description: '프로젝트 API 키와 호스트로 앱 레이아웃에서 PostHog를 초기화하세요.',
    description_ko: '프로젝트 API 키와 호스트로 앱 레이아웃에서 PostHog를 초기화하세요.',
    guide_url: 'https://posthog.com/docs/libraries/next-js#client-side-setup',
  },
  {
    id: cid('posthog'),
    service_id: SERVICE_IDS.posthog,
    order_index: 3,
    title: '이벤트 추적 설정',
    title_ko: '이벤트 추적 설정',
    description: '애플리케이션에서 주요 사용자 액션에 대한 커스텀 이벤트 추적을 구현하세요.',
    description_ko: '애플리케이션에서 주요 사용자 액션에 대한 커스텀 이벤트 추적을 구현하세요.',
    guide_url: 'https://posthog.com/docs/product-analytics/capture-events',
  },
  {
    id: cid('posthog'),
    service_id: SERVICE_IDS.posthog,
    order_index: 4,
    title: '기능 플래그 설정 (선택사항)',
    title_ko: '기능 플래그 설정 (선택사항)',
    description: '점진적 배포 및 A/B 테스트를 위한 기능 플래그를 설정하세요.',
    description_ko: '점진적 배포 및 A/B 테스트를 위한 기능 플래그를 설정하세요.',
    guide_url: 'https://posthog.com/docs/feature-flags',
  },
  {
    id: cid('posthog'),
    service_id: SERVICE_IDS.posthog,
    order_index: 5,
    title: 'PostHog 대시보드에서 이벤트 확인',
    title_ko: 'PostHog 대시보드에서 이벤트 확인',
    description: 'PostHog 대시보드에서 이벤트가 올바르게 캡처되고 있는지 확인하세요.',
    description_ko: 'PostHog 대시보드에서 이벤트가 올바르게 캡처되고 있는지 확인하세요.',
    guide_url: null,
  },

  // =======================================================================
  // 20. AWS S3
  // =======================================================================
  {
    id: cid('awss3'),
    service_id: SERVICE_IDS.awss3,
    order_index: 0,
    title: 'AWS 계정 및 IAM 사용자 생성',
    title_ko: 'AWS 계정 및 IAM 사용자 생성',
    description: 'AWS에 가입하고 S3 권한이 있는 전용 IAM 사용자를 생성하세요.',
    description_ko: 'AWS에 가입하고 S3 권한이 있는 전용 IAM 사용자를 생성하세요.',
    guide_url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/setting-up-s3.html',
  },
  {
    id: cid('awss3'),
    service_id: SERVICE_IDS.awss3,
    order_index: 1,
    title: 'S3 버킷 생성',
    title_ko: 'S3 버킷 생성',
    description: '적절한 액세스 설정으로 원하는 리전에 새 S3 버킷을 생성하세요.',
    description_ko: '적절한 액세스 설정으로 원하는 리전에 새 S3 버킷을 생성하세요.',
    guide_url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html',
  },
  {
    id: cid('awss3'),
    service_id: SERVICE_IDS.awss3,
    order_index: 2,
    title: '버킷 정책 및 CORS 설정',
    title_ko: '버킷 정책 및 CORS 설정',
    description: '액세스 제어를 위한 버킷 정책과 브라우저 업로드를 위한 CORS 설정을 구성하세요.',
    description_ko: '액세스 제어를 위한 버킷 정책과 브라우저 업로드를 위한 CORS 설정을 구성하세요.',
    guide_url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html',
  },
  {
    id: cid('awss3'),
    service_id: SERVICE_IDS.awss3,
    order_index: 3,
    title: 'AWS SDK 설치',
    title_ko: 'AWS SDK 설치',
    description: 'npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner 명령으로 S3 작업을 위한 SDK를 설치하세요.',
    description_ko: 'npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner 명령으로 S3 작업을 위한 SDK를 설치하세요.',
    guide_url: 'https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-nodejs.html',
  },
  {
    id: cid('awss3'),
    service_id: SERVICE_IDS.awss3,
    order_index: 4,
    title: '환경 변수 설정',
    title_ko: '환경 변수 설정',
    description: '.env.local에 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION 및 버킷 이름을 추가하세요.',
    description_ko: '.env.local에 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION 및 버킷 이름을 추가하세요.',
    guide_url: null,
  },
  {
    id: cid('awss3'),
    service_id: SERVICE_IDS.awss3,
    order_index: 5,
    title: '사전 서명된 URL 업로드 구현',
    title_ko: '사전 서명된 URL 업로드 구현',
    description: '안전한 직접 브라우저 업로드를 위해 사전 서명된 URL을 생성하는 API 엔드포인트를 만드세요.',
    description_ko: '안전한 직접 브라우저 업로드를 위해 사전 서명된 URL을 생성하는 API 엔드포인트를 만드세요.',
    guide_url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html',
  },
  {
    id: cid('awss3'),
    service_id: SERVICE_IDS.awss3,
    order_index: 6,
    title: '업로드 및 다운로드 테스트',
    title_ko: '업로드 및 다운로드 테스트',
    description: 'S3에 테스트 파일을 업로드하고 생성된 URL을 통해 검색할 수 있는지 확인하세요.',
    description_ko: 'S3에 테스트 파일을 업로드하고 생성된 URL을 통해 검색할 수 있는지 확인하세요.',
    guide_url: null,
  },
  {
    id: cid('awss3'),
    service_id: SERVICE_IDS.awss3,
    order_index: 7,
    title: 'CloudFront CDN 설정 (선택사항)',
    title_ko: 'CloudFront CDN 설정 (선택사항)',
    description: '더 빠른 글로벌 전송을 위해 S3 버킷 앞에 CloudFront 배포를 생성하세요.',
    description_ko: '더 빠른 글로벌 전송을 위해 S3 버킷 앞에 CloudFront 배포를 생성하세요.',
    guide_url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStartedCreateDistribution.html',
  },
];

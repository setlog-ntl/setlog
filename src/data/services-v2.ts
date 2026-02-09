import type {
  ServiceCategory,
  ServiceDomain,
  DifficultyLevel,
  FreeTierQuality,
  VendorLockInRisk,
  EnvVarTemplate,
} from '@/types';

// ---------------------------------------------------------------------------
// Seed-specific types: V2 extended service data
// ---------------------------------------------------------------------------

export interface ServiceSeedV2 {
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
  domain: ServiceDomain;
  subcategory: string;
  popularity_score: number;
  difficulty_level: DifficultyLevel;
  tags: string[];
  alternatives: string[];
  compatibility: { framework?: string[]; language?: string[] };
  official_sdks: Record<string, string>;
  free_tier_quality: FreeTierQuality;
  vendor_lock_in_risk: VendorLockInRisk;
  setup_time_minutes: number;
  monthly_cost_estimate: Record<string, string>;
  dx_score: number;
}

// ---------------------------------------------------------------------------
// Fixed UUIDs – deterministic so seed operations are idempotent
// ---------------------------------------------------------------------------

export const SERVICE_IDS_V2 = {
  github_actions: '10000000-0000-4000-a000-000000000021',
  twilio: '10000000-0000-4000-a000-000000000022',
  onesignal: '10000000-0000-4000-a000-000000000023',
  algolia: '10000000-0000-4000-a000-000000000024',
  sanity: '10000000-0000-4000-a000-000000000025',
  ga4: '10000000-0000-4000-a000-000000000026',
  upstash_redis: '10000000-0000-4000-a000-000000000027',
  cloudflare: '10000000-0000-4000-a000-000000000028',
  flyio: '10000000-0000-4000-a000-000000000029',
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

// ---------------------------------------------------------------------------
// 30 Services (V2)
// ---------------------------------------------------------------------------

export const servicesV2: ServiceSeedV2[] = [
  // -----------------------------------------------------------------------
  // 1. GitHub Actions
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.github_actions,
    name: 'GitHub Actions',
    slug: 'github-actions',
    category: 'cicd',
    description:
      'GitHub에 내장된 CI/CD 플랫폼으로, 코드 빌드·테스트·배포를 워크플로우 YAML 파일로 자동화할 수 있습니다.',
    description_ko:
      'GitHub에 내장된 CI/CD 플랫폼으로, 코드 빌드·테스트·배포를 워크플로우 YAML 파일로 자동화할 수 있습니다.',
    icon_url: null,
    website_url: 'https://github.com/features/actions',
    docs_url: 'https://docs.github.com/en/actions',
    pricing_info: {
      free_tier: true,
      free_tier_details: '퍼블릭 리포: 무제한, 프라이빗 리포: 월 2,000분 무료',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Team', price: '$4/유저/월' },
        { name: 'Enterprise', price: '$21/유저/월' },
      ],
    },
    required_env_vars: [
      {
        name: 'GITHUB_TOKEN',
        public: false,
        description: 'GitHub 개인 액세스 토큰 (워크플로우에서 자동 생성됨)',
        description_ko: 'GitHub 개인 액세스 토큰 (워크플로우에서 자동 생성됨)',
      },
    ],
    domain: 'devtools',
    subcategory: 'ci-cd',
    popularity_score: 95,
    difficulty_level: 'intermediate',
    tags: ['ci', 'cd', 'automation', 'github', 'workflow', 'yaml', 'devops'],
    alternatives: ['vercel', 'netlify', 'railway'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'nuxt', 'express', 'django', 'rails'],
      language: ['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'ruby'],
    },
    official_sdks: {
      javascript: 'https://github.com/actions/toolkit',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$4/유저',
      enterprise: '$21/유저',
    },
    dx_score: 8.5,
  },

  // -----------------------------------------------------------------------
  // 2. Twilio
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.twilio,
    name: 'Twilio',
    slug: 'twilio',
    category: 'sms',
    description:
      'SMS, 음성 통화, 영상 통화, WhatsApp 메시징 등 다양한 커뮤니케이션 API를 제공하는 클라우드 플랫폼입니다.',
    description_ko:
      'SMS, 음성 통화, 영상 통화, WhatsApp 메시징 등 다양한 커뮤니케이션 API를 제공하는 클라우드 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://www.twilio.com',
    docs_url: 'https://www.twilio.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '트라이얼 계정: $15.50 크레딧 제공, 인증된 번호로만 발송 가능',
      plans: [
        { name: 'Pay-as-you-go', price: 'SMS 건당 $0.0079~' },
        { name: 'Volume Discounts', price: '문의' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'TWILIO_ACCOUNT_SID',
        public: false,
        description: 'Twilio 계정 SID',
        description_ko: 'Twilio 계정 SID',
      },
      {
        name: 'TWILIO_AUTH_TOKEN',
        public: false,
        description: 'Twilio 인증 토큰',
        description_ko: 'Twilio 인증 토큰',
      },
      {
        name: 'TWILIO_PHONE_NUMBER',
        public: false,
        description: 'Twilio 발신 전화번호',
        description_ko: 'Twilio 발신 전화번호',
      },
    ],
    domain: 'communication',
    subcategory: 'sms-voice',
    popularity_score: 88,
    difficulty_level: 'intermediate',
    tags: ['sms', 'voice', 'messaging', 'whatsapp', 'communication', 'api', 'verification'],
    alternatives: ['onesignal', 'pusher'],
    compatibility: {
      framework: ['next', 'express', 'django', 'rails', 'flask', 'spring'],
      language: ['javascript', 'typescript', 'python', 'java', 'csharp', 'ruby', 'php', 'go'],
    },
    official_sdks: {
      javascript: 'https://github.com/twilio/twilio-node',
      python: 'https://github.com/twilio/twilio-python',
      java: 'https://github.com/twilio/twilio-java',
      ruby: 'https://github.com/twilio/twilio-ruby',
      php: 'https://github.com/twilio/twilio-php',
      go: 'https://github.com/twilio/twilio-go',
    },
    free_tier_quality: 'limited',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 20,
    monthly_cost_estimate: {
      starter: '$5~$20',
      growth: '$50~$200',
      enterprise: '$500+',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 3. OneSignal
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.onesignal,
    name: 'OneSignal',
    slug: 'onesignal',
    category: 'push',
    description:
      '웹·모바일 푸시 알림, 인앱 메시징, 이메일, SMS를 통합 관리할 수 있는 고객 참여 플랫폼입니다.',
    description_ko:
      '웹·모바일 푸시 알림, 인앱 메시징, 이메일, SMS를 통합 관리할 수 있는 고객 참여 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://onesignal.com',
    docs_url: 'https://documentation.onesignal.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '무제한 모바일 푸시, 웹 푸시 10,000명, 이메일 100건/일',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Growth', price: '$9/월~' },
        { name: 'Professional', price: '$99/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'ONESIGNAL_APP_ID',
        public: true,
        description: 'OneSignal 앱 ID',
        description_ko: 'OneSignal 앱 ID',
      },
      {
        name: 'ONESIGNAL_REST_API_KEY',
        public: false,
        description: 'OneSignal REST API 키',
        description_ko: 'OneSignal REST API 키',
      },
    ],
    domain: 'communication',
    subcategory: 'push-notification',
    popularity_score: 75,
    difficulty_level: 'beginner',
    tags: ['push', 'notification', 'mobile', 'web', 'engagement', 'messaging'],
    alternatives: ['pusher', 'twilio'],
    compatibility: {
      framework: ['next', 'react', 'react-native', 'flutter', 'angular', 'vue'],
      language: ['javascript', 'typescript', 'swift', 'kotlin', 'java', 'python', 'ruby', 'php'],
    },
    official_sdks: {
      javascript: 'https://github.com/OneSignal/onesignal-node-api',
      react: 'https://github.com/nickmarca/react-onesignal',
      'react-native': 'https://github.com/OneSignal/react-native-onesignal',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$9~$50',
      enterprise: '$99+',
    },
    dx_score: 7.5,
  },

  // -----------------------------------------------------------------------
  // 4. Algolia
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.algolia,
    name: 'Algolia',
    slug: 'algolia',
    category: 'search',
    description:
      '밀리초 단위의 초고속 전문 검색과 검색 분석, AI 기반 추천 기능을 제공하는 검색 API 플랫폼입니다.',
    description_ko:
      '밀리초 단위의 초고속 전문 검색과 검색 분석, AI 기반 추천 기능을 제공하는 검색 API 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://www.algolia.com',
    docs_url: 'https://www.algolia.com/doc',
    pricing_info: {
      free_tier: true,
      free_tier_details: '월 10,000건 검색 요청, 10,000건 레코드',
      plans: [
        { name: 'Build (Free)', price: '$0/월' },
        { name: 'Grow', price: '$0.50/1,000건 요청~' },
        { name: 'Premium', price: '문의' },
        { name: 'Elevate', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_ALGOLIA_APP_ID',
        public: true,
        description: 'Algolia 애플리케이션 ID',
        description_ko: 'Algolia 애플리케이션 ID',
      },
      {
        name: 'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY',
        public: true,
        description: 'Algolia 검색 전용 API 키 (프론트엔드용)',
        description_ko: 'Algolia 검색 전용 API 키 (프론트엔드용)',
      },
      {
        name: 'ALGOLIA_ADMIN_API_KEY',
        public: false,
        description: 'Algolia 관리자 API 키 (인덱싱·설정 변경용)',
        description_ko: 'Algolia 관리자 API 키 (인덱싱·설정 변경용)',
      },
    ],
    domain: 'business',
    subcategory: 'search-discovery',
    popularity_score: 82,
    difficulty_level: 'intermediate',
    tags: ['search', 'full-text', 'instant-search', 'autocomplete', 'analytics', 'ai', 'recommendation'],
    alternatives: ['meilisearch'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'nuxt', 'gatsby'],
      language: ['javascript', 'typescript', 'python', 'ruby', 'php', 'java', 'go', 'csharp', 'swift', 'kotlin'],
    },
    official_sdks: {
      javascript: 'https://github.com/algolia/algoliasearch-client-javascript',
      react: 'https://github.com/algolia/react-instantsearch',
      python: 'https://github.com/algolia/algoliasearch-client-python',
      php: 'https://github.com/algolia/algoliasearch-client-php',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 25,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$50~$200',
      enterprise: '$500+',
    },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 5. Sanity
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.sanity,
    name: 'Sanity',
    slug: 'sanity',
    category: 'cms',
    description:
      '구조화된 콘텐츠를 실시간으로 관리할 수 있는 헤드리스 CMS로, 커스터마이징 가능한 Sanity Studio와 GROQ 쿼리 언어를 제공합니다.',
    description_ko:
      '구조화된 콘텐츠를 실시간으로 관리할 수 있는 헤드리스 CMS로, 커스터마이징 가능한 Sanity Studio와 GROQ 쿼리 언어를 제공합니다.',
    icon_url: null,
    website_url: 'https://www.sanity.io',
    docs_url: 'https://www.sanity.io/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '3명 유저, 10GB 대역폭, 500K API CDN 요청/월',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Growth', price: '$15/유저/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_SANITY_PROJECT_ID',
        public: true,
        description: 'Sanity 프로젝트 ID',
        description_ko: 'Sanity 프로젝트 ID',
      },
      {
        name: 'NEXT_PUBLIC_SANITY_DATASET',
        public: true,
        description: 'Sanity 데이터셋 이름 (기본: production)',
        description_ko: 'Sanity 데이터셋 이름 (기본: production)',
      },
      {
        name: 'SANITY_API_TOKEN',
        public: false,
        description: 'Sanity API 읽기/쓰기 토큰',
        description_ko: 'Sanity API 읽기/쓰기 토큰',
      },
    ],
    domain: 'business',
    subcategory: 'headless-cms',
    popularity_score: 78,
    difficulty_level: 'intermediate',
    tags: ['cms', 'headless', 'content', 'groq', 'studio', 'structured-content', 'real-time'],
    alternatives: ['contentful', 'strapi'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'nuxt', 'gatsby', 'svelte', 'astro', 'remix'],
      language: ['javascript', 'typescript', 'python', 'ruby', 'php', 'go'],
    },
    official_sdks: {
      javascript: 'https://github.com/sanity-io/client',
      next: 'https://github.com/sanity-io/next-sanity',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 30,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$15~$75',
      enterprise: '$200+',
    },
    dx_score: 8.5,
  },

  // -----------------------------------------------------------------------
  // 6. GA4 (Google Analytics)
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.ga4,
    name: 'GA4 (Google Analytics)',
    slug: 'ga4',
    category: 'analytics',
    description:
      'Google이 제공하는 무료 웹·앱 분석 도구로, 이벤트 기반 데이터 수집과 머신러닝 기반 인사이트를 제공합니다.',
    description_ko:
      'Google이 제공하는 무료 웹·앱 분석 도구로, 이벤트 기반 데이터 수집과 머신러닝 기반 인사이트를 제공합니다.',
    icon_url: null,
    website_url: 'https://analytics.google.com',
    docs_url: 'https://developers.google.com/analytics',
    pricing_info: {
      free_tier: true,
      free_tier_details: '무료 (대부분의 기능 포함), BigQuery 연동 무료',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Analytics 360', price: '$50,000+/년' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
        public: true,
        description: 'GA4 측정 ID (G-XXXXXXXXXX 형식)',
        description_ko: 'GA4 측정 ID (G-XXXXXXXXXX 형식)',
      },
    ],
    domain: 'business',
    subcategory: 'web-analytics',
    popularity_score: 97,
    difficulty_level: 'beginner',
    tags: ['analytics', 'web', 'app', 'google', 'tracking', 'event', 'conversion', 'report'],
    alternatives: ['posthog', 'mixpanel', 'plausible'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'nuxt', 'gatsby', 'astro'],
      language: ['javascript', 'typescript'],
    },
    official_sdks: {
      javascript: 'https://github.com/analytics-next/gtag.js',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 10,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$0',
      enterprise: '$50,000+/년',
    },
    dx_score: 7.0,
  },

  // -----------------------------------------------------------------------
  // 7. Upstash Redis
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.upstash_redis,
    name: 'Upstash Redis',
    slug: 'upstash-redis',
    category: 'cache',
    description:
      'REST API 기반의 서버리스 Redis로, 엣지 환경과 서버리스 함수에서 최적화된 글로벌 캐시·세션·레이트리밋 기능을 제공합니다.',
    description_ko:
      'REST API 기반의 서버리스 Redis로, 엣지 환경과 서버리스 함수에서 최적화된 글로벌 캐시·세션·레이트리밋 기능을 제공합니다.',
    icon_url: null,
    website_url: 'https://upstash.com',
    docs_url: 'https://upstash.com/docs/redis',
    pricing_info: {
      free_tier: true,
      free_tier_details: '일 10,000 커맨드, 256MB 스토리지',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pay-as-you-go', price: '$0.2/100K 커맨드' },
        { name: 'Pro 2K', price: '$280/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'UPSTASH_REDIS_REST_URL',
        public: false,
        description: 'Upstash Redis REST API URL',
        description_ko: 'Upstash Redis REST API URL',
      },
      {
        name: 'UPSTASH_REDIS_REST_TOKEN',
        public: false,
        description: 'Upstash Redis REST API 토큰',
        description_ko: 'Upstash Redis REST API 토큰',
      },
    ],
    domain: 'backend',
    subcategory: 'cache-store',
    popularity_score: 76,
    difficulty_level: 'beginner',
    tags: ['redis', 'cache', 'serverless', 'edge', 'rate-limit', 'session', 'rest-api'],
    alternatives: ['vercel', 'cloudflare'],
    compatibility: {
      framework: ['next', 'nuxt', 'remix', 'express', 'fastify', 'hono'],
      language: ['javascript', 'typescript', 'python', 'go', 'rust'],
    },
    official_sdks: {
      javascript: 'https://github.com/upstash/upstash-redis',
      python: 'https://github.com/upstash/redis-py',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$10~$50',
      enterprise: '$280+',
    },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 8. Cloudflare
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.cloudflare,
    name: 'Cloudflare',
    slug: 'cloudflare',
    category: 'cdn',
    description:
      '글로벌 CDN, DNS, DDoS 보호, WAF, Workers(엣지 컴퓨팅), R2 스토리지 등 종합 인프라 서비스를 제공하는 플랫폼입니다.',
    description_ko:
      '글로벌 CDN, DNS, DDoS 보호, WAF, Workers(엣지 컴퓨팅), R2 스토리지 등 종합 인프라 서비스를 제공하는 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://www.cloudflare.com',
    docs_url: 'https://developers.cloudflare.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '무제한 CDN 대역폭, Workers 일 100,000건 요청, R2 10GB 스토리지',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pro', price: '$20/월' },
        { name: 'Business', price: '$200/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'CLOUDFLARE_API_TOKEN',
        public: false,
        description: 'Cloudflare API 토큰',
        description_ko: 'Cloudflare API 토큰',
      },
      {
        name: 'CLOUDFLARE_ACCOUNT_ID',
        public: false,
        description: 'Cloudflare 계정 ID',
        description_ko: 'Cloudflare 계정 ID',
      },
    ],
    domain: 'infrastructure',
    subcategory: 'cdn-security',
    popularity_score: 93,
    difficulty_level: 'intermediate',
    tags: ['cdn', 'dns', 'security', 'edge', 'workers', 'r2', 'ddos', 'waf', 'ssl'],
    alternatives: ['vercel', 'flyio', 'render'],
    compatibility: {
      framework: ['next', 'nuxt', 'remix', 'astro', 'hono', 'express'],
      language: ['javascript', 'typescript', 'rust', 'python', 'go'],
    },
    official_sdks: {
      javascript: 'https://github.com/cloudflare/workers-sdk',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$20~$50',
      enterprise: '$200+',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 9. Fly.io
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.flyio,
    name: 'Fly.io',
    slug: 'flyio',
    category: 'deploy',
    description:
      'Docker 컨테이너를 전 세계 엣지 리전에 빠르게 배포할 수 있는 클라우드 플랫폼으로, Postgres·Redis 등 매니지드 서비스도 제공합니다.',
    description_ko:
      'Docker 컨테이너를 전 세계 엣지 리전에 빠르게 배포할 수 있는 클라우드 플랫폼으로, Postgres·Redis 등 매니지드 서비스도 제공합니다.',
    icon_url: null,
    website_url: 'https://fly.io',
    docs_url: 'https://fly.io/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '3개 공유 CPU VM, 256MB RAM, 3GB 볼륨 스토리지',
      plans: [
        { name: 'Hobby (Free)', price: '$0/월' },
        { name: 'Launch', price: '종량제 (VM 시간 기준)' },
        { name: 'Scale', price: '볼륨 + 전용 VM 기준' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'FLY_API_TOKEN',
        public: false,
        description: 'Fly.io API 토큰',
        description_ko: 'Fly.io API 토큰',
      },
    ],
    domain: 'infrastructure',
    subcategory: 'container-hosting',
    popularity_score: 72,
    difficulty_level: 'intermediate',
    tags: ['deploy', 'container', 'docker', 'edge', 'global', 'postgres', 'redis', 'vm'],
    alternatives: ['render', 'railway', 'vercel'],
    compatibility: {
      framework: ['next', 'remix', 'express', 'fastify', 'django', 'rails', 'phoenix'],
      language: ['javascript', 'typescript', 'python', 'go', 'rust', 'ruby', 'elixir'],
    },
    official_sdks: {
      cli: 'https://github.com/superfly/flyctl',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 20,
    monthly_cost_estimate: {
      starter: '$0~$5',
      growth: '$20~$100',
      enterprise: '$200+',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 10. Datadog
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.datadog,
    name: 'Datadog',
    slug: 'datadog',
    category: 'logging',
    description:
      '인프라 모니터링, APM, 로그 관리, 실시간 대시보드, 알림을 통합 제공하는 클라우드 관측 플랫폼입니다.',
    description_ko:
      '인프라 모니터링, APM, 로그 관리, 실시간 대시보드, 알림을 통합 제공하는 클라우드 관측 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://www.datadoghq.com',
    docs_url: 'https://docs.datadoghq.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '5개 호스트 인프라 모니터링, 1일 로그 보관',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pro', price: '$15/호스트/월' },
        { name: 'Enterprise', price: '$23/호스트/월' },
      ],
    },
    required_env_vars: [
      {
        name: 'DD_API_KEY',
        public: false,
        description: 'Datadog API 키',
        description_ko: 'Datadog API 키',
      },
      {
        name: 'DD_APP_KEY',
        public: false,
        description: 'Datadog 애플리케이션 키',
        description_ko: 'Datadog 애플리케이션 키',
      },
      {
        name: 'DD_SITE',
        public: false,
        description: 'Datadog 사이트 (예: datadoghq.com)',
        description_ko: 'Datadog 사이트 (예: datadoghq.com)',
      },
    ],
    domain: 'observability',
    subcategory: 'monitoring-apm',
    popularity_score: 90,
    difficulty_level: 'advanced',
    tags: ['monitoring', 'apm', 'logging', 'metrics', 'dashboard', 'alerting', 'tracing', 'infrastructure'],
    alternatives: ['sentry', 'logrocket', 'posthog'],
    compatibility: {
      framework: ['next', 'express', 'django', 'rails', 'spring', 'flask'],
      language: ['javascript', 'typescript', 'python', 'go', 'java', 'ruby', 'csharp', 'php'],
    },
    official_sdks: {
      javascript: 'https://github.com/DataDog/dd-trace-js',
      python: 'https://github.com/DataDog/dd-trace-py',
      go: 'https://github.com/DataDog/dd-trace-go',
      java: 'https://github.com/DataDog/dd-trace-java',
    },
    free_tier_quality: 'limited',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 30,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$50~$300',
      enterprise: '$500+',
    },
    dx_score: 7.5,
  },

  // -----------------------------------------------------------------------
  // 11. Mixpanel
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.mixpanel,
    name: 'Mixpanel',
    slug: 'mixpanel',
    category: 'analytics',
    description:
      '이벤트 기반 제품 분석 플랫폼으로, 유저 행동 추적·퍼널 분석·리텐션 분석·A/B 테스트 기능을 제공합니다.',
    description_ko:
      '이벤트 기반 제품 분석 플랫폼으로, 유저 행동 추적·퍼널 분석·리텐션 분석·A/B 테스트 기능을 제공합니다.',
    icon_url: null,
    website_url: 'https://mixpanel.com',
    docs_url: 'https://docs.mixpanel.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '월 20M 이벤트 무료, 무제한 데이터 보관',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Growth', price: '$20/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_MIXPANEL_TOKEN',
        public: true,
        description: 'Mixpanel 프로젝트 토큰',
        description_ko: 'Mixpanel 프로젝트 토큰',
      },
    ],
    domain: 'business',
    subcategory: 'product-analytics',
    popularity_score: 80,
    difficulty_level: 'beginner',
    tags: ['analytics', 'product', 'funnel', 'retention', 'cohort', 'ab-test', 'event-tracking'],
    alternatives: ['posthog', 'ga4', 'plausible'],
    compatibility: {
      framework: ['next', 'react', 'react-native', 'vue', 'angular', 'svelte', 'flutter'],
      language: ['javascript', 'typescript', 'python', 'ruby', 'java', 'swift', 'kotlin'],
    },
    official_sdks: {
      javascript: 'https://github.com/mixpanel/mixpanel-js',
      'react-native': 'https://github.com/mixpanel/mixpanel-react-native',
      python: 'https://github.com/mixpanel/mixpanel-python',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 10,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$20~$100',
      enterprise: '$500+',
    },
    dx_score: 8.5,
  },

  // -----------------------------------------------------------------------
  // 12. Contentful
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.contentful,
    name: 'Contentful',
    slug: 'contentful',
    category: 'cms',
    description:
      '디지털 콘텐츠를 API 우선으로 관리하는 엔터프라이즈급 헤드리스 CMS로, 다양한 채널에 콘텐츠를 전달할 수 있습니다.',
    description_ko:
      '디지털 콘텐츠를 API 우선으로 관리하는 엔터프라이즈급 헤드리스 CMS로, 다양한 채널에 콘텐츠를 전달할 수 있습니다.',
    icon_url: null,
    website_url: 'https://www.contentful.com',
    docs_url: 'https://www.contentful.com/developers/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '5명 유저, 1 스페이스, 25K 레코드, 2M API 호출/월',
      plans: [
        { name: 'Community (Free)', price: '$0/월' },
        { name: 'Team', price: '$300/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'CONTENTFUL_SPACE_ID',
        public: false,
        description: 'Contentful 스페이스 ID',
        description_ko: 'Contentful 스페이스 ID',
      },
      {
        name: 'CONTENTFUL_ACCESS_TOKEN',
        public: false,
        description: 'Contentful Content Delivery API 토큰',
        description_ko: 'Contentful Content Delivery API 토큰',
      },
      {
        name: 'CONTENTFUL_PREVIEW_TOKEN',
        public: false,
        description: 'Contentful Content Preview API 토큰',
        description_ko: 'Contentful Content Preview API 토큰',
      },
    ],
    domain: 'business',
    subcategory: 'headless-cms',
    popularity_score: 80,
    difficulty_level: 'intermediate',
    tags: ['cms', 'headless', 'content', 'api-first', 'enterprise', 'graphql', 'rest'],
    alternatives: ['sanity', 'strapi'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'nuxt', 'gatsby', 'angular', 'svelte', 'astro'],
      language: ['javascript', 'typescript', 'python', 'ruby', 'java', 'php', 'csharp'],
    },
    official_sdks: {
      javascript: 'https://github.com/contentful/contentful.js',
      'rich-text': 'https://github.com/contentful/rich-text',
      python: 'https://github.com/contentful/contentful.py',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 25,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$300',
      enterprise: '$1,000+',
    },
    dx_score: 7.5,
  },

  // -----------------------------------------------------------------------
  // 13. Meilisearch
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.meilisearch,
    name: 'Meilisearch',
    slug: 'meilisearch',
    category: 'search',
    description:
      '빠르고 직관적인 오픈소스 검색 엔진으로, 타이포 허용(typo-tolerance)과 즉시 검색 결과를 제공하며 셀프 호스팅이 가능합니다.',
    description_ko:
      '빠르고 직관적인 오픈소스 검색 엔진으로, 타이포 허용(typo-tolerance)과 즉시 검색 결과를 제공하며 셀프 호스팅이 가능합니다.',
    icon_url: null,
    website_url: 'https://www.meilisearch.com',
    docs_url: 'https://www.meilisearch.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'Meilisearch Cloud: 100K 문서, 10K 검색/월 무료',
      plans: [
        { name: 'Build (Free)', price: '$0/월' },
        { name: 'Pro', price: '$30/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'MEILISEARCH_HOST',
        public: false,
        description: 'Meilisearch 호스트 URL',
        description_ko: 'Meilisearch 호스트 URL',
      },
      {
        name: 'MEILISEARCH_ADMIN_API_KEY',
        public: false,
        description: 'Meilisearch 관리자 API 키',
        description_ko: 'Meilisearch 관리자 API 키',
      },
      {
        name: 'NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY',
        public: true,
        description: 'Meilisearch 검색 전용 API 키 (프론트엔드용)',
        description_ko: 'Meilisearch 검색 전용 API 키 (프론트엔드용)',
      },
    ],
    domain: 'business',
    subcategory: 'search-engine',
    popularity_score: 68,
    difficulty_level: 'beginner',
    tags: ['search', 'open-source', 'typo-tolerance', 'instant-search', 'self-hosted', 'full-text'],
    alternatives: ['algolia'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'nuxt', 'rails'],
      language: ['javascript', 'typescript', 'python', 'go', 'rust', 'ruby', 'php', 'java', 'swift'],
    },
    official_sdks: {
      javascript: 'https://github.com/meilisearch/meilisearch-js',
      react: 'https://github.com/meilisearch/meilisearch-react',
      python: 'https://github.com/meilisearch/meilisearch-python',
      go: 'https://github.com/meilisearch/meilisearch-go',
      rust: 'https://github.com/meilisearch/meilisearch-rust',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$30~$100',
      enterprise: '$300+',
    },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 14. Pusher
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.pusher,
    name: 'Pusher',
    slug: 'pusher',
    category: 'push',
    description:
      '실시간 WebSocket 메시징과 푸시 알림을 손쉽게 구현할 수 있는 플랫폼으로, Channels와 Beams 서비스를 제공합니다.',
    description_ko:
      '실시간 WebSocket 메시징과 푸시 알림을 손쉽게 구현할 수 있는 플랫폼으로, Channels와 Beams 서비스를 제공합니다.',
    icon_url: null,
    website_url: 'https://pusher.com',
    docs_url: 'https://pusher.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '200 동시 접속, 200K 메시지/일, 무제한 채널',
      plans: [
        { name: 'Sandbox (Free)', price: '$0/월' },
        { name: 'Startup', price: '$49/월' },
        { name: 'Pro', price: '$99/월' },
        { name: 'Business', price: '$299/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'PUSHER_APP_ID',
        public: false,
        description: 'Pusher 앱 ID',
        description_ko: 'Pusher 앱 ID',
      },
      {
        name: 'NEXT_PUBLIC_PUSHER_APP_KEY',
        public: true,
        description: 'Pusher 앱 키 (프론트엔드용)',
        description_ko: 'Pusher 앱 키 (프론트엔드용)',
      },
      {
        name: 'PUSHER_APP_SECRET',
        public: false,
        description: 'Pusher 앱 시크릿',
        description_ko: 'Pusher 앱 시크릿',
      },
      {
        name: 'NEXT_PUBLIC_PUSHER_CLUSTER',
        public: true,
        description: 'Pusher 클러스터 (예: ap3)',
        description_ko: 'Pusher 클러스터 (예: ap3)',
      },
    ],
    domain: 'communication',
    subcategory: 'realtime-messaging',
    popularity_score: 70,
    difficulty_level: 'beginner',
    tags: ['realtime', 'websocket', 'push', 'channels', 'messaging', 'presence', 'pub-sub'],
    alternatives: ['onesignal', 'twilio'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'express', 'laravel', 'rails'],
      language: ['javascript', 'typescript', 'python', 'ruby', 'php', 'java', 'go', 'csharp'],
    },
    official_sdks: {
      javascript: 'https://github.com/pusher/pusher-js',
      'node-server': 'https://github.com/pusher/pusher-http-node',
      python: 'https://github.com/pusher/pusher-http-python',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$49~$99',
      enterprise: '$299+',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 15. Trigger.dev
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.trigger_dev,
    name: 'Trigger.dev',
    slug: 'trigger-dev',
    category: 'scheduling',
    description:
      'TypeScript 기반 백그라운드 작업 프레임워크로, 장기 실행 태스크·스케줄링·이벤트 기반 워크플로우를 서버리스 환경에서 실행합니다.',
    description_ko:
      'TypeScript 기반 백그라운드 작업 프레임워크로, 장기 실행 태스크·스케줄링·이벤트 기반 워크플로우를 서버리스 환경에서 실행합니다.',
    icon_url: null,
    website_url: 'https://trigger.dev',
    docs_url: 'https://trigger.dev/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '월 50,000 실행, 동시 실행 5개',
      plans: [
        { name: 'Hobby (Free)', price: '$0/월' },
        { name: 'Pro', price: '$30/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'TRIGGER_API_KEY',
        public: false,
        description: 'Trigger.dev API 키',
        description_ko: 'Trigger.dev API 키',
      },
      {
        name: 'TRIGGER_API_URL',
        public: false,
        description: 'Trigger.dev API URL (셀프 호스팅 시)',
        description_ko: 'Trigger.dev API URL (셀프 호스팅 시)',
      },
    ],
    domain: 'integration',
    subcategory: 'background-jobs',
    popularity_score: 62,
    difficulty_level: 'intermediate',
    tags: ['background-jobs', 'scheduling', 'cron', 'queue', 'serverless', 'typescript', 'workflow', 'event-driven'],
    alternatives: ['inngest', 'bullmq'],
    compatibility: {
      framework: ['next', 'remix', 'express', 'fastify', 'hono'],
      language: ['typescript', 'javascript'],
    },
    official_sdks: {
      typescript: 'https://github.com/triggerdotdev/trigger.dev',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$30~$100',
      enterprise: '$300+',
    },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 16. LaunchDarkly
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.launchdarkly,
    name: 'LaunchDarkly',
    slug: 'launchdarkly',
    category: 'feature_flags',
    description:
      '피처 플래그 관리 플랫폼으로, 안전한 점진적 배포·A/B 테스트·타게팅·실험을 코드 변경 없이 수행할 수 있습니다.',
    description_ko:
      '피처 플래그 관리 플랫폼으로, 안전한 점진적 배포·A/B 테스트·타게팅·실험을 코드 변경 없이 수행할 수 있습니다.',
    icon_url: null,
    website_url: 'https://launchdarkly.com',
    docs_url: 'https://docs.launchdarkly.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '14일 무료 체험, Starter 플랜 제한적 무료',
      plans: [
        { name: 'Developer', price: '$0/월 (1인)' },
        { name: 'Foundation', price: '$8.33/시트/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'LAUNCHDARKLY_SDK_KEY',
        public: false,
        description: 'LaunchDarkly 서버사이드 SDK 키',
        description_ko: 'LaunchDarkly 서버사이드 SDK 키',
      },
      {
        name: 'NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID',
        public: true,
        description: 'LaunchDarkly 클라이언트사이드 ID',
        description_ko: 'LaunchDarkly 클라이언트사이드 ID',
      },
    ],
    domain: 'observability',
    subcategory: 'feature-management',
    popularity_score: 74,
    difficulty_level: 'intermediate',
    tags: ['feature-flag', 'ab-test', 'progressive-delivery', 'targeting', 'experiment', 'rollout'],
    alternatives: ['posthog'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'express', 'django', 'rails', 'spring'],
      language: ['javascript', 'typescript', 'python', 'go', 'java', 'ruby', 'csharp', 'php', 'rust'],
    },
    official_sdks: {
      javascript: 'https://github.com/launchdarkly/js-core',
      react: 'https://github.com/launchdarkly/react-client-sdk',
      node: 'https://github.com/launchdarkly/node-server-sdk',
      python: 'https://github.com/launchdarkly/python-server-sdk',
      go: 'https://github.com/launchdarkly/go-server-sdk',
    },
    free_tier_quality: 'limited',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 20,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$50~$200',
      enterprise: '$500+',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 17. Groq
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.groq,
    name: 'Groq',
    slug: 'groq',
    category: 'ai',
    description:
      'LPU(Language Processing Unit) 기반의 초고속 LLM 추론 API로, Llama·Mixtral 등 오픈소스 모델을 매우 빠른 속도로 실행합니다.',
    description_ko:
      'LPU(Language Processing Unit) 기반의 초고속 LLM 추론 API로, Llama·Mixtral 등 오픈소스 모델을 매우 빠른 속도로 실행합니다.',
    icon_url: null,
    website_url: 'https://groq.com',
    docs_url: 'https://console.groq.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '분당 30 요청, 일 14,400 요청 (모델별 상이)',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pay-as-you-go', price: '토큰당 과금 (모델별 상이)' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'GROQ_API_KEY',
        public: false,
        description: 'Groq API 키',
        description_ko: 'Groq API 키',
      },
    ],
    domain: 'ai_ml',
    subcategory: 'llm-inference',
    popularity_score: 70,
    difficulty_level: 'beginner',
    tags: ['ai', 'llm', 'inference', 'fast', 'open-source-model', 'llama', 'mixtral', 'lpu'],
    alternatives: ['openai', 'anthropic'],
    compatibility: {
      framework: ['next', 'express', 'fastify', 'django', 'flask'],
      language: ['javascript', 'typescript', 'python', 'go'],
    },
    official_sdks: {
      javascript: 'https://github.com/groq/groq-typescript',
      python: 'https://github.com/groq/groq-python',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$10~$50',
      enterprise: '$200+',
    },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 18. Render
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.render,
    name: 'Render',
    slug: 'render',
    category: 'deploy',
    description:
      '웹 서비스, 정적 사이트, 크론 작업, Postgres/Redis를 손쉽게 배포할 수 있는 클라우드 호스팅 플랫폼입니다.',
    description_ko:
      '웹 서비스, 정적 사이트, 크론 작업, Postgres/Redis를 손쉽게 배포할 수 있는 클라우드 호스팅 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://render.com',
    docs_url: 'https://docs.render.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '정적 사이트 무제한, 웹 서비스 750시간/월 무료',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Individual', price: '$7/서비스/월~' },
        { name: 'Team', price: '$19/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'RENDER_API_KEY',
        public: false,
        description: 'Render API 키',
        description_ko: 'Render API 키',
      },
    ],
    domain: 'infrastructure',
    subcategory: 'cloud-hosting',
    popularity_score: 73,
    difficulty_level: 'beginner',
    tags: ['deploy', 'hosting', 'cloud', 'postgres', 'redis', 'static-site', 'docker', 'cron'],
    alternatives: ['flyio', 'railway', 'vercel'],
    compatibility: {
      framework: ['next', 'express', 'django', 'rails', 'flask', 'fastify', 'spring'],
      language: ['javascript', 'typescript', 'python', 'go', 'rust', 'ruby', 'java', 'elixir'],
    },
    official_sdks: {},
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 10,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$7~$50',
      enterprise: '$100+',
    },
    dx_score: 8.5,
  },

  // -----------------------------------------------------------------------
  // 19. LogRocket
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.logrocket,
    name: 'LogRocket',
    slug: 'logrocket',
    category: 'logging',
    description:
      '세션 리플레이, 에러 추적, 프론트엔드 성능 모니터링을 통합 제공하는 사용자 경험 분석 플랫폼입니다.',
    description_ko:
      '세션 리플레이, 에러 추적, 프론트엔드 성능 모니터링을 통합 제공하는 사용자 경험 분석 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://logrocket.com',
    docs_url: 'https://docs.logrocket.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '월 1,000 세션, 1개월 데이터 보관',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Team', price: '$69/월~' },
        { name: 'Professional', price: '$295/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_LOGROCKET_APP_ID',
        public: true,
        description: 'LogRocket 앱 ID (프로젝트slug/앱ID 형식)',
        description_ko: 'LogRocket 앱 ID (프로젝트slug/앱ID 형식)',
      },
    ],
    domain: 'observability',
    subcategory: 'session-replay',
    popularity_score: 65,
    difficulty_level: 'beginner',
    tags: ['session-replay', 'error-tracking', 'frontend', 'performance', 'ux', 'logging', 'monitoring'],
    alternatives: ['sentry', 'datadog', 'posthog'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'remix'],
      language: ['javascript', 'typescript'],
    },
    official_sdks: {
      javascript: 'https://github.com/LogRocket/logrocket',
      react: 'https://github.com/LogRocket/logrocket-react',
    },
    free_tier_quality: 'limited',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 10,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$69~$150',
      enterprise: '$295+',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 20. Playwright
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.playwright,
    name: 'Playwright',
    slug: 'playwright',
    category: 'testing',
    description:
      'Microsoft가 개발한 크로스 브라우저 E2E 테스트 프레임워크로, Chromium·Firefox·WebKit을 단일 API로 자동화합니다.',
    description_ko:
      'Microsoft가 개발한 크로스 브라우저 E2E 테스트 프레임워크로, Chromium·Firefox·WebKit을 단일 API로 자동화합니다.',
    icon_url: null,
    website_url: 'https://playwright.dev',
    docs_url: 'https://playwright.dev/docs/intro',
    pricing_info: {
      free_tier: true,
      free_tier_details: '완전 무료 오픈소스',
      plans: [{ name: 'Open Source', price: '$0 (무료)' }],
    },
    required_env_vars: [
      {
        name: 'PLAYWRIGHT_BASE_URL',
        public: false,
        description: '테스트 대상 기본 URL',
        description_ko: '테스트 대상 기본 URL',
      },
    ],
    domain: 'devtools',
    subcategory: 'e2e-testing',
    popularity_score: 85,
    difficulty_level: 'intermediate',
    tags: ['testing', 'e2e', 'browser', 'automation', 'cross-browser', 'ci', 'microsoft', 'open-source'],
    alternatives: ['cypress'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'nuxt', 'remix', 'astro'],
      language: ['javascript', 'typescript', 'python', 'java', 'csharp'],
    },
    official_sdks: {
      javascript: 'https://github.com/microsoft/playwright',
      python: 'https://github.com/microsoft/playwright-python',
      java: 'https://github.com/microsoft/playwright-java',
      csharp: 'https://github.com/microsoft/playwright-dotnet',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 10,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$0',
      enterprise: '$0',
    },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 21. Slack API
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.slack_api,
    name: 'Slack API',
    slug: 'slack-api',
    category: 'chat',
    description:
      'Slack 워크스페이스와 연동하는 봇·앱을 만들 수 있는 API로, 메시지 전송·이벤트 수신·슬래시 커맨드 등을 지원합니다.',
    description_ko:
      'Slack 워크스페이스와 연동하는 봇·앱을 만들 수 있는 API로, 메시지 전송·이벤트 수신·슬래시 커맨드 등을 지원합니다.',
    icon_url: null,
    website_url: 'https://api.slack.com',
    docs_url: 'https://api.slack.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'API 사용 자체는 무료, Slack 워크스페이스 플랜에 따라 기능 제한',
      plans: [
        { name: 'Free (Slack)', price: '$0/월' },
        { name: 'Pro (Slack)', price: '$8.75/유저/월' },
        { name: 'Business+ (Slack)', price: '$12.50/유저/월' },
        { name: 'Enterprise Grid', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'SLACK_BOT_TOKEN',
        public: false,
        description: 'Slack 봇 OAuth 토큰 (xoxb-로 시작)',
        description_ko: 'Slack 봇 OAuth 토큰 (xoxb-로 시작)',
      },
      {
        name: 'SLACK_SIGNING_SECRET',
        public: false,
        description: 'Slack 앱 서명 시크릿 (요청 검증용)',
        description_ko: 'Slack 앱 서명 시크릿 (요청 검증용)',
      },
      {
        name: 'SLACK_APP_TOKEN',
        public: false,
        description: 'Slack 앱 레벨 토큰 (Socket Mode용, xapp-로 시작)',
        description_ko: 'Slack 앱 레벨 토큰 (Socket Mode용, xapp-로 시작)',
      },
    ],
    domain: 'communication',
    subcategory: 'team-messaging',
    popularity_score: 88,
    difficulty_level: 'intermediate',
    tags: ['chat', 'bot', 'messaging', 'slack', 'webhook', 'notification', 'automation', 'slash-command'],
    alternatives: ['discord-api'],
    compatibility: {
      framework: ['next', 'express', 'fastify', 'django', 'flask', 'rails'],
      language: ['javascript', 'typescript', 'python', 'java', 'go', 'ruby'],
    },
    official_sdks: {
      javascript: 'https://github.com/slackapi/bolt-js',
      python: 'https://github.com/slackapi/bolt-python',
      java: 'https://github.com/slackapi/java-slack-sdk',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 20,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$8.75/유저',
      enterprise: '$12.50+/유저',
    },
    dx_score: 7.5,
  },

  // -----------------------------------------------------------------------
  // 22. Discord API
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.discord_api,
    name: 'Discord API',
    slug: 'discord-api',
    category: 'chat',
    description:
      'Discord 서버와 연동하는 봇·앱을 만들 수 있는 API로, 메시지·음성·이벤트·슬래시 커맨드·임베드 등을 지원합니다.',
    description_ko:
      'Discord 서버와 연동하는 봇·앱을 만들 수 있는 API로, 메시지·음성·이벤트·슬래시 커맨드·임베드 등을 지원합니다.',
    icon_url: null,
    website_url: 'https://discord.com/developers',
    docs_url: 'https://discord.com/developers/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: 'API 완전 무료, 봇 생성·운영 무료',
      plans: [{ name: 'Free', price: '$0/월' }],
    },
    required_env_vars: [
      {
        name: 'DISCORD_BOT_TOKEN',
        public: false,
        description: 'Discord 봇 토큰',
        description_ko: 'Discord 봇 토큰',
      },
      {
        name: 'DISCORD_CLIENT_ID',
        public: false,
        description: 'Discord 애플리케이션 클라이언트 ID',
        description_ko: 'Discord 애플리케이션 클라이언트 ID',
      },
      {
        name: 'DISCORD_CLIENT_SECRET',
        public: false,
        description: 'Discord 애플리케이션 클라이언트 시크릿',
        description_ko: 'Discord 애플리케이션 클라이언트 시크릿',
      },
      {
        name: 'DISCORD_PUBLIC_KEY',
        public: false,
        description: 'Discord 상호작용 검증용 퍼블릭 키',
        description_ko: 'Discord 상호작용 검증용 퍼블릭 키',
      },
    ],
    domain: 'communication',
    subcategory: 'community-platform',
    popularity_score: 84,
    difficulty_level: 'intermediate',
    tags: ['chat', 'bot', 'community', 'discord', 'webhook', 'slash-command', 'voice', 'gaming'],
    alternatives: ['slack-api'],
    compatibility: {
      framework: ['next', 'express', 'fastify', 'django', 'flask'],
      language: ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'csharp'],
    },
    official_sdks: {
      javascript: 'https://github.com/discordjs/discord.js',
      python: 'https://github.com/Rapptz/discord.py',
      java: 'https://github.com/discord-jda/JDA',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$0',
      enterprise: '$0 (호스팅 비용 별도)',
    },
    dx_score: 7.5,
  },

  // -----------------------------------------------------------------------
  // 23. Mapbox
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.mapbox,
    name: 'Mapbox',
    slug: 'mapbox',
    category: 'other',
    description:
      '커스텀 지도, 지오코딩, 경로 탐색, 위치 검색 등 위치 기반 서비스를 제공하는 지도·내비게이션 플랫폼입니다.',
    description_ko:
      '커스텀 지도, 지오코딩, 경로 탐색, 위치 검색 등 위치 기반 서비스를 제공하는 지도·내비게이션 플랫폼입니다.',
    icon_url: null,
    website_url: 'https://www.mapbox.com',
    docs_url: 'https://docs.mapbox.com',
    pricing_info: {
      free_tier: true,
      free_tier_details: '월 50,000 지도 로드, 100,000 지오코딩 요청 무료',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Pay-as-you-go', price: '지도 로드당 $0.002~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
        public: true,
        description: 'Mapbox 퍼블릭 액세스 토큰',
        description_ko: 'Mapbox 퍼블릭 액세스 토큰',
      },
      {
        name: 'MAPBOX_SECRET_TOKEN',
        public: false,
        description: 'Mapbox 시크릿 토큰 (서버사이드 API용)',
        description_ko: 'Mapbox 시크릿 토큰 (서버사이드 API용)',
      },
    ],
    domain: 'business',
    subcategory: 'maps-location',
    popularity_score: 78,
    difficulty_level: 'intermediate',
    tags: ['maps', 'geocoding', 'navigation', 'location', 'gis', 'directions', 'custom-map'],
    alternatives: [],
    compatibility: {
      framework: ['next', 'react', 'react-native', 'vue', 'angular', 'svelte', 'flutter'],
      language: ['javascript', 'typescript', 'python', 'java', 'swift', 'kotlin', 'csharp'],
    },
    official_sdks: {
      javascript: 'https://github.com/mapbox/mapbox-gl-js',
      'react-native': 'https://github.com/rnmapbox/maps',
      python: 'https://github.com/mapbox/mapbox-sdk-py',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$50~$200',
      enterprise: '$500+',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 24. ElevenLabs
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.elevenlabs,
    name: 'ElevenLabs',
    slug: 'elevenlabs',
    category: 'ai',
    description:
      'AI 기반 음성 합성·음성 클론 플랫폼으로, 자연스러운 텍스트-투-스피치, 음성 변환, 더빙 API를 제공합니다.',
    description_ko:
      'AI 기반 음성 합성·음성 클론 플랫폼으로, 자연스러운 텍스트-투-스피치, 음성 변환, 더빙 API를 제공합니다.',
    icon_url: null,
    website_url: 'https://elevenlabs.io',
    docs_url: 'https://elevenlabs.io/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '월 10,000자 무료, 3개 커스텀 음성',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Starter', price: '$5/월' },
        { name: 'Creator', price: '$22/월' },
        { name: 'Pro', price: '$99/월' },
        { name: 'Scale', price: '$330/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'ELEVENLABS_API_KEY',
        public: false,
        description: 'ElevenLabs API 키',
        description_ko: 'ElevenLabs API 키',
      },
    ],
    domain: 'ai_ml',
    subcategory: 'voice-synthesis',
    popularity_score: 72,
    difficulty_level: 'beginner',
    tags: ['ai', 'tts', 'voice', 'speech', 'clone', 'dubbing', 'text-to-speech', 'audio'],
    alternatives: ['openai'],
    compatibility: {
      framework: ['next', 'react', 'express', 'fastify', 'django', 'flask'],
      language: ['javascript', 'typescript', 'python', 'go'],
    },
    official_sdks: {
      javascript: 'https://github.com/elevenlabs/elevenlabs-js',
      python: 'https://github.com/elevenlabs/elevenlabs-python',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'medium',
    setup_time_minutes: 5,
    monthly_cost_estimate: {
      starter: '$0~$5',
      growth: '$22~$99',
      enterprise: '$330+',
    },
    dx_score: 8.5,
  },

  // -----------------------------------------------------------------------
  // 25. Inngest
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.inngest,
    name: 'Inngest',
    slug: 'inngest',
    category: 'scheduling',
    description:
      '이벤트 기반 백그라운드 함수 플랫폼으로, 스텝 함수·재시도·스케줄링·팬아웃을 기존 코드에 쉽게 추가할 수 있습니다.',
    description_ko:
      '이벤트 기반 백그라운드 함수 플랫폼으로, 스텝 함수·재시도·스케줄링·팬아웃을 기존 코드에 쉽게 추가할 수 있습니다.',
    icon_url: null,
    website_url: 'https://www.inngest.com',
    docs_url: 'https://www.inngest.com/docs',
    pricing_info: {
      free_tier: true,
      free_tier_details: '월 25,000 함수 실행, 동시 실행 5개',
      plans: [
        { name: 'Free', price: '$0/월' },
        { name: 'Team', price: '$50/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'INNGEST_EVENT_KEY',
        public: false,
        description: 'Inngest 이벤트 전송 키',
        description_ko: 'Inngest 이벤트 전송 키',
      },
      {
        name: 'INNGEST_SIGNING_KEY',
        public: false,
        description: 'Inngest 서명 키 (함수 실행 검증용)',
        description_ko: 'Inngest 서명 키 (함수 실행 검증용)',
      },
    ],
    domain: 'integration',
    subcategory: 'event-driven-functions',
    popularity_score: 60,
    difficulty_level: 'intermediate',
    tags: ['background-jobs', 'event-driven', 'step-functions', 'scheduling', 'retry', 'workflow', 'serverless'],
    alternatives: ['trigger-dev', 'bullmq'],
    compatibility: {
      framework: ['next', 'remix', 'express', 'fastify', 'hono', 'nuxt', 'sveltekit'],
      language: ['typescript', 'javascript', 'python', 'go'],
    },
    official_sdks: {
      typescript: 'https://github.com/inngest/inngest-js',
      python: 'https://github.com/inngest/inngest-py',
      go: 'https://github.com/inngest/inngestgo',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$50~$150',
      enterprise: '$300+',
    },
    dx_score: 9.0,
  },

  // -----------------------------------------------------------------------
  // 26. Strapi
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.strapi,
    name: 'Strapi',
    slug: 'strapi',
    category: 'cms',
    description:
      '오픈소스 헤드리스 CMS로, 관리자 패널을 커스터마이징하고 REST/GraphQL API를 자동 생성하며 셀프 호스팅이 가능합니다.',
    description_ko:
      '오픈소스 헤드리스 CMS로, 관리자 패널을 커스터마이징하고 REST/GraphQL API를 자동 생성하며 셀프 호스팅이 가능합니다.',
    icon_url: null,
    website_url: 'https://strapi.io',
    docs_url: 'https://docs.strapi.io',
    pricing_info: {
      free_tier: true,
      free_tier_details: '셀프 호스팅 완전 무료, Strapi Cloud: 14일 체험',
      plans: [
        { name: 'Community (Self-hosted)', price: '$0/월' },
        { name: 'Cloud Pro', price: '$29/월~' },
        { name: 'Cloud Team', price: '$99/월~' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'STRAPI_URL',
        public: true,
        description: 'Strapi 서버 URL',
        description_ko: 'Strapi 서버 URL',
      },
      {
        name: 'STRAPI_API_TOKEN',
        public: false,
        description: 'Strapi API 토큰',
        description_ko: 'Strapi API 토큰',
      },
    ],
    domain: 'business',
    subcategory: 'headless-cms',
    popularity_score: 77,
    difficulty_level: 'intermediate',
    tags: ['cms', 'headless', 'open-source', 'self-hosted', 'rest', 'graphql', 'admin-panel', 'content'],
    alternatives: ['sanity', 'contentful'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'nuxt', 'gatsby', 'angular', 'svelte', 'astro'],
      language: ['javascript', 'typescript'],
    },
    official_sdks: {
      javascript: 'https://github.com/strapi/strapi',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 20,
    monthly_cost_estimate: {
      starter: '$0 (셀프 호스팅)',
      growth: '$29~$99',
      enterprise: '$200+',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 27. Plausible
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.plausible,
    name: 'Plausible',
    slug: 'plausible',
    category: 'analytics',
    description:
      '프라이버시 친화적인 경량 웹 분석 도구로, 쿠키 없이 방문자 통계를 수집하며 GDPR 규정을 준수합니다.',
    description_ko:
      '프라이버시 친화적인 경량 웹 분석 도구로, 쿠키 없이 방문자 통계를 수집하며 GDPR 규정을 준수합니다.',
    icon_url: null,
    website_url: 'https://plausible.io',
    docs_url: 'https://plausible.io/docs',
    pricing_info: {
      free_tier: false,
      free_tier_details: '30일 무료 체험, 셀프 호스팅 시 무료',
      plans: [
        { name: 'Growth', price: '$9/월~ (10K 페이지뷰)' },
        { name: 'Business', price: '$19/월~ (10K 페이지뷰)' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN',
        public: true,
        description: 'Plausible에 등록한 사이트 도메인',
        description_ko: 'Plausible에 등록한 사이트 도메인',
      },
      {
        name: 'PLAUSIBLE_API_KEY',
        public: false,
        description: 'Plausible API 키 (Stats API용)',
        description_ko: 'Plausible API 키 (Stats API용)',
      },
    ],
    domain: 'business',
    subcategory: 'privacy-analytics',
    popularity_score: 58,
    difficulty_level: 'beginner',
    tags: ['analytics', 'privacy', 'gdpr', 'cookie-free', 'open-source', 'lightweight', 'self-hosted'],
    alternatives: ['ga4', 'posthog', 'mixpanel'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'nuxt', 'gatsby', 'astro', 'svelte', 'remix'],
      language: ['javascript', 'typescript'],
    },
    official_sdks: {
      'next-plugin': 'https://github.com/4lejandrito/next-plausible',
    },
    free_tier_quality: 'none',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 5,
    monthly_cost_estimate: {
      starter: '$9',
      growth: '$19~$69',
      enterprise: '$150+',
    },
    dx_score: 9.5,
  },

  // -----------------------------------------------------------------------
  // 28. Cypress
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.cypress,
    name: 'Cypress',
    slug: 'cypress',
    category: 'testing',
    description:
      '프론트엔드 E2E·컴포넌트 테스트 프레임워크로, 실시간 리로드·타임트래블 디버깅·자동 대기 기능을 제공합니다.',
    description_ko:
      '프론트엔드 E2E·컴포넌트 테스트 프레임워크로, 실시간 리로드·타임트래블 디버깅·자동 대기 기능을 제공합니다.',
    icon_url: null,
    website_url: 'https://www.cypress.io',
    docs_url: 'https://docs.cypress.io',
    pricing_info: {
      free_tier: true,
      free_tier_details: '오픈소스 테스트 러너 무료, Cypress Cloud: 월 500 테스트 결과',
      plans: [
        { name: 'Open Source', price: '$0 (무료)' },
        { name: 'Starter (Cloud)', price: '$0/월 (500 결과)' },
        { name: 'Team (Cloud)', price: '$67/월' },
        { name: 'Business (Cloud)', price: '$250/월' },
        { name: 'Enterprise', price: '문의' },
      ],
    },
    required_env_vars: [
      {
        name: 'CYPRESS_BASE_URL',
        public: false,
        description: '테스트 대상 기본 URL',
        description_ko: '테스트 대상 기본 URL',
      },
      {
        name: 'CYPRESS_RECORD_KEY',
        public: false,
        description: 'Cypress Cloud 녹화 키 (CI에서 결과 기록용)',
        description_ko: 'Cypress Cloud 녹화 키 (CI에서 결과 기록용)',
      },
    ],
    domain: 'devtools',
    subcategory: 'e2e-testing',
    popularity_score: 82,
    difficulty_level: 'beginner',
    tags: ['testing', 'e2e', 'component', 'browser', 'automation', 'debug', 'ci', 'open-source'],
    alternatives: ['playwright'],
    compatibility: {
      framework: ['next', 'react', 'vue', 'angular', 'svelte', 'nuxt'],
      language: ['javascript', 'typescript'],
    },
    official_sdks: {
      javascript: 'https://github.com/cypress-io/cypress',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 10,
    monthly_cost_estimate: {
      starter: '$0',
      growth: '$67',
      enterprise: '$250+',
    },
    dx_score: 8.5,
  },

  // -----------------------------------------------------------------------
  // 29. BullMQ
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.bullmq,
    name: 'BullMQ',
    slug: 'bullmq',
    category: 'queue',
    description:
      'Redis 기반의 Node.js용 고성능 작업 큐 라이브러리로, 지연 작업·반복 작업·우선순위 큐·플로우 등을 지원합니다.',
    description_ko:
      'Redis 기반의 Node.js용 고성능 작업 큐 라이브러리로, 지연 작업·반복 작업·우선순위 큐·플로우 등을 지원합니다.',
    icon_url: null,
    website_url: 'https://bullmq.io',
    docs_url: 'https://docs.bullmq.io',
    pricing_info: {
      free_tier: true,
      free_tier_details: '오픈소스 완전 무료 (Redis 인프라 비용 별도)',
      plans: [
        { name: 'Open Source', price: '$0 (무료)' },
        { name: 'BullMQ Pro', price: '$299/월~ (고급 기능)' },
      ],
    },
    required_env_vars: [
      {
        name: 'REDIS_URL',
        public: false,
        description: 'Redis 연결 URL (BullMQ 백엔드)',
        description_ko: 'Redis 연결 URL (BullMQ 백엔드)',
      },
    ],
    domain: 'integration',
    subcategory: 'job-queue',
    popularity_score: 65,
    difficulty_level: 'intermediate',
    tags: ['queue', 'redis', 'job', 'background', 'worker', 'delayed', 'repeatable', 'priority', 'open-source'],
    alternatives: ['trigger-dev', 'inngest'],
    compatibility: {
      framework: ['next', 'express', 'fastify', 'nestjs', 'hono'],
      language: ['javascript', 'typescript'],
    },
    official_sdks: {
      javascript: 'https://github.com/taskforcesh/bullmq',
    },
    free_tier_quality: 'excellent',
    vendor_lock_in_risk: 'low',
    setup_time_minutes: 15,
    monthly_cost_estimate: {
      starter: '$0 (+ Redis 비용)',
      growth: '$10~$50 (Redis)',
      enterprise: '$299+ (Pro 라이선스)',
    },
    dx_score: 8.0,
  },

  // -----------------------------------------------------------------------
  // 30. Shopify API
  // -----------------------------------------------------------------------
  {
    id: SERVICE_IDS_V2.shopify_api,
    name: 'Shopify API',
    slug: 'shopify-api',
    category: 'ecommerce',
    description:
      'Shopify 스토어와 연동하는 앱·커스텀 스토어프론트를 구축할 수 있는 API로, Storefront·Admin·Checkout API를 제공합니다.',
    description_ko:
      'Shopify 스토어와 연동하는 앱·커스텀 스토어프론트를 구축할 수 있는 API로, Storefront·Admin·Checkout API를 제공합니다.',
    icon_url: null,
    website_url: 'https://shopify.dev',
    docs_url: 'https://shopify.dev/docs/api',
    pricing_info: {
      free_tier: true,
      free_tier_details: '개발 스토어 무료, Shopify Partners 프로그램 무료',
      plans: [
        { name: 'Basic Shopify', price: '$39/월' },
        { name: 'Shopify', price: '$105/월' },
        { name: 'Advanced', price: '$399/월' },
        { name: 'Shopify Plus', price: '$2,300/월~' },
      ],
    },
    required_env_vars: [
      {
        name: 'SHOPIFY_STORE_DOMAIN',
        public: true,
        description: 'Shopify 스토어 도메인 (예: mystore.myshopify.com)',
        description_ko: 'Shopify 스토어 도메인 (예: mystore.myshopify.com)',
      },
      {
        name: 'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
        public: true,
        description: 'Shopify Storefront API 액세스 토큰',
        description_ko: 'Shopify Storefront API 액세스 토큰',
      },
      {
        name: 'SHOPIFY_ADMIN_ACCESS_TOKEN',
        public: false,
        description: 'Shopify Admin API 액세스 토큰',
        description_ko: 'Shopify Admin API 액세스 토큰',
      },
      {
        name: 'SHOPIFY_API_SECRET',
        public: false,
        description: 'Shopify 앱 API 시크릿 키',
        description_ko: 'Shopify 앱 API 시크릿 키',
      },
    ],
    domain: 'business',
    subcategory: 'ecommerce-platform',
    popularity_score: 90,
    difficulty_level: 'intermediate',
    tags: ['ecommerce', 'shop', 'storefront', 'payment', 'cart', 'graphql', 'headless-commerce', 'shopify'],
    alternatives: ['stripe', 'lemonsqueezy'],
    compatibility: {
      framework: ['next', 'react', 'remix', 'hydrogen', 'vue', 'nuxt', 'angular'],
      language: ['javascript', 'typescript', 'ruby', 'python', 'php', 'java', 'go'],
    },
    official_sdks: {
      javascript: 'https://github.com/Shopify/shopify-api-js',
      hydrogen: 'https://github.com/Shopify/hydrogen',
      ruby: 'https://github.com/Shopify/shopify-api-ruby',
      python: 'https://github.com/Shopify/shopify-python-api',
    },
    free_tier_quality: 'good',
    vendor_lock_in_risk: 'high',
    setup_time_minutes: 30,
    monthly_cost_estimate: {
      starter: '$39',
      growth: '$105~$399',
      enterprise: '$2,300+',
    },
    dx_score: 7.5,
  },
];

import type { ServiceCategory } from '@/types';

export interface ComparisonSeed {
  category: ServiceCategory;
  title: string;
  title_ko: string;
  services: string[]; // service UUIDs
  comparison_data: {
    criteria: {
      name: string;
      name_ko: string;
      values: Record<string, string>; // slug -> value
    }[];
  };
  recommendation: Record<string, { need: string; choose: string; because: string }>;
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
  planetscale: '10000000-0000-4000-a000-000000000014',
  neon: '10000000-0000-4000-a000-000000000015',
  railway: '10000000-0000-4000-a000-000000000016',
  algolia: '10000000-0000-4000-a000-000000000024',
  sanity: '10000000-0000-4000-a000-000000000025',
  ga4: '10000000-0000-4000-a000-000000000026',
  cloudflare: '10000000-0000-4000-a000-000000000028',
  fly_io: '10000000-0000-4000-a000-000000000029',
  mixpanel: '10000000-0000-4000-a000-000000000031',
  contentful: '10000000-0000-4000-a000-000000000032',
  meilisearch: '10000000-0000-4000-a000-000000000033',
  render: '10000000-0000-4000-a000-000000000038',
  plausible: '10000000-0000-4000-a000-000000000047',
  strapi: '10000000-0000-4000-a000-000000000046',
  posthog: '10000000-0000-4000-a000-000000000019',
  playwright: '10000000-0000-4000-a000-000000000040',
  cypress: '10000000-0000-4000-a000-000000000048',
  groq: '10000000-0000-4000-a000-000000000037',
} as const;

export const comparisons: ComparisonSeed[] = [
  // --- 1. Database Comparison ---
  {
    category: 'database',
    title: 'Database Platform Comparison',
    title_ko: '데이터베이스 플랫폼 비교',
    services: [S.supabase, S.firebase, S.planetscale, S.neon],
    comparison_data: {
      criteria: [
        { name: 'Database Type', name_ko: '데이터베이스 타입', values: { supabase: 'PostgreSQL', firebase: 'NoSQL (Firestore)', planetscale: 'MySQL (Vitess)', neon: 'PostgreSQL' } },
        { name: 'Free Tier', name_ko: '무료 티어', values: { supabase: '500MB, 50K MAU', firebase: 'Spark plan (generous)', planetscale: '5GB, 1B reads', neon: '512MB, 3GB storage' } },
        { name: 'Realtime', name_ko: '실시간', values: { supabase: 'Built-in (WebSocket)', firebase: 'Built-in (native)', planetscale: 'Not built-in', neon: 'Not built-in' } },
        { name: 'Auth Included', name_ko: '인증 포함', values: { supabase: 'Yes', firebase: 'Yes', planetscale: 'No', neon: 'No' } },
        { name: 'Open Source', name_ko: '오픈소스', values: { supabase: 'Yes', firebase: 'No', planetscale: 'Vitess is OSS', neon: 'Yes' } },
        { name: 'Branching', name_ko: '브랜칭', values: { supabase: 'Preview branches', firebase: 'Emulator', planetscale: 'Yes (core feature)', neon: 'Yes (core feature)' } },
        { name: 'Scaling', name_ko: '확장성', values: { supabase: 'Vertical + Read replicas', firebase: 'Auto-scale', planetscale: 'Horizontal (Vitess)', neon: 'Auto-scale + branching' } },
        { name: 'DX Score', name_ko: 'DX 점수', values: { supabase: '9.2', firebase: '8.5', planetscale: '8.8', neon: '9.0' } },
      ],
    },
    recommendation: {
      full_stack: { need: '풀스택 BaaS가 필요할 때', choose: 'Supabase', because: 'DB + Auth + Storage + Realtime을 하나로 제공' },
      mobile_first: { need: '모바일 중심 앱을 만들 때', choose: 'Firebase', because: '모바일 SDK가 가장 성숙하고 오프라인 지원이 뛰어남' },
      high_scale_mysql: { need: 'MySQL 기반 대규모 서비스가 필요할 때', choose: 'PlanetScale', because: 'Vitess 기반 무한 수평 확장 지원' },
      serverless_postgres: { need: '서버리스 Postgres가 필요할 때', choose: 'Neon', because: '자동 스케일링과 브랜칭이 뛰어남' },
    },
  },

  // --- 2. Deployment Platform Comparison ---
  {
    category: 'deploy',
    title: 'Deployment Platform Comparison',
    title_ko: '배포 플랫폼 비교',
    services: [S.vercel, S.netlify, S.railway, S.fly_io, S.render],
    comparison_data: {
      criteria: [
        { name: 'Best For', name_ko: '최적 용도', values: { vercel: 'Next.js / React', netlify: 'JAMstack / Static', railway: 'Full-stack / Docker', fly_io: 'Edge / Containers', render: 'All-in-one hosting' } },
        { name: 'Free Tier', name_ko: '무료 티어', values: { vercel: 'Hobby (generous)', netlify: '100GB bandwidth', railway: '$5 credit/mo', fly_io: '3 shared VMs', render: 'Static sites free' } },
        { name: 'Edge Functions', name_ko: '엣지 함수', values: { vercel: 'Yes (Middleware)', netlify: 'Yes (Edge Functions)', railway: 'No', fly_io: 'Yes (core feature)', render: 'No' } },
        { name: 'Docker Support', name_ko: 'Docker 지원', values: { vercel: 'Limited', netlify: 'No', railway: 'Yes (native)', fly_io: 'Yes (native)', render: 'Yes' } },
        { name: 'Database Hosting', name_ko: 'DB 호스팅', values: { vercel: 'Postgres (add-on)', netlify: 'No', railway: 'Postgres, Redis, MySQL', fly_io: 'Postgres (Fly Postgres)', render: 'Postgres (managed)' } },
        { name: 'Preview Deploys', name_ko: '프리뷰 배포', values: { vercel: 'Yes (PR-based)', netlify: 'Yes (PR-based)', railway: 'Yes', fly_io: 'Yes (machines)', render: 'Yes' } },
        { name: 'DX Score', name_ko: 'DX 점수', values: { vercel: '9.5', netlify: '8.8', railway: '9.0', fly_io: '8.2', render: '8.5' } },
      ],
    },
    recommendation: {
      nextjs: { need: 'Next.js 앱을 배포할 때', choose: 'Vercel', because: 'Next.js 제작사로 최적의 통합과 성능 제공' },
      static_sites: { need: '정적 사이트 / JAMstack을 배포할 때', choose: 'Netlify', because: '정적 사이트에 최적화된 CDN과 빌드 파이프라인' },
      full_stack_docker: { need: 'Docker 기반 풀스택 앱을 배포할 때', choose: 'Railway', because: 'Docker + DB를 한 번에, 뛰어난 DX' },
      global_edge: { need: '전 세계 엣지 배포가 필요할 때', choose: 'Fly.io', because: '30+ 리전에 컨테이너를 자동 배포' },
    },
  },

  // --- 3. Auth Comparison ---
  {
    category: 'auth',
    title: 'Authentication Solution Comparison',
    title_ko: '인증 솔루션 비교',
    services: [S.clerk, S.nextauth, S.supabase, S.firebase],
    comparison_data: {
      criteria: [
        { name: 'Type', name_ko: '타입', values: { clerk: 'Managed SaaS', nextauth: 'Self-hosted library', supabase: 'BaaS (included)', firebase: 'BaaS (included)' } },
        { name: 'Free Tier', name_ko: '무료 티어', values: { clerk: '10K MAU', nextauth: 'Unlimited (OSS)', supabase: '50K MAU', firebase: 'Unlimited (Spark)' } },
        { name: 'UI Components', name_ko: 'UI 컴포넌트', values: { clerk: 'Pre-built (excellent)', nextauth: 'DIY', supabase: '@supabase/auth-ui', firebase: 'FirebaseUI' } },
        { name: 'Social Providers', name_ko: '소셜 로그인', values: { clerk: '20+', nextauth: '50+ (community)', supabase: '15+', firebase: '10+' } },
        { name: 'MFA', name_ko: 'MFA', values: { clerk: 'Yes (built-in)', nextauth: 'DIY', supabase: 'Yes (TOTP)', firebase: 'Yes (phone/TOTP)' } },
        { name: 'Vendor Lock-in', name_ko: '벤더 종속성', values: { clerk: 'High', nextauth: 'None', supabase: 'Low', firebase: 'High' } },
        { name: 'DX Score', name_ko: 'DX 점수', values: { clerk: '9.5', nextauth: '7.5', supabase: '8.5', firebase: '8.0' } },
      ],
    },
    recommendation: {
      fast_launch: { need: '빠르게 인증을 구현할 때', choose: 'Clerk', because: '프리빌트 UI + 뛰어난 DX로 5분 안에 인증 완성' },
      full_control: { need: '완전한 제어가 필요할 때', choose: 'NextAuth', because: '오픈소스로 자유로운 커스터마이징, 벤더 종속 없음' },
      with_db: { need: 'DB와 함께 인증이 필요할 때', choose: 'Supabase', because: 'DB + Auth + Storage 원스톱 솔루션' },
    },
  },

  // --- 4. CMS Comparison ---
  {
    category: 'cms',
    title: 'Headless CMS Comparison',
    title_ko: '헤드리스 CMS 비교',
    services: [S.sanity, S.contentful, S.strapi],
    comparison_data: {
      criteria: [
        { name: 'Hosting', name_ko: '호스팅', values: { sanity: 'Managed', contentful: 'Managed', strapi: 'Self-hosted' } },
        { name: 'Free Tier', name_ko: '무료 티어', values: { sanity: '100K API reqs/mo', contentful: '25K records', strapi: 'Free (self-hosted)' } },
        { name: 'Content Modeling', name_ko: '콘텐츠 모델링', values: { sanity: 'Schema-as-code', contentful: 'GUI-based', strapi: 'GUI + code' } },
        { name: 'Real-time Preview', name_ko: '실시간 프리뷰', values: { sanity: 'Excellent (GROQ)', contentful: 'Good (preview API)', strapi: 'Plugin required' } },
        { name: 'Open Source', name_ko: '오픈소스', values: { sanity: 'Studio is OSS', contentful: 'No', strapi: 'Yes (fully)' } },
        { name: 'Learning Curve', name_ko: '학습 곡선', values: { sanity: 'Medium (GROQ)', contentful: 'Low', strapi: 'Low-Medium' } },
        { name: 'DX Score', name_ko: 'DX 점수', values: { sanity: '9.0', contentful: '8.0', strapi: '7.5' } },
      ],
    },
    recommendation: {
      developer_first: { need: '개발자 중심 CMS가 필요할 때', choose: 'Sanity', because: 'Schema-as-code, 실시간 협업, GROQ 쿼리' },
      enterprise: { need: '엔터프라이즈 규모가 필요할 때', choose: 'Contentful', because: '검증된 엔터프라이즈 CMS, 풍부한 에코시스템' },
      self_hosted: { need: '완전한 제어 + 자체 호스팅이 필요할 때', choose: 'Strapi', because: '오픈소스 + 자체 호스팅으로 데이터 주권 확보' },
    },
  },

  // --- 5. Analytics Comparison ---
  {
    category: 'analytics',
    title: 'Analytics Platform Comparison',
    title_ko: '분석 플랫폼 비교',
    services: [S.ga4, S.mixpanel, S.posthog, S.plausible],
    comparison_data: {
      criteria: [
        { name: 'Type', name_ko: '타입', values: { ga4: 'Web Analytics', mixpanel: 'Product Analytics', posthog: 'Product Analytics', plausible: 'Web Analytics' } },
        { name: 'Privacy', name_ko: '프라이버시', values: { ga4: 'Cookie-based', mixpanel: 'GDPR compliant', posthog: 'Cookie-less option', plausible: 'No cookies (GDPR-free)' } },
        { name: 'Free Tier', name_ko: '무료 티어', values: { ga4: 'Unlimited', mixpanel: '20M events/mo', posthog: '1M events/mo', plausible: 'No (paid only)' } },
        { name: 'Session Replay', name_ko: '세션 리플레이', values: { ga4: 'No', mixpanel: 'No', posthog: 'Yes', plausible: 'No' } },
        { name: 'Feature Flags', name_ko: '피처 플래그', values: { ga4: 'No', mixpanel: 'No', posthog: 'Yes', plausible: 'No' } },
        { name: 'Self-host Option', name_ko: '자체 호스팅', values: { ga4: 'No', mixpanel: 'No', posthog: 'Yes', plausible: 'Yes' } },
        { name: 'DX Score', name_ko: 'DX 점수', values: { ga4: '7.0', mixpanel: '8.5', posthog: '9.0', plausible: '9.5' } },
      ],
    },
    recommendation: {
      traditional_web: { need: '전통적인 웹 분석이 필요할 때', choose: 'GA4', because: '무료 + Google Ads 통합 + 풍부한 에코시스템' },
      product_analytics: { need: '제품 분석 (퍼널, 코호트)이 필요할 때', choose: 'Mixpanel', because: '이벤트 기반 분석의 강자, 강력한 퍼널 분석' },
      all_in_one: { need: '분석 + 세션 리플레이 + 피처 플래그가 필요할 때', choose: 'PostHog', because: '올인원 제품 분석 스위트, 자체 호스팅 가능' },
      privacy_first: { need: '프라이버시 최우선이 필요할 때', choose: 'Plausible', because: '쿠키 없는 분석, GDPR 걱정 없음, 가벼움' },
    },
  },
];

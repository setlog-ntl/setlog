import type { ServiceConnectionConfig } from '@/types';

/**
 * 서비스 slug별 연결 방법 정의
 * capabilities: 지원하는 연결 방식 목록
 * primary: 기본 권장 연결 방식
 */
export const serviceConnectionConfigs: Record<string, ServiceConnectionConfig> = {
  'github-actions': {
    capabilities: ['oauth', 'api_key'],
    primary: 'oauth',
    oauth_config: {
      provider: 'github',
      authorization_url: 'https://github.com/login/oauth/authorize',
      token_url: 'https://github.com/login/oauth/access_token',
      scopes: ['repo', 'read:org', 'read:user', 'workflow'],
    },
    api_key_fields: [
      {
        name: 'GITHUB_TOKEN',
        label: 'Personal Access Token',
        label_ko: 'Personal Access Token',
        placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://github.com/settings/tokens',
      },
    ],
    verify_url: 'https://api.github.com/user',
    description_ko: 'GitHub 저장소 및 Actions에 접근합니다',
  },
  vercel: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'VERCEL_TOKEN',
        label: 'Vercel Token',
        label_ko: 'Vercel 토큰',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://vercel.com/account/tokens',
      },
    ],
    verify_url: 'https://api.vercel.com/v2/user',
    description_ko: 'Vercel 배포를 관리합니다',
  },
  supabase: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'SUPABASE_URL',
        label: 'Project URL',
        label_ko: '프로젝트 URL',
        placeholder: 'https://xxxxx.supabase.co',
        is_required: true,
      },
      {
        name: 'SUPABASE_ANON_KEY',
        label: 'Anon Key',
        label_ko: 'Anon Key',
        placeholder: 'eyJhbGciOiJIUzI1NiIs...',
        is_required: true,
        help_url: 'https://supabase.com/dashboard/project/_/settings/api',
      },
    ],
    description_ko: 'Supabase 데이터베이스와 인증에 접근합니다',
  },
  stripe: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'STRIPE_SECRET_KEY',
        label: 'Secret Key',
        label_ko: '시크릿 키',
        placeholder: 'sk_test_xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://dashboard.stripe.com/apikeys',
      },
      {
        name: 'STRIPE_PUBLISHABLE_KEY',
        label: 'Publishable Key',
        label_ko: '공개 키',
        placeholder: 'pk_test_xxxxxxxxxxxxxxxxxxxx',
        is_required: false,
      },
    ],
    description_ko: '결제 처리 및 구독을 관리합니다',
  },
  openai: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'OPENAI_API_KEY',
        label: 'API Key',
        label_ko: 'API 키',
        placeholder: 'sk-xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://platform.openai.com/api-keys',
      },
    ],
    verify_url: 'https://api.openai.com/v1/models',
    description_ko: 'OpenAI GPT 모델에 접근합니다',
  },
  anthropic: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'ANTHROPIC_API_KEY',
        label: 'API Key',
        label_ko: 'API 키',
        placeholder: 'sk-ant-xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://console.anthropic.com/settings/keys',
      },
    ],
    description_ko: 'Anthropic Claude 모델에 접근합니다',
  },
  sentry: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'SENTRY_DSN',
        label: 'DSN',
        label_ko: 'DSN',
        placeholder: 'https://xxxxx@xxxxx.ingest.sentry.io/xxxxx',
        is_required: true,
      },
      {
        name: 'SENTRY_AUTH_TOKEN',
        label: 'Auth Token',
        label_ko: '인증 토큰',
        placeholder: 'sntrys_xxxxxxxxxxxxxxxxxxxx',
        is_required: false,
        help_url: 'https://sentry.io/settings/auth-tokens/',
      },
    ],
    description_ko: '에러 모니터링 및 성능 추적을 관리합니다',
  },
  clerk: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'CLERK_SECRET_KEY',
        label: 'Secret Key',
        label_ko: '시크릿 키',
        placeholder: 'sk_test_xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://dashboard.clerk.com/last-active?path=api-keys',
      },
      {
        name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        label: 'Publishable Key',
        label_ko: '공개 키',
        placeholder: 'pk_test_xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
      },
    ],
    description_ko: '사용자 인증 및 관리를 처리합니다',
  },
  sendgrid: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'SENDGRID_API_KEY',
        label: 'API Key',
        label_ko: 'API 키',
        placeholder: 'SG.xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://app.sendgrid.com/settings/api_keys',
      },
    ],
    description_ko: '이메일 발송을 관리합니다',
  },
  cloudflare: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'CLOUDFLARE_API_TOKEN',
        label: 'API Token',
        label_ko: 'API 토큰',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://dash.cloudflare.com/profile/api-tokens',
      },
    ],
    verify_url: 'https://api.cloudflare.com/client/v4/user/tokens/verify',
    description_ko: 'Cloudflare CDN 및 DNS를 관리합니다',
  },
  netlify: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'NETLIFY_AUTH_TOKEN',
        label: 'Personal Access Token',
        label_ko: '개인 액세스 토큰',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://app.netlify.com/user/applications#personal-access-tokens',
      },
    ],
    verify_url: 'https://api.netlify.com/api/v1/user',
    description_ko: 'Netlify 배포를 관리합니다',
  },
  railway: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'RAILWAY_TOKEN',
        label: 'Account Token',
        label_ko: '계정 토큰',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://railway.app/account/tokens',
      },
    ],
    description_ko: 'Railway 배포를 관리합니다',
  },
  resend: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'RESEND_API_KEY',
        label: 'API Key',
        label_ko: 'API 키',
        placeholder: 're_xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://resend.com/api-keys',
      },
    ],
    description_ko: '이메일 발송을 관리합니다',
  },
  firebase: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'FIREBASE_API_KEY',
        label: 'Web API Key',
        label_ko: '웹 API 키',
        placeholder: 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx',
        is_required: true,
      },
      {
        name: 'FIREBASE_PROJECT_ID',
        label: 'Project ID',
        label_ko: '프로젝트 ID',
        placeholder: 'my-project-id',
        is_required: true,
      },
    ],
    description_ko: 'Firebase 백엔드 서비스에 접근합니다',
  },
  posthog: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'POSTHOG_API_KEY',
        label: 'Project API Key',
        label_ko: '프로젝트 API 키',
        placeholder: 'phc_xxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://app.posthog.com/project/settings',
      },
    ],
    description_ko: '제품 분석 및 A/B 테스트를 관리합니다',
  },
  cloudinary: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'CLOUDINARY_URL',
        label: 'Cloudinary URL',
        label_ko: 'Cloudinary URL',
        placeholder: 'cloudinary://xxx:xxx@xxx',
        is_required: true,
        help_url: 'https://console.cloudinary.com/settings/api-keys',
      },
    ],
    description_ko: '미디어 에셋을 관리합니다',
  },
  twilio: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'TWILIO_ACCOUNT_SID',
        label: 'Account SID',
        label_ko: '계정 SID',
        placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        is_required: true,
      },
      {
        name: 'TWILIO_AUTH_TOKEN',
        label: 'Auth Token',
        label_ko: '인증 토큰',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://console.twilio.com/',
      },
    ],
    description_ko: 'SMS 및 음성 통신을 관리합니다',
  },
  algolia: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'ALGOLIA_APP_ID',
        label: 'Application ID',
        label_ko: '애플리케이션 ID',
        placeholder: 'XXXXXXXXXX',
        is_required: true,
      },
      {
        name: 'ALGOLIA_API_KEY',
        label: 'Admin API Key',
        label_ko: '관리자 API 키',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://dashboard.algolia.com/account/api-keys/all',
      },
    ],
    description_ko: '검색 기능을 관리합니다',
  },
  'upstash-redis': {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'UPSTASH_REDIS_REST_URL',
        label: 'REST URL',
        label_ko: 'REST URL',
        placeholder: 'https://xxxxx.upstash.io',
        is_required: true,
      },
      {
        name: 'UPSTASH_REDIS_REST_TOKEN',
        label: 'REST Token',
        label_ko: 'REST 토큰',
        placeholder: 'AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA',
        is_required: true,
        help_url: 'https://console.upstash.com/',
      },
    ],
    description_ko: 'Redis 캐시에 접근합니다',
  },
  datadog: {
    capabilities: ['api_key'],
    primary: 'api_key',
    api_key_fields: [
      {
        name: 'DD_API_KEY',
        label: 'API Key',
        label_ko: 'API 키',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        is_required: true,
        help_url: 'https://app.datadoghq.com/organization-settings/api-keys',
      },
    ],
    description_ko: '인프라 모니터링 및 로깅을 관리합니다',
  },
  // AWS, GCP, Azure: 수동 설정만 가능
  'aws-s3': {
    capabilities: ['manual'],
    primary: 'manual',
    description_ko: 'AWS IAM 및 OIDC 설정이 필요합니다 (수동)',
  },
};

/**
 * slug로 연결 설정을 조회합니다.
 * 설정이 없으면 manual 기본값을 반환합니다.
 */
export function getConnectionConfig(slug: string): ServiceConnectionConfig {
  return serviceConnectionConfigs[slug] || {
    capabilities: ['manual'],
    primary: 'manual',
    description_ko: '수동 설정이 필요합니다',
  };
}

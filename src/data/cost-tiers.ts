export interface CostTierSeed {
  service_id: string;
  tier_name: string;
  tier_name_ko: string;
  price_monthly: string;
  price_yearly: string;
  features: { feature: string; feature_ko: string; included: boolean }[];
  limits: Record<string, string>;
  recommended_for: string;
  order_index: number;
}

// Service ID mapping
const S: Record<string, string> = {
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
};

// Helper function to create tier
const t = (
  serviceId: string,
  name: string,
  nameKo: string,
  priceM: string,
  priceY: string,
  features: [string, string, boolean][],
  limits: Record<string, string>,
  recFor: string,
  order: number
): CostTierSeed => ({
  service_id: serviceId,
  tier_name: name,
  tier_name_ko: nameKo,
  price_monthly: priceM,
  price_yearly: priceY,
  features: features.map(([f, fk, i]) => ({ feature: f, feature_ko: fk, included: i })),
  limits,
  recommended_for: recFor,
  order_index: order,
});

export const costTiers: CostTierSeed[] = [
  // Supabase (3 tiers)
  t(S.supabase, 'free', '무료', '$0', '$0', [
    ['500MB database', '500MB 데이터베이스', true],
    ['50K monthly users', '월 5만 사용자', true],
    ['Community support', '커뮤니티 지원', true],
  ], { storage: '1GB', bandwidth: '2GB/mo', db: '500MB' }, '개인 프로젝트', 0),

  t(S.supabase, 'pro', '프로', '$25', '$240', [
    ['8GB database', '8GB 데이터베이스', true],
    ['100K monthly users', '월 10만 사용자', true],
    ['Email support', '이메일 지원', true],
  ], { storage: '100GB', bandwidth: '250GB/mo', db: '8GB' }, '스타트업', 1),

  t(S.supabase, 'enterprise', '엔터프라이즈', 'Contact', 'Contact', [
    ['Unlimited resources', '무제한 리소스', true],
    ['99.99% SLA', '99.99% SLA', true],
    ['Dedicated support', '전담 지원', true],
  ], { storage: 'Unlimited', bandwidth: 'Unlimited', db: 'Custom' }, '대기업', 2),

  // Firebase (3 tiers)
  t(S.firebase, 'spark', '스파크', '$0', '$0', [
    ['1GB storage', '1GB 스토리지', true],
    ['10GB bandwidth', '10GB 전송량', true],
    ['Basic features', '기본 기능', true],
  ], { storage: '1GB', bandwidth: '10GB/mo', auth: '10K/mo' }, '개인 프로젝트', 0),

  t(S.firebase, 'blaze', '블레이즈', 'Pay as you go', 'Pay as you go', [
    ['Unlimited storage', '무제한 스토리지', true],
    ['Auto-scaling', '자동 확장', true],
    ['Priority support', '우선 지원', true],
  ], { storage: 'Pay per use', bandwidth: 'Pay per use', auth: 'Unlimited' }, '성장 중인 앱', 1),

  t(S.firebase, 'enterprise', '엔터프라이즈', 'Contact', 'Contact', [
    ['Custom SLA', '맞춤 SLA', true],
    ['Dedicated support', '전담 지원', true],
    ['Advanced security', '고급 보안', true],
  ], { storage: 'Custom', bandwidth: 'Custom', auth: 'Custom' }, '대기업', 2),

  // Vercel (3 tiers)
  t(S.vercel, 'hobby', '취미', '$0', '$0', [
    ['100GB bandwidth', '100GB 전송량', true],
    ['Basic analytics', '기본 분석', true],
    ['Community support', '커뮤니티 지원', true],
  ], { bandwidth: '100GB/mo', builds: '6000 min/mo', team: '1' }, '개인 프로젝트', 0),

  t(S.vercel, 'pro', '프로', '$20', '$240', [
    ['1TB bandwidth', '1TB 전송량', true],
    ['Advanced analytics', '고급 분석', true],
    ['Email support', '이메일 지원', true],
  ], { bandwidth: '1TB/mo', builds: 'Unlimited', team: 'Unlimited' }, '전문가/팀', 1),

  t(S.vercel, 'enterprise', '엔터프라이즈', 'Contact', 'Contact', [
    ['Custom bandwidth', '맞춤 전송량', true],
    ['99.99% SLA', '99.99% SLA', true],
    ['Dedicated support', '전담 지원', true],
  ], { bandwidth: 'Custom', builds: 'Unlimited', team: 'Custom' }, '대기업', 2),

  // Netlify (2 tiers)
  t(S.netlify, 'starter', '스타터', '$0', '$0', [
    ['100GB bandwidth', '100GB 전송량', true],
    ['300 build minutes', '300분 빌드', true],
    ['Community support', '커뮤니티 지원', true],
  ], { bandwidth: '100GB/mo', builds: '300 min/mo', forms: '100/mo' }, '개인 프로젝트', 0),

  t(S.netlify, 'pro', '프로', '$19', '$228', [
    ['1TB bandwidth', '1TB 전송량', true],
    ['25K build minutes', '25000분 빌드', true],
    ['Email support', '이메일 지원', true],
  ], { bandwidth: '1TB/mo', builds: '25K min/mo', forms: 'Unlimited' }, '전문가/팀', 1),

  // Stripe (3 tiers)
  t(S.stripe, 'free', '무료', '$0', '$0', [
    ['2.9% + 30¢ per charge', '거래당 2.9% + 30¢', true],
    ['Basic features', '기본 기능', true],
    ['Email support', '이메일 지원', true],
  ], { fee: '2.9% + 30¢', volume: 'Unlimited', disputes: 'Standard' }, '모든 규모', 0),

  t(S.stripe, 'plus', '플러스', '$2', '$24', [
    ['Lower fees', '낮은 수수료', true],
    ['Advanced features', '고급 기능', true],
    ['Priority support', '우선 지원', true],
  ], { fee: 'Custom', volume: 'Unlimited', disputes: 'Priority' }, '성장 기업', 1),

  t(S.stripe, 'enterprise', '엔터프라이즈', 'Contact', 'Contact', [
    ['Custom pricing', '맞춤 가격', true],
    ['Dedicated support', '전담 지원', true],
    ['SLA guarantee', 'SLA 보장', true],
  ], { fee: 'Negotiable', volume: 'Unlimited', disputes: 'Dedicated' }, '대기업', 2),

  // Clerk (3 tiers)
  t(S.clerk, 'free', '무료', '$0', '$0', [
    ['10K monthly users', '월 1만 사용자', true],
    ['Social logins', '소셜 로그인', true],
    ['Community support', '커뮤니티 지원', true],
  ], { users: '10K/mo', mau: '5K', orgs: 'Unlimited' }, '개인 프로젝트', 0),

  t(S.clerk, 'pro', '프로', '$25', '$300', [
    ['100K monthly users', '월 10만 사용자', true],
    ['Advanced security', '고급 보안', true],
    ['Email support', '이메일 지원', true],
  ], { users: '100K/mo', mau: '50K', orgs: 'Unlimited' }, '스타트업', 1),

  t(S.clerk, 'enterprise', '엔터프라이즈', 'Contact', 'Contact', [
    ['Unlimited users', '무제한 사용자', true],
    ['SAML SSO', 'SAML SSO', true],
    ['Dedicated support', '전담 지원', true],
  ], { users: 'Unlimited', mau: 'Unlimited', orgs: 'Unlimited' }, '대기업', 2),

  // NextAuth (1 tier - OSS)
  t(S.nextauth, 'free', '무료', '$0', '$0', [
    ['Self-hosted', '셀프 호스팅', true],
    ['Open source', '오픈 소스', true],
    ['Community support', '커뮤니티 지원', true],
  ], { users: 'Unlimited', providers: 'Unlimited', cost: 'Infrastructure only' }, '모든 규모', 0),

  // Resend (2 tiers)
  t(S.resend, 'free', '무료', '$0', '$0', [
    ['100 emails/day', '일 100통', true],
    ['1 domain', '1개 도메인', true],
    ['Basic analytics', '기본 분석', true],
  ], { emails: '3K/mo', domains: '1', api: 'Unlimited' }, '개인 프로젝트', 0),

  t(S.resend, 'pro', '프로', '$20', '$240', [
    ['50K emails/month', '월 5만통', true],
    ['Unlimited domains', '무제한 도메인', true],
    ['Advanced analytics', '고급 분석', true],
  ], { emails: '50K/mo', domains: 'Unlimited', api: 'Unlimited' }, '스타트업', 1),

  // SendGrid (2 tiers)
  t(S.sendgrid, 'free', '무료', '$0', '$0', [
    ['100 emails/day', '일 100통', true],
    ['Basic features', '기본 기능', true],
    ['Email support', '이메일 지원', true],
  ], { emails: '100/day', contacts: '2K', api: 'Standard' }, '개인 프로젝트', 0),

  t(S.sendgrid, 'essentials', '에센셜', '$19.95', '$239.40', [
    ['50K emails/month', '월 5만통', true],
    ['Advanced features', '고급 기능', true],
    ['Priority support', '우선 지원', true],
  ], { emails: '50K/mo', contacts: '50K', api: 'Advanced' }, '스타트업', 1),

  // OpenAI (3 tiers)
  t(S.openai, 'free', '무료', '$0', '$0', [
    ['$5 initial credit', '$5 초기 크레딧', true],
    ['Rate limited', '속도 제한', true],
    ['Community support', '커뮤니티 지원', true],
  ], { credit: '$5', rate: 'Limited', models: 'Standard' }, '테스트용', 0),

  t(S.openai, 'pay_as_you_go', '사용량 기반', 'Pay per use', 'Pay per use', [
    ['All models', '모든 모델', true],
    ['Higher rate limits', '높은 속도 제한', true],
    ['Email support', '이메일 지원', true],
  ], { credit: 'Pay per use', rate: 'Higher', models: 'All' }, '모든 규모', 1),

  t(S.openai, 'enterprise', '엔터프라이즈', 'Contact', 'Contact', [
    ['Custom pricing', '맞춤 가격', true],
    ['Priority access', '우선 액세스', true],
    ['Dedicated support', '전담 지원', true],
  ], { credit: 'Custom', rate: 'Highest', models: 'All + Fine-tuned' }, '대기업', 2),

  // Anthropic (2 tiers)
  t(S.anthropic, 'pay_as_you_go', '사용량 기반', 'Pay per use', 'Pay per use', [
    ['All Claude models', '모든 Claude 모델', true],
    ['API access', 'API 액세스', true],
    ['Email support', '이메일 지원', true],
  ], { credit: 'Pay per use', rate: 'Standard', models: 'All' }, '모든 규모', 0),

  t(S.anthropic, 'enterprise', '엔터프라이즈', 'Contact', 'Contact', [
    ['Volume discounts', '볼륨 할인', true],
    ['Priority support', '우선 지원', true],
    ['Custom terms', '맞춤 조건', true],
  ], { credit: 'Custom', rate: 'Higher', models: 'All + Beta' }, '대기업', 1),

  // Cloudinary (2 tiers)
  t(S.cloudinary, 'free', '무료', '$0', '$0', [
    ['25GB storage', '25GB 스토리지', true],
    ['25GB bandwidth', '25GB 전송량', true],
    ['Community support', '커뮤니티 지원', true],
  ], { storage: '25GB', bandwidth: '25GB/mo', transforms: '25K/mo' }, '개인 프로젝트', 0),

  t(S.cloudinary, 'plus', '플러스', '$99', '$1188', [
    ['104GB storage', '104GB 스토리지', true],
    ['166GB bandwidth', '166GB 전송량', true],
    ['Email support', '이메일 지원', true],
  ], { storage: '104GB', bandwidth: '166GB/mo', transforms: '100K/mo' }, '스타트업', 1),

  // Sentry (2 tiers)
  t(S.sentry, 'developer', '개발자', '$0', '$0', [
    ['5K events/month', '월 5천 이벤트', true],
    ['1 project', '1개 프로젝트', true],
    ['Community support', '커뮤니티 지원', true],
  ], { events: '5K/mo', projects: '1', retention: '30 days' }, '개인 프로젝트', 0),

  t(S.sentry, 'team', '팀', '$26', '$312', [
    ['50K events/month', '월 5만 이벤트', true],
    ['Unlimited projects', '무제한 프로젝트', true],
    ['Email support', '이메일 지원', true],
  ], { events: '50K/mo', projects: 'Unlimited', retention: '90 days' }, '팀', 1),

  // PlanetScale (2 tiers)
  t(S.planetscale, 'hobby', '취미', '$0', '$0', [
    ['5GB storage', '5GB 스토리지', true],
    ['1B rows read/mo', '월 10억 행 읽기', true],
    ['Community support', '커뮤니티 지원', true],
  ], { storage: '5GB', reads: '1B/mo', writes: '10M/mo' }, '개인 프로젝트', 0),

  t(S.planetscale, 'scaler', '스케일러', '$29', '$348', [
    ['10GB storage', '10GB 스토리지', true],
    ['100B rows read/mo', '월 1000억 행 읽기', true],
    ['Email support', '이메일 지원', true],
  ], { storage: '10GB', reads: '100B/mo', writes: '50M/mo' }, '스타트업', 1),

  // Neon (2 tiers)
  t(S.neon, 'free', '무료', '$0', '$0', [
    ['3GB storage', '3GB 스토리지', true],
    ['1 project', '1개 프로젝트', true],
    ['Community support', '커뮤니티 지원', true],
  ], { storage: '3GB', compute: '100h/mo', projects: '1' }, '개인 프로젝트', 0),

  t(S.neon, 'pro', '프로', '$19', '$228', [
    ['Unlimited storage', '무제한 스토리지', true],
    ['Unlimited projects', '무제한 프로젝트', true],
    ['Email support', '이메일 지원', true],
  ], { storage: 'Unlimited', compute: 'Unlimited', projects: 'Unlimited' }, '스타트업', 1),

  // Railway (2 tiers)
  t(S.railway, 'trial', '트라이얼', '$0', '$0', [
    ['$5 credit', '$5 크레딧', true],
    ['512MB RAM', '512MB RAM', true],
    ['Community support', '커뮤니티 지원', true],
  ], { credit: '$5', memory: '512MB', cpu: 'Shared' }, '테스트용', 0),

  t(S.railway, 'pay_as_you_go', '사용량 기반', 'Pay per use', 'Pay per use', [
    ['Custom resources', '맞춤 리소스', true],
    ['Auto-scaling', '자동 확장', true],
    ['Email support', '이메일 지원', true],
  ], { credit: 'Pay per use', memory: 'Up to 32GB', cpu: 'Up to 32 vCPU' }, '모든 규모', 1),

  // Lemon Squeezy (2 tiers)
  t(S.lemonsqueezy, 'free', '무료', '$0', '$0', [
    ['5% + 50¢ per sale', '판매당 5% + 50¢', true],
    ['Basic features', '기본 기능', true],
    ['Email support', '이메일 지원', true],
  ], { fee: '5% + 50¢', products: 'Unlimited', subscriptions: 'Unlimited' }, '모든 규모', 0),

  t(S.lemonsqueezy, 'volume', '볼륨', 'Contact', 'Contact', [
    ['Lower fees', '낮은 수수료', true],
    ['Priority support', '우선 지원', true],
    ['Custom terms', '맞춤 조건', true],
  ], { fee: 'Custom', products: 'Unlimited', subscriptions: 'Unlimited' }, '대기업', 1),

  // UploadThing (2 tiers)
  t(S.uploadthing, 'free', '무료', '$0', '$0', [
    ['2GB storage', '2GB 스토리지', true],
    ['100 uploads/day', '일 100회 업로드', true],
    ['Community support', '커뮤니티 지원', true],
  ], { storage: '2GB', uploads: '100/day', bandwidth: '10GB/mo' }, '개인 프로젝트', 0),

  t(S.uploadthing, 'pro', '프로', '$10', '$120', [
    ['100GB storage', '100GB 스토리지', true],
    ['Unlimited uploads', '무제한 업로드', true],
    ['Email support', '이메일 지원', true],
  ], { storage: '100GB', uploads: 'Unlimited', bandwidth: '1TB/mo' }, '스타트업', 1),

  // PostHog (2 tiers)
  t(S.posthog, 'free', '무료', '$0', '$0', [
    ['1M events/month', '월 100만 이벤트', true],
    ['All features', '모든 기능', true],
    ['Community support', '커뮤니티 지원', true],
  ], { events: '1M/mo', retention: '7 days', sessions: 'Unlimited' }, '개인 프로젝트', 0),

  t(S.posthog, 'paid', '유료', 'Pay per use', 'Pay per use', [
    ['Unlimited events', '무제한 이벤트', true],
    ['Longer retention', '긴 보관 기간', true],
    ['Email support', '이메일 지원', true],
  ], { events: 'Pay per use', retention: '1 year', sessions: 'Unlimited' }, '스타트업', 1),

  // AWS S3 (2 tiers)
  t(S.awss3, 'free_tier', '프리 티어', '$0', '$0', [
    ['5GB storage', '5GB 스토리지', true],
    ['20K GET requests', '2만 GET 요청', true],
    ['12 months free', '12개월 무료', true],
  ], { storage: '5GB', gets: '20K/mo', puts: '2K/mo' }, '신규 사용자', 0),

  t(S.awss3, 'standard', '스탠다드', 'Pay per use', 'Pay per use', [
    ['Unlimited storage', '무제한 스토리지', true],
    ['Pay as you go', '사용량 기반', true],
    ['AWS support plans', 'AWS 지원 플랜', true],
  ], { storage: '$0.023/GB', gets: '$0.0004/1K', puts: '$0.005/1K' }, '모든 규모', 1),

  // GitHub Actions (2 tiers)
  t(S.github_actions, 'free', '무료', '$0', '$0', [
    ['2K minutes/month', '월 2천분', true],
    ['500MB storage', '500MB 스토리지', true],
    ['Public repos', '퍼블릭 저장소', true],
  ], { minutes: '2K/mo', storage: '500MB', concurrent: '20 jobs' }, '개인 프로젝트', 0),

  t(S.github_actions, 'pro', '프로', '$4', '$48', [
    ['3K minutes/month', '월 3천분', true],
    ['2GB storage', '2GB 스토리지', true],
    ['Private repos', '프라이빗 저장소', true],
  ], { minutes: '3K/mo', storage: '2GB', concurrent: '20 jobs' }, '전문가', 1),

  // Twilio (2 tiers)
  t(S.twilio, 'trial', '트라이얼', '$0', '$0', [
    ['$15 credit', '$15 크레딧', true],
    ['Test numbers', '테스트 번호', true],
    ['Basic features', '기본 기능', true],
  ], { credit: '$15', messages: 'Limited', calls: 'Limited' }, '테스트용', 0),

  t(S.twilio, 'pay_as_you_go', '사용량 기반', 'Pay per use', 'Pay per use', [
    ['All features', '모든 기능', true],
    ['Global coverage', '글로벌 커버리지', true],
    ['Email support', '이메일 지원', true],
  ], { credit: 'Pay per use', messages: '$0.0079/SMS', calls: '$0.0085/min' }, '모든 규모', 1),

  // OneSignal (2 tiers)
  t(S.onesignal, 'free', '무료', '$0', '$0', [
    ['Unlimited users', '무제한 사용자', true],
    ['Basic features', '기본 기능', true],
    ['Email support', '이메일 지원', true],
  ], { users: 'Unlimited', notifications: 'Unlimited', channels: 'All' }, '모든 규모', 0),

  t(S.onesignal, 'growth', '그로스', '$9', '$108', [
    ['Advanced features', '고급 기능', true],
    ['A/B testing', 'A/B 테스트', true],
    ['Priority support', '우선 지원', true],
  ], { users: 'Unlimited', notifications: 'Unlimited', channels: 'All + Advanced' }, '성장 기업', 1),

  // Algolia (2 tiers)
  t(S.algolia, 'free', '무료', '$0', '$0', [
    ['10K searches/month', '월 1만 검색', true],
    ['1M records', '100만 레코드', true],
    ['Community support', '커뮤니티 지원', true],
  ], { searches: '10K/mo', records: '1M', requests: '100K/mo' }, '개인 프로젝트', 0),

  t(S.algolia, 'grow', '그로우', '$0.50', 'Pay per use', [
    ['Pay per use', '사용량 기반', true],
    ['Unlimited records', '무제한 레코드', true],
    ['Email support', '이메일 지원', true],
  ], { searches: '$0.50/1K', records: 'Unlimited', requests: 'Unlimited' }, '스타트업', 1),

  // Sanity (2 tiers)
  t(S.sanity, 'free', '무료', '$0', '$0', [
    ['3 users', '3명 사용자', true],
    ['2 datasets', '2개 데이터셋', true],
    ['Community support', '커뮤니티 지원', true],
  ], { users: '3', datasets: '2', docs: '10K' }, '개인 프로젝트', 0),

  t(S.sanity, 'team', '팀', '$99', '$1188', [
    ['Unlimited users', '무제한 사용자', true],
    ['Unlimited datasets', '무제한 데이터셋', true],
    ['Email support', '이메일 지원', true],
  ], { users: 'Unlimited', datasets: 'Unlimited', docs: '1M' }, '팀', 1),

  // Google Analytics 4 (1 tier - free)
  t(S.ga4, 'free', '무료', '$0', '$0', [
    ['Unlimited events', '무제한 이벤트', true],
    ['All features', '모든 기능', true],
    ['Community support', '커뮤니티 지원', true],
  ], { events: 'Unlimited', properties: 'Unlimited', retention: '14 months' }, '모든 규모', 0),

  // Upstash Redis (2 tiers)
  t(S.upstash_redis, 'free', '무료', '$0', '$0', [
    ['10K commands/day', '일 1만 커맨드', true],
    ['256MB storage', '256MB 스토리지', true],
    ['Email support', '이메일 지원', true],
  ], { commands: '10K/day', storage: '256MB', databases: '1' }, '개인 프로젝트', 0),

  t(S.upstash_redis, 'pay_as_you_go', '사용량 기반', 'Pay per use', 'Pay per use', [
    ['Unlimited commands', '무제한 커맨드', true],
    ['Pay per use', '사용량 기반', true],
    ['Priority support', '우선 지원', true],
  ], { commands: '$0.2/100K', storage: '$0.25/GB', databases: 'Unlimited' }, '스타트업', 1),

  // Cloudflare (2 tiers)
  t(S.cloudflare, 'free', '무료', '$0', '$0', [
    ['Unlimited bandwidth', '무제한 전송량', true],
    ['Basic DDoS', '기본 DDoS', true],
    ['Community support', '커뮤니티 지원', true],
  ], { bandwidth: 'Unlimited', requests: 'Unlimited', ssl: 'Universal' }, '모든 규모', 0),

  t(S.cloudflare, 'pro', '프로', '$20', '$240', [
    ['Advanced DDoS', '고급 DDoS', true],
    ['WAF', 'WAF', true],
    ['Email support', '이메일 지원', true],
  ], { bandwidth: 'Unlimited', requests: 'Unlimited', ssl: 'Advanced' }, '비즈니스', 1),

  // Fly.io (2 tiers)
  t(S.flyio, 'free', '무료', '$0', '$0', [
    ['3 VMs', '3개 VM', true],
    ['160GB bandwidth', '160GB 전송량', true],
    ['Community support', '커뮤니티 지원', true],
  ], { vms: '3', bandwidth: '160GB/mo', storage: '3GB' }, '개인 프로젝트', 0),

  t(S.flyio, 'pay_as_you_go', '사용량 기반', 'Pay per use', 'Pay per use', [
    ['Unlimited VMs', '무제한 VM', true],
    ['Auto-scaling', '자동 확장', true],
    ['Email support', '이메일 지원', true],
  ], { vms: 'Pay per use', bandwidth: 'Pay per use', storage: 'Pay per use' }, '스타트업', 1),

  // Datadog (2 tiers)
  t(S.datadog, 'free', '무료', '$0', '$0', [
    ['5 hosts', '5개 호스트', true],
    ['1-day retention', '1일 보관', true],
    ['Community support', '커뮤니티 지원', true],
  ], { hosts: '5', retention: '1 day', metrics: 'Basic' }, '개인 프로젝트', 0),

  t(S.datadog, 'pro', '프로', '$15', '$180', [
    ['Unlimited hosts', '무제한 호스트', true],
    ['15-month retention', '15개월 보관', true],
    ['Email support', '이메일 지원', true],
  ], { hosts: 'Unlimited', retention: '15 months', metrics: 'Advanced' }, '팀', 1),

  // Mixpanel (2 tiers)
  t(S.mixpanel, 'free', '무료', '$0', '$0', [
    ['100K events/month', '월 10만 이벤트', true],
    ['90-day retention', '90일 보관', true],
    ['Email support', '이메일 지원', true],
  ], { events: '100K/mo', retention: '90 days', users: 'Unlimited' }, '개인 프로젝트', 0),

  t(S.mixpanel, 'growth', '그로스', '$25', '$300', [
    ['1M events/month', '월 100만 이벤트', true],
    ['1-year retention', '1년 보관', true],
    ['Priority support', '우선 지원', true],
  ], { events: '1M/mo', retention: '1 year', users: 'Unlimited' }, '스타트업', 1),

  // Contentful (2 tiers)
  t(S.contentful, 'free', '무료', '$0', '$0', [
    ['2 users', '2명 사용자', true],
    ['25K records', '2.5만 레코드', true],
    ['Community support', '커뮤니티 지원', true],
  ], { users: '2', records: '25K', locales: '2' }, '개인 프로젝트', 0),

  t(S.contentful, 'team', '팀', '$489', '$5868', [
    ['5 users', '5명 사용자', true],
    ['75K records', '7.5만 레코드', true],
    ['Email support', '이메일 지원', true],
  ], { users: '5', records: '75K', locales: 'Unlimited' }, '팀', 1),

  // Meilisearch (1 tier - OSS)
  t(S.meilisearch, 'free', '무료', '$0', '$0', [
    ['Self-hosted', '셀프 호스팅', true],
    ['Open source', '오픈 소스', true],
    ['Community support', '커뮤니티 지원', true],
  ], { docs: 'Unlimited', searches: 'Unlimited', cost: 'Infrastructure only' }, '모든 규모', 0),

  // Pusher (2 tiers)
  t(S.pusher, 'free', '무료', '$0', '$0', [
    ['100 connections', '100 연결', true],
    ['200K messages/day', '일 20만 메시지', true],
    ['Community support', '커뮤니티 지원', true],
  ], { connections: '100', messages: '200K/day', channels: 'Unlimited' }, '개인 프로젝트', 0),

  t(S.pusher, 'startup', '스타트업', '$49', '$588', [
    ['500 connections', '500 연결', true],
    ['Unlimited messages', '무제한 메시지', true],
    ['Email support', '이메일 지원', true],
  ], { connections: '500', messages: 'Unlimited', channels: 'Unlimited' }, '스타트업', 1),

  // Trigger.dev (2 tiers)
  t(S.trigger_dev, 'free', '무료', '$0', '$0', [
    ['100K runs/month', '월 10만 실행', true],
    ['Community support', '커뮤니티 지원', true],
    ['Basic features', '기본 기능', true],
  ], { runs: '100K/mo', concurrency: '10', retention: '30 days' }, '개인 프로젝트', 0),

  t(S.trigger_dev, 'pro', '프로', '$20', '$240', [
    ['1M runs/month', '월 100만 실행', true],
    ['Email support', '이메일 지원', true],
    ['Advanced features', '고급 기능', true],
  ], { runs: '1M/mo', concurrency: '100', retention: '90 days' }, '스타트업', 1),

  // LaunchDarkly (2 tiers)
  t(S.launchdarkly, 'starter', '스타터', '$10', '$120', [
    ['1K MAU', '월 1천 사용자', true],
    ['10 projects', '10개 프로젝트', true],
    ['Email support', '이메일 지원', true],
  ], { mau: '1K', projects: '10', flags: 'Unlimited' }, '스타트업', 0),

  t(S.launchdarkly, 'pro', '프로', '$20', '$240', [
    ['10K MAU', '월 1만 사용자', true],
    ['Unlimited projects', '무제한 프로젝트', true],
    ['Priority support', '우선 지원', true],
  ], { mau: '10K', projects: 'Unlimited', flags: 'Unlimited' }, '성장 기업', 1),

  // Groq (2 tiers)
  t(S.groq, 'free', '무료', '$0', '$0', [
    ['14.4K requests/day', '일 1.44만 요청', true],
    ['All models', '모든 모델', true],
    ['Community support', '커뮤니티 지원', true],
  ], { requests: '14.4K/day', tokens: '400M/mo', rate: 'Standard' }, '개인 프로젝트', 0),

  t(S.groq, 'pay_as_you_go', '사용량 기반', 'Pay per use', 'Pay per use', [
    ['Unlimited requests', '무제한 요청', true],
    ['Higher rate limits', '높은 속도 제한', true],
    ['Email support', '이메일 지원', true],
  ], { requests: 'Unlimited', tokens: 'Pay per use', rate: 'Higher' }, '스타트업', 1),

  // Render (2 tiers)
  t(S.render, 'free', '무료', '$0', '$0', [
    ['750h compute/month', '월 750시간', true],
    ['Basic features', '기본 기능', true],
    ['Community support', '커뮤니티 지원', true],
  ], { compute: '750h/mo', bandwidth: '100GB', services: 'Unlimited' }, '개인 프로젝트', 0),

  t(S.render, 'starter', '스타터', '$7', '$84', [
    ['Always-on', '상시 가동', true],
    ['Unlimited bandwidth', '무제한 전송량', true],
    ['Email support', '이메일 지원', true],
  ], { compute: 'Always-on', bandwidth: 'Unlimited', services: 'Unlimited' }, '스타트업', 1),

  // LogRocket (2 tiers)
  t(S.logrocket, 'free', '무료', '$0', '$0', [
    ['1K sessions/month', '월 1천 세션', true],
    ['30-day retention', '30일 보관', true],
    ['Community support', '커뮤니티 지원', true],
  ], { sessions: '1K/mo', retention: '30 days', seats: '3' }, '개인 프로젝트', 0),

  t(S.logrocket, 'team', '팀', '$99', '$1188', [
    ['10K sessions/month', '월 1만 세션', true],
    ['1-year retention', '1년 보관', true],
    ['Email support', '이메일 지원', true],
  ], { sessions: '10K/mo', retention: '1 year', seats: '10' }, '팀', 1),

  // Playwright (1 tier - OSS)
  t(S.playwright, 'free', '무료', '$0', '$0', [
    ['Self-hosted', '셀프 호스팅', true],
    ['Open source', '오픈 소스', true],
    ['Community support', '커뮤니티 지원', true],
  ], { tests: 'Unlimited', browsers: 'All', cost: 'Free' }, '모든 규모', 0),

  // Slack API (2 tiers)
  t(S.slack_api, 'free', '무료', '$0', '$0', [
    ['10K messages', '1만 메시지', true],
    ['10 integrations', '10개 통합', true],
    ['Community support', '커뮤니티 지원', true],
  ], { messages: '10K history', integrations: '10', storage: '5GB' }, '개인 프로젝트', 0),

  t(S.slack_api, 'pro', '프로', '$7.25', '$87', [
    ['Unlimited messages', '무제한 메시지', true],
    ['Unlimited integrations', '무제한 통합', true],
    ['Priority support', '우선 지원', true],
  ], { messages: 'Unlimited', integrations: 'Unlimited', storage: 'Unlimited' }, '팀', 1),

  // Discord API (1 tier - free)
  t(S.discord_api, 'free', '무료', '$0', '$0', [
    ['Free API access', '무료 API', true],
    ['Rate limits', '속도 제한', true],
    ['Community support', '커뮤니티 지원', true],
  ], { requests: 'Rate limited', webhooks: 'Unlimited', bots: 'Unlimited' }, '모든 규모', 0),

  // Mapbox (2 tiers)
  t(S.mapbox, 'free', '무료', '$0', '$0', [
    ['50K loads/month', '월 5만 로드', true],
    ['Basic maps', '기본 지도', true],
    ['Community support', '커뮤니티 지원', true],
  ], { loads: '50K/mo', requests: '100K/mo', storage: '50MB' }, '개인 프로젝트', 0),

  t(S.mapbox, 'pay_as_you_go', '사용량 기반', 'Pay per use', 'Pay per use', [
    ['Unlimited loads', '무제한 로드', true],
    ['All features', '모든 기능', true],
    ['Email support', '이메일 지원', true],
  ], { loads: '$5/1K', requests: 'Pay per use', storage: 'Pay per use' }, '스타트업', 1),

  // ElevenLabs (2 tiers)
  t(S.elevenlabs, 'free', '무료', '$0', '$0', [
    ['10K characters/month', '월 1만 글자', true],
    ['3 voices', '3개 음성', true],
    ['Community support', '커뮤니티 지원', true],
  ], { characters: '10K/mo', voices: '3', quality: 'Standard' }, '개인 프로젝트', 0),

  t(S.elevenlabs, 'starter', '스타터', '$5', '$60', [
    ['30K characters/month', '월 3만 글자', true],
    ['10 voices', '10개 음성', true],
    ['Email support', '이메일 지원', true],
  ], { characters: '30K/mo', voices: '10', quality: 'High' }, '크리에이터', 1),

  // Inngest (2 tiers)
  t(S.inngest, 'free', '무료', '$0', '$0', [
    ['25K runs/month', '월 2.5만 실행', true],
    ['Community support', '커뮤니티 지원', true],
    ['Basic features', '기본 기능', true],
  ], { runs: '25K/mo', concurrency: '10', retention: '7 days' }, '개인 프로젝트', 0),

  t(S.inngest, 'pro', '프로', '$20', '$240', [
    ['500K runs/month', '월 50만 실행', true],
    ['Email support', '이메일 지원', true],
    ['Advanced features', '고급 기능', true],
  ], { runs: '500K/mo', concurrency: '50', retention: '30 days' }, '스타트업', 1),

  // Strapi (1 tier - OSS)
  t(S.strapi, 'free', '무료', '$0', '$0', [
    ['Self-hosted', '셀프 호스팅', true],
    ['Open source', '오픈 소스', true],
    ['Community support', '커뮤니티 지원', true],
  ], { users: 'Unlimited', content: 'Unlimited', cost: 'Infrastructure only' }, '모든 규모', 0),

  // Plausible (2 tiers)
  t(S.plausible, 'growth', '그로스', '$9', '$108', [
    ['10K pageviews/month', '월 1만 페이지뷰', true],
    ['Privacy-focused', '프라이버시 중심', true],
    ['Email support', '이메일 지원', true],
  ], { pageviews: '10K/mo', sites: '50', retention: 'Forever' }, '개인 프로젝트', 0),

  t(S.plausible, 'business', '비즈니스', '$19', '$228', [
    ['100K pageviews/month', '월 10만 페이지뷰', true],
    ['Priority support', '우선 지원', true],
    ['All features', '모든 기능', true],
  ], { pageviews: '100K/mo', sites: 'Unlimited', retention: 'Forever' }, '비즈니스', 1),

  // Cypress (1 tier - OSS)
  t(S.cypress, 'free', '무료', '$0', '$0', [
    ['Self-hosted', '셀프 호스팅', true],
    ['Open source', '오픈 소스', true],
    ['Community support', '커뮤니티 지원', true],
  ], { tests: 'Unlimited', browsers: 'All', cost: 'Free' }, '모든 규모', 0),

  // BullMQ (1 tier - OSS)
  t(S.bullmq, 'free', '무료', '$0', '$0', [
    ['Self-hosted', '셀프 호스팅', true],
    ['Open source', '오픈 소스', true],
    ['Community support', '커뮤니티 지원', true],
  ], { jobs: 'Unlimited', queues: 'Unlimited', cost: 'Redis hosting only' }, '모든 규모', 0),

  // Shopify API (2 tiers)
  t(S.shopify_api, 'basic', '베이직', '$39', '$468', [
    ['API access', 'API 액세스', true],
    ['2 staff accounts', '2명 직원', true],
    ['Email support', '이메일 지원', true],
  ], { requests: 'Rate limited', apps: 'Unlimited', orders: 'Unlimited' }, '소규모 상점', 0),

  t(S.shopify_api, 'shopify', '쇼피파이', '$105', '$1260', [
    ['Higher rate limits', '높은 속도 제한', true],
    ['5 staff accounts', '5명 직원', true],
    ['Priority support', '우선 지원', true],
  ], { requests: 'Higher limits', apps: 'Unlimited', orders: 'Unlimited' }, '성장 상점', 1),
];

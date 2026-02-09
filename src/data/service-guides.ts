export interface ServiceGuideSeed {
  service_id: string;
  quick_start: string;
  quick_start_en: string;
  setup_steps: {
    step: number;
    title: string;
    title_ko: string;
    description: string;
    description_ko: string;
    code_snippet?: string
  }[];
  code_examples: Record<string, string>;
  common_pitfalls: {
    title: string;
    title_ko: string;
    problem: string;
    solution: string;
    code?: string
  }[];
  integration_tips: {
    with_service_slug: string;
    tip: string;
    tip_ko: string;
    code?: string
  }[];
  pros: { text: string; text_ko: string }[];
  cons: { text: string; text_ko: string }[];
}

// Service ID constants
const S = {
  supabase: '10000000-0000-4000-a000-000000000001',
  firebase: '10000000-0000-4000-a000-000000000002',
  vercel: '10000000-0000-4000-a000-000000000003',
  stripe: '10000000-0000-4000-a000-000000000005',
  clerk: '10000000-0000-4000-a000-000000000006',
  resend: '10000000-0000-4000-a000-000000000008',
  openai: '10000000-0000-4000-a000-000000000010',
  sentry: '10000000-0000-4000-a000-000000000013',
  neon: '10000000-0000-4000-a000-000000000015',
  posthog: '10000000-0000-4000-a000-000000000019',
};

export const serviceGuides: ServiceGuideSeed[] = [
  {
    service_id: S.supabase,
    quick_start: 'Supabase 프로젝트를 생성하고 Next.js 앱과 연결하여 인증, 데이터베이스, 스토리지를 즉시 사용할 수 있습니다.',
    quick_start_en: 'Create a Supabase project and connect it to your Next.js app to instantly use authentication, database, and storage.',
    setup_steps: [
      {
        step: 1,
        title: 'Install Supabase client',
        title_ko: 'Supabase 클라이언트 설치',
        description: 'Install the Supabase JavaScript client library',
        description_ko: 'Supabase JS 클라이언트 라이브러리 설치',
        code_snippet: 'npm install @supabase/supabase-js'
      },
      {
        step: 2,
        title: 'Initialize client',
        title_ko: '클라이언트 초기화',
        description: 'Create a Supabase client with your project URL and anon key',
        description_ko: '프로젝트 URL과 anon key로 클라이언트 생성',
        code_snippet: `import { createClient } from '@supabase/supabase-js'
const supabase = createClient(URL, ANON_KEY)`
      },
      {
        step: 3,
        title: 'Use auth & database',
        title_ko: '인증 및 DB 사용',
        description: 'Start using authentication and database queries',
        description_ko: '인증 및 데이터베이스 쿼리 시작',
        code_snippet: `const { data } = await supabase.from('table').select()`
      }
    ],
    code_examples: {
      typescript: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Auth
await supabase.auth.signInWithOAuth({ provider: 'google' })

// Database
const { data } = await supabase.from('users').select('*')`
    },
    common_pitfalls: [
      {
        title: 'RLS not enabled',
        title_ko: 'RLS 미설정',
        problem: 'Tables are accessible without authentication',
        solution: 'Enable Row Level Security and create policies',
        code: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own" ON users FOR SELECT USING (auth.uid() = id);`
      },
      {
        title: 'Server/Client confusion',
        title_ko: '서버/클라이언트 혼용',
        problem: 'Using wrong client in server components',
        solution: 'Use createServerClient for server, createBrowserClient for client'
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'vercel',
        tip: 'Use Vercel integration to auto-sync environment variables',
        tip_ko: 'Vercel 통합으로 환경변수 자동 동기화',
      }
    ],
    pros: [
      { text: 'All-in-one backend (Auth, DB, Storage, Realtime)', text_ko: '올인원 백엔드 (인증, DB, 스토리지, 실시간)' },
      { text: 'PostgreSQL with automatic REST APIs', text_ko: 'PostgreSQL + 자동 REST API 생성' },
      { text: 'Generous free tier', text_ko: '넉넉한 무료 플랜' }
    ],
    cons: [
      { text: 'Learning curve for RLS policies', text_ko: 'RLS 정책 학습 곡선' },
      { text: 'Cold starts on free tier', text_ko: '무료 플랜 콜드 스타트' }
    ]
  },
  {
    service_id: S.firebase,
    quick_start: 'Firebase 프로젝트를 생성하고 웹앱을 등록하여 인증, Firestore, 클라우드 함수를 즉시 사용할 수 있습니다.',
    quick_start_en: 'Create a Firebase project and register your web app to instantly use Auth, Firestore, and Cloud Functions.',
    setup_steps: [
      {
        step: 1,
        title: 'Install Firebase SDK',
        title_ko: 'Firebase SDK 설치',
        description: 'Install the Firebase JavaScript SDK',
        description_ko: 'Firebase JS SDK 설치',
        code_snippet: 'npm install firebase'
      },
      {
        step: 2,
        title: 'Initialize Firebase',
        title_ko: 'Firebase 초기화',
        description: 'Initialize Firebase with your config object',
        description_ko: 'config 객체로 Firebase 초기화',
        code_snippet: `import { initializeApp } from 'firebase/app'
const app = initializeApp(firebaseConfig)`
      }
    ],
    code_examples: {
      typescript: `import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Auth
await signInWithPopup(auth, new GoogleAuthProvider())

// Firestore
const snap = await getDocs(collection(db, 'users'))`
    },
    common_pitfalls: [
      {
        title: 'Security rules not set',
        title_ko: '보안 규칙 미설정',
        problem: 'Firestore/Storage accessible to all users',
        solution: 'Configure Firestore security rules in Firebase Console',
        code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'vercel',
        tip: 'Use environment variables for Firebase config, deploy Cloud Functions separately',
        tip_ko: '환경변수로 Firebase 설정 관리, Cloud Functions는 별도 배포',
      }
    ],
    pros: [
      { text: 'Real-time database and NoSQL flexibility', text_ko: '실시간 DB와 NoSQL 유연성' },
      { text: 'Extensive mobile SDK support', text_ko: '모바일 SDK 풍부' },
      { text: 'Google Cloud integration', text_ko: 'Google Cloud 통합' }
    ],
    cons: [
      { text: 'Complex pricing for high usage', text_ko: '높은 사용량 시 복잡한 가격' },
      { text: 'Vendor lock-in with Google', text_ko: 'Google 종속성' }
    ]
  },
  {
    service_id: S.vercel,
    quick_start: 'Vercel CLI로 Next.js 프로젝트를 배포하고 자동으로 CI/CD, 프리뷰, 도메인을 설정할 수 있습니다.',
    quick_start_en: 'Deploy your Next.js project with Vercel CLI and automatically set up CI/CD, previews, and domains.',
    setup_steps: [
      {
        step: 1,
        title: 'Install Vercel CLI',
        title_ko: 'Vercel CLI 설치',
        description: 'Install the Vercel command-line interface',
        description_ko: 'Vercel CLI 설치',
        code_snippet: 'npm i -g vercel'
      },
      {
        step: 2,
        title: 'Deploy project',
        title_ko: '프로젝트 배포',
        description: 'Run vercel in your project directory',
        description_ko: '프로젝트 디렉토리에서 vercel 실행',
        code_snippet: 'vercel'
      }
    ],
    code_examples: {
      typescript: `// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "DATABASE_URL": "@database-url"
  }
}`
    },
    common_pitfalls: [
      {
        title: 'Environment variable mismatch',
        title_ko: '환경변수 불일치',
        problem: 'Local env vars not synced to Vercel',
        solution: 'Use vercel env pull or add vars in Vercel dashboard'
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'supabase',
        tip: 'Use Vercel-Supabase integration for automatic env var sync',
        tip_ko: 'Vercel-Supabase 통합으로 환경변수 자동 동기화',
      }
    ],
    pros: [
      { text: 'Zero-config Next.js deployment', text_ko: 'Next.js 무설정 배포' },
      { text: 'Automatic preview deployments for PRs', text_ko: 'PR별 자동 프리뷰 배포' },
      { text: 'Global CDN and edge functions', text_ko: '글로벌 CDN 및 엣지 함수' }
    ],
    cons: [
      { text: 'Expensive for high bandwidth', text_ko: '높은 대역폭 사용 시 비쌈' },
      { text: 'Limited to 10s serverless timeout on Hobby', text_ko: 'Hobby 플랜 10초 타임아웃' }
    ]
  },
  {
    service_id: S.stripe,
    quick_start: 'Stripe 계정을 생성하고 API 키를 발급받아 결제, 구독, 인보이스를 처리할 수 있습니다.',
    quick_start_en: 'Create a Stripe account and get API keys to handle payments, subscriptions, and invoices.',
    setup_steps: [
      {
        step: 1,
        title: 'Install Stripe SDK',
        title_ko: 'Stripe SDK 설치',
        description: 'Install the Stripe Node library',
        description_ko: 'Stripe Node 라이브러리 설치',
        code_snippet: 'npm install stripe'
      },
      {
        step: 2,
        title: 'Initialize Stripe',
        title_ko: 'Stripe 초기화',
        description: 'Create a Stripe instance with your secret key',
        description_ko: 'Secret key로 Stripe 인스턴스 생성',
        code_snippet: `import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)`
      },
      {
        step: 3,
        title: 'Create checkout session',
        title_ko: '결제 세션 생성',
        description: 'Create a checkout session for payment',
        description_ko: '결제를 위한 체크아웃 세션 생성',
        code_snippet: `const session = await stripe.checkout.sessions.create({
  line_items: [{ price: 'price_xxx', quantity: 1 }],
  mode: 'payment'
})`
      }
    ],
    code_examples: {
      typescript: `import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create checkout session
const session = await stripe.checkout.sessions.create({
  line_items: [{ price: 'price_1234', quantity: 1 }],
  mode: 'subscription',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel'
})`
    },
    common_pitfalls: [
      {
        title: 'Webhook signature not verified',
        title_ko: '웹훅 서명 미검증',
        problem: 'Accepting unverified webhook events',
        solution: 'Always verify webhook signatures using stripe.webhooks.constructEvent',
        code: `const event = stripe.webhooks.constructEvent(
  body, signature, webhookSecret
)`
      },
      {
        title: 'Test mode in production',
        title_ko: '프로덕션에서 테스트 모드',
        problem: 'Using test keys in production',
        solution: 'Use live keys in production environment variables'
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'clerk',
        tip: 'Sync Stripe customer ID to Clerk user metadata for unified user management',
        tip_ko: 'Stripe 고객 ID를 Clerk 사용자 메타데이터에 동기화',
      }
    ],
    pros: [
      { text: 'Comprehensive payment APIs and webhooks', text_ko: '포괄적인 결제 API 및 웹훅' },
      { text: 'Built-in fraud detection', text_ko: '내장 사기 탐지' },
      { text: 'Excellent documentation', text_ko: '훌륭한 문서화' }
    ],
    cons: [
      { text: 'Complex for simple use cases', text_ko: '간단한 사용 사례에는 복잡함' },
      { text: 'Transaction fees add up', text_ko: '거래 수수료 누적' }
    ]
  },
  {
    service_id: S.clerk,
    quick_start: 'Clerk 앱을 생성하고 publishable key를 발급받아 Next.js에 인증을 추가할 수 있습니다.',
    quick_start_en: 'Create a Clerk app and get publishable keys to add authentication to your Next.js app.',
    setup_steps: [
      {
        step: 1,
        title: 'Install Clerk Next.js',
        title_ko: 'Clerk Next.js 설치',
        description: 'Install the Clerk Next.js SDK',
        description_ko: 'Clerk Next.js SDK 설치',
        code_snippet: 'npm install @clerk/nextjs'
      },
      {
        step: 2,
        title: 'Add ClerkProvider',
        title_ko: 'ClerkProvider 추가',
        description: 'Wrap your app with ClerkProvider in the root layout',
        description_ko: '루트 레이아웃에 ClerkProvider 래핑',
        code_snippet: `import { ClerkProvider } from '@clerk/nextjs'
export default function RootLayout({ children }) {
  return <ClerkProvider>{children}</ClerkProvider>
}`
      }
    ],
    code_examples: {
      typescript: `import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <SignedOut><SignInButton /></SignedOut>
      <SignedIn><UserButton /></SignedIn>
      {children}
    </ClerkProvider>
  )
}`
    },
    common_pitfalls: [
      {
        title: 'Missing middleware',
        title_ko: 'middleware 누락',
        problem: 'Protected routes are accessible without auth',
        solution: 'Create middleware.ts with clerkMiddleware',
        code: `import { clerkMiddleware } from '@clerk/nextjs/server'
export default clerkMiddleware()
export const config = { matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'] }`
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'stripe',
        tip: 'Store Stripe customer ID in Clerk user metadata for seamless billing',
        tip_ko: 'Clerk 사용자 메타데이터에 Stripe 고객 ID 저장',
      }
    ],
    pros: [
      { text: 'Pre-built UI components for auth', text_ko: '인증용 사전 빌드 UI 컴포넌트' },
      { text: 'Multi-factor authentication out of the box', text_ko: '기본 제공 MFA' },
      { text: 'User management dashboard', text_ko: '사용자 관리 대시보드' }
    ],
    cons: [
      { text: 'Paid plans for production features', text_ko: '프로덕션 기능 유료' },
      { text: 'Limited customization on free tier', text_ko: '무료 플랜 커스터마이징 제한' }
    ]
  },
  {
    service_id: S.openai,
    quick_start: 'OpenAI API 키를 발급받아 GPT 모델, 임베딩, 이미지 생성을 즉시 사용할 수 있습니다.',
    quick_start_en: 'Get an OpenAI API key to instantly use GPT models, embeddings, and image generation.',
    setup_steps: [
      {
        step: 1,
        title: 'Install OpenAI SDK',
        title_ko: 'OpenAI SDK 설치',
        description: 'Install the official OpenAI Node SDK',
        description_ko: '공식 OpenAI Node SDK 설치',
        code_snippet: 'npm install openai'
      },
      {
        step: 2,
        title: 'Initialize client',
        title_ko: '클라이언트 초기화',
        description: 'Create an OpenAI client with your API key',
        description_ko: 'API 키로 OpenAI 클라이언트 생성',
        code_snippet: `import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`
      }
    ],
    code_examples: {
      typescript: `import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Chat completion
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [{ role: 'user', content: 'Hello!' }]
})

console.log(completion.choices[0].message.content)`
    },
    common_pitfalls: [
      {
        title: 'Not handling rate limits',
        title_ko: '속도 제한 미처리',
        problem: 'API calls fail with 429 errors',
        solution: 'Implement exponential backoff and respect rate limit headers'
      },
      {
        title: 'Streaming not used',
        title_ko: '스트리밍 미사용',
        problem: 'Long wait times for responses',
        solution: 'Use stream: true for real-time token streaming',
        code: `const stream = await openai.chat.completions.create({
  model: 'gpt-4', messages, stream: true
})`
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'vercel',
        tip: 'Use Vercel AI SDK for easy streaming and React hooks',
        tip_ko: 'Vercel AI SDK로 스트리밍 및 React 훅 간편 사용',
        code: `import { OpenAIStream, StreamingTextResponse } from 'ai'
const stream = OpenAIStream(response)
return new StreamingTextResponse(stream)`
      }
    ],
    pros: [
      { text: 'State-of-the-art language models', text_ko: '최첨단 언어 모델' },
      { text: 'Simple and well-documented API', text_ko: '간단하고 잘 문서화된 API' },
      { text: 'Function calling and structured outputs', text_ko: '함수 호출 및 구조화된 출력' }
    ],
    cons: [
      { text: 'Can be expensive at scale', text_ko: '대규모 사용 시 비용 부담' },
      { text: 'Rate limits on lower tiers', text_ko: '낮은 티어 속도 제한' }
    ]
  },
  {
    service_id: S.sentry,
    quick_start: 'Sentry 프로젝트를 생성하고 DSN을 발급받아 에러 모니터링과 성능 추적을 시작할 수 있습니다.',
    quick_start_en: 'Create a Sentry project and get a DSN to start error monitoring and performance tracking.',
    setup_steps: [
      {
        step: 1,
        title: 'Install Sentry SDK',
        title_ko: 'Sentry SDK 설치',
        description: 'Install the Sentry Next.js SDK',
        description_ko: 'Sentry Next.js SDK 설치',
        code_snippet: 'npx @sentry/wizard@latest -i nextjs'
      },
      {
        step: 2,
        title: 'Configure Sentry',
        title_ko: 'Sentry 설정',
        description: 'The wizard creates sentry config files automatically',
        description_ko: '위자드가 자동으로 설정 파일 생성',
        code_snippet: `// sentry.client.config.ts
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN })`
      }
    ],
    code_examples: {
      typescript: `import * as Sentry from '@sentry/nextjs'

// Capture exception
Sentry.captureException(new Error('Something went wrong'))

// Add context
Sentry.setUser({ id: '123', email: 'user@example.com' })

// Performance monitoring
const transaction = Sentry.startTransaction({ name: 'API Call' })
// ... do work
transaction.finish()`
    },
    common_pitfalls: [
      {
        title: 'Source maps not uploaded',
        title_ko: '소스맵 미업로드',
        problem: 'Stack traces show minified code',
        solution: 'Enable source map upload in next.config.js',
        code: `module.exports = {
  sentry: { hideSourceMaps: false }
}`
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'vercel',
        tip: 'Use Vercel-Sentry integration for automatic source map uploads',
        tip_ko: 'Vercel-Sentry 통합으로 소스맵 자동 업로드',
      }
    ],
    pros: [
      { text: 'Real-time error tracking and alerts', text_ko: '실시간 에러 추적 및 알림' },
      { text: 'Performance monitoring included', text_ko: '성능 모니터링 포함' },
      { text: 'Rich context and breadcrumbs', text_ko: '풍부한 컨텍스트 및 breadcrumb' }
    ],
    cons: [
      { text: 'Can be overwhelming with many errors', text_ko: '많은 에러 시 압도적' },
      { text: 'Paid plans for team features', text_ko: '팀 기능 유료' }
    ]
  },
  {
    service_id: S.neon,
    quick_start: 'Neon 프로젝트를 생성하고 연결 문자열을 발급받아 서버리스 PostgreSQL을 즉시 사용할 수 있습니다.',
    quick_start_en: 'Create a Neon project and get a connection string to instantly use serverless PostgreSQL.',
    setup_steps: [
      {
        step: 1,
        title: 'Create Neon project',
        title_ko: 'Neon 프로젝트 생성',
        description: 'Create a project in Neon console and copy connection string',
        description_ko: 'Neon 콘솔에서 프로젝트 생성 후 연결 문자열 복사',
      },
      {
        step: 2,
        title: 'Install Postgres client',
        title_ko: 'Postgres 클라이언트 설치',
        description: 'Install a PostgreSQL client like @neondatabase/serverless',
        description_ko: '@neondatabase/serverless 같은 클라이언트 설치',
        code_snippet: 'npm install @neondatabase/serverless'
      },
      {
        step: 3,
        title: 'Connect to database',
        title_ko: '데이터베이스 연결',
        description: 'Use the connection string to connect',
        description_ko: '연결 문자열로 연결',
        code_snippet: `import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL!)
const result = await sql\`SELECT * FROM users\``
      }
    ],
    code_examples: {
      typescript: `import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Query
const users = await sql\`SELECT * FROM users WHERE id = \${userId}\`

// Transaction
const result = await sql.transaction([
  sql\`INSERT INTO users (name) VALUES ('John')\`,
  sql\`UPDATE accounts SET balance = balance - 100\`
])`
    },
    common_pitfalls: [
      {
        title: 'Connection pooling not configured',
        title_ko: '커넥션 풀링 미설정',
        problem: 'Too many connections in serverless',
        solution: 'Use Neon serverless driver or connection pooling',
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'vercel',
        tip: 'Use Vercel-Neon integration for automatic connection string setup',
        tip_ko: 'Vercel-Neon 통합으로 연결 문자열 자동 설정',
      }
    ],
    pros: [
      { text: 'Serverless PostgreSQL with auto-scaling', text_ko: '오토스케일링 서버리스 PostgreSQL' },
      { text: 'Branching for development environments', text_ko: '개발 환경용 브랜칭' },
      { text: 'Generous free tier', text_ko: '넉넉한 무료 플랜' }
    ],
    cons: [
      { text: 'Cold starts on free tier', text_ko: '무료 플랜 콜드 스타트' },
      { text: 'Limited to PostgreSQL', text_ko: 'PostgreSQL로 제한' }
    ]
  },
  {
    service_id: S.resend,
    quick_start: 'Resend 계정을 생성하고 API 키를 발급받아 트랜잭셔널 이메일을 전송할 수 있습니다.',
    quick_start_en: 'Create a Resend account and get an API key to send transactional emails.',
    setup_steps: [
      {
        step: 1,
        title: 'Install Resend SDK',
        title_ko: 'Resend SDK 설치',
        description: 'Install the Resend Node SDK',
        description_ko: 'Resend Node SDK 설치',
        code_snippet: 'npm install resend'
      },
      {
        step: 2,
        title: 'Send email',
        title_ko: '이메일 전송',
        description: 'Initialize Resend and send an email',
        description_ko: 'Resend 초기화 후 이메일 전송',
        code_snippet: `import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({ from, to, subject, html })`
      }
    ],
    code_examples: {
      typescript: `import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY!)

await resend.emails.send({
  from: 'onboarding@example.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Thanks for signing up!</p>'
})`
    },
    common_pitfalls: [
      {
        title: 'Domain not verified',
        title_ko: '도메인 미인증',
        problem: 'Emails fail to send from custom domain',
        solution: 'Verify your domain in Resend dashboard with DNS records'
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'clerk',
        tip: 'Use Resend with Clerk webhooks to send custom onboarding emails',
        tip_ko: 'Clerk 웹훅과 Resend로 커스텀 온보딩 이메일 전송',
      }
    ],
    pros: [
      { text: 'Simple API for transactional emails', text_ko: '트랜잭셔널 이메일용 간단한 API' },
      { text: 'React email template support', text_ko: 'React 이메일 템플릿 지원' },
      { text: 'Affordable pricing', text_ko: '합리적인 가격' }
    ],
    cons: [
      { text: 'Limited analytics compared to SendGrid', text_ko: 'SendGrid 대비 제한적 분석' },
      { text: 'Newer service with smaller ecosystem', text_ko: '신생 서비스로 작은 생태계' }
    ]
  },
  {
    service_id: S.posthog,
    quick_start: 'PostHog 프로젝트를 생성하고 API 키를 발급받아 제품 분석, A/B 테스트, 세션 리플레이를 시작할 수 있습니다.',
    quick_start_en: 'Create a PostHog project and get an API key to start product analytics, A/B testing, and session replays.',
    setup_steps: [
      {
        step: 1,
        title: 'Install PostHog',
        title_ko: 'PostHog 설치',
        description: 'Install the PostHog JavaScript library',
        description_ko: 'PostHog JS 라이브러리 설치',
        code_snippet: 'npm install posthog-js'
      },
      {
        step: 2,
        title: 'Initialize PostHog',
        title_ko: 'PostHog 초기화',
        description: 'Initialize PostHog with your project API key',
        description_ko: '프로젝트 API 키로 PostHog 초기화',
        code_snippet: `import posthog from 'posthog-js'
posthog.init(apiKey, { api_host: 'https://app.posthog.com' })`
      }
    ],
    code_examples: {
      typescript: `import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: 'https://app.posthog.com'
})

// Track event
posthog.capture('button_clicked', { button_id: 'signup' })

// Identify user
posthog.identify('user_123', { email: 'user@example.com' })`
    },
    common_pitfalls: [
      {
        title: 'Client-side only tracking',
        title_ko: '클라이언트 전용 추적',
        problem: 'Server-side events not tracked',
        solution: 'Use posthog-node for server-side tracking',
        code: `import { PostHog } from 'posthog-node'
const client = new PostHog(apiKey)
client.capture({ distinctId: 'user', event: 'server_event' })`
      }
    ],
    integration_tips: [
      {
        with_service_slug: 'clerk',
        tip: 'Sync Clerk user ID to PostHog for unified user tracking',
        tip_ko: 'Clerk 사용자 ID를 PostHog에 동기화',
      }
    ],
    pros: [
      { text: 'All-in-one product analytics platform', text_ko: '올인원 제품 분석 플랫폼' },
      { text: 'Session replay and feature flags', text_ko: '세션 리플레이 및 기능 플래그' },
      { text: 'Open source with self-hosting option', text_ko: '오픈소스 셀프호스팅 가능' }
    ],
    cons: [
      { text: 'Can be expensive for high event volume', text_ko: '높은 이벤트 볼륨 시 비쌈' },
      { text: 'UI can be complex for beginners', text_ko: '초보자에게 복잡한 UI' }
    ]
  }
];

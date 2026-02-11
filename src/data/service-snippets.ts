import type { CodeSnippet } from '@/types/package';

/**
 * 주요 서비스별 기본 코드 스니펫
 * 패키지 생성 시 자동으로 포함할 수 있는 초기화 코드
 */
export const serviceSnippets: Record<string, CodeSnippet[]> = {
  supabase: [
    {
      path: 'src/lib/supabase/client.ts',
      strategy: 'create',
      description: 'Supabase 브라우저 클라이언트',
      content: `import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
`,
    },
    {
      path: 'src/lib/supabase/server.ts',
      strategy: 'create',
      description: 'Supabase 서버 클라이언트 (App Router)',
      content: `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  );
}
`,
    },
  ],

  stripe: [
    {
      path: 'src/lib/stripe.ts',
      strategy: 'create',
      description: 'Stripe 서버 클라이언트',
      content: `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});
`,
    },
  ],

  clerk: [
    {
      path: 'src/middleware.ts',
      strategy: 'create',
      description: 'Clerk 인증 미들웨어',
      content: `import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
`,
    },
  ],

  resend: [
    {
      path: 'src/lib/email.ts',
      strategy: 'create',
      description: 'Resend 이메일 클라이언트',
      content: `import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to,
    subject,
    html,
  });
}
`,
    },
  ],

  sentry: [
    {
      path: 'sentry.client.config.ts',
      strategy: 'create',
      description: 'Sentry 클라이언트 설정',
      content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
`,
    },
    {
      path: 'sentry.server.config.ts',
      strategy: 'create',
      description: 'Sentry 서버 설정',
      content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
`,
    },
  ],

  openai: [
    {
      path: 'src/lib/ai/openai.ts',
      strategy: 'create',
      description: 'OpenAI 클라이언트',
      content: `import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
`,
    },
  ],

  anthropic: [
    {
      path: 'src/lib/ai/anthropic.ts',
      strategy: 'create',
      description: 'Anthropic Claude 클라이언트',
      content: `import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
`,
    },
  ],

  firebase: [
    {
      path: 'src/lib/firebase.ts',
      strategy: 'create',
      description: 'Firebase 초기화',
      content: `import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
`,
    },
  ],

  cloudinary: [
    {
      path: 'src/lib/cloudinary.ts',
      strategy: 'create',
      description: 'Cloudinary 설정',
      content: `import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
`,
    },
  ],

  upstash: [
    {
      path: 'src/lib/redis.ts',
      strategy: 'create',
      description: 'Upstash Redis 클라이언트',
      content: `import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
`,
    },
  ],

  prisma: [
    {
      path: 'src/lib/prisma.ts',
      strategy: 'create',
      description: 'Prisma 클라이언트 (싱글턴)',
      content: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`,
    },
  ],
};

/**
 * 서비스 slug로 기본 코드 스니펫 조회
 */
export function getSnippetsForService(slug: string): CodeSnippet[] {
  return serviceSnippets[slug] || [];
}

/**
 * 여러 서비스의 스니펫을 합쳐서 반환
 */
export function getSnippetsForServices(slugs: string[]): CodeSnippet[] {
  return slugs.flatMap((slug) => getSnippetsForService(slug));
}

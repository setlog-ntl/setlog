export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Map,
  Key,
  Layers,
  ArrowRight,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import type { Profile } from '@/types';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  const services = [
    'Supabase', 'Firebase', 'Vercel', 'Netlify', 'Stripe',
    'Clerk', 'Resend', 'OpenAI', 'Anthropic', 'Sentry',
    'Cloudinary', 'PlanetScale', 'Neon', 'Railway',
    'Lemon Squeezy', 'Uploadthing', 'PostHog', 'AWS S3',
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
              바이브 코딩을 위한 설정 관리 플랫폼
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              바이브 코딩,{' '}
              <span className="text-primary">설정은 SetLog가</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              서비스 연결, API 키 관리, 환경변수 설정까지.
              <br />
              복잡한 프로젝트 초기 설정을 체계적으로 관리하세요.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">서비스 카탈로그 보기</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900/20),transparent)]" />
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">핵심 기능</h2>
          <p className="text-muted-foreground text-lg">
            프로젝트 설정에 필요한 모든 것을 한 곳에서
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">서비스 연결 체크리스트</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                서비스별 단계별 한국어 가이드로 초보자도 쉽게 연결할 수 있습니다.
                체크리스트로 진행도를 추적하세요.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">환경변수 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                API 키와 시크릿을 암호화하여 안전하게 저장합니다.
                .env 파일을 한 클릭으로 다운로드하세요.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">서비스 맵 시각화</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                프로젝트의 서비스 아키텍처를 다이어그램으로 시각화합니다.
                팀원과 쉽게 공유하세요.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">프로젝트 템플릿</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                SaaS, AI 앱, 블로그 등 검증된 템플릿으로 빠르게 시작하세요.
                서비스가 자동으로 구성됩니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">이렇게 사용하세요</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">프로젝트 생성</h3>
              <p className="text-sm text-muted-foreground">
                새 프로젝트를 만들거나 템플릿에서 시작하세요
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">서비스 추가</h3>
              <p className="text-sm text-muted-foreground">
                필요한 서비스를 카탈로그에서 선택하고 체크리스트를 따라가세요
              </p>
            </div>
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">환경변수 관리</h3>
              <p className="text-sm text-muted-foreground">
                API 키를 안전하게 저장하고 .env 파일을 다운로드하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Services */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">지원 서비스</h2>
          <p className="text-muted-foreground text-lg">
            인기 있는 서비스들을 모두 지원합니다
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {services.map((service) => (
            <Badge key={service} variant="outline" className="text-sm px-4 py-2">
              {service}
            </Badge>
          ))}
          <Badge variant="secondary" className="text-sm px-4 py-2">
            +더 많은 서비스
          </Badge>
        </div>
      </section>

      {/* Why SetLog */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">왜 SetLog인가요?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <Zap className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">빠른 시작</h3>
                <p className="text-sm text-muted-foreground">
                  프로젝트 초기 설정 시간을 70% 단축합니다
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Shield className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">안전한 보관</h3>
                <p className="text-sm text-muted-foreground">
                  AES-256 암호화로 API 키를 안전하게 저장합니다
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Users className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">한국어 가이드</h3>
                <p className="text-sm text-muted-foreground">
                  모든 서비스 연결 가이드를 한국어로 제공합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            무료로 3개 프로젝트까지 관리할 수 있습니다.
            <br />
            신용카드 없이 바로 시작하세요.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              무료로 시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

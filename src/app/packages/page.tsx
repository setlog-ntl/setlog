import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '패키지 레지스트리 | Linkmap',
  description: '서비스 패키지를 탐색하고 프로젝트에 원클릭으로 적용하세요. 인증, DB, 결제 등 자주 쓰는 서비스 조합을 패키지로 공유합니다.',
};

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PackageBrowserClient } from '@/components/package/package-browser-client';
import type { Profile } from '@/types';

export default async function PackagesPage() {
  let profile: Profile | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      profile = data ?? null;
    }
  } catch {
    profile = null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">패키지 레지스트리</h1>
          <p className="text-muted-foreground mt-1">
            서비스 패키지를 탐색하고 프로젝트에 원클릭으로 적용하세요
          </p>
        </div>
        <PackageBrowserClient />
      </main>
      <Footer />
    </div>
  );
}

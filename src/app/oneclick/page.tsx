import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '원클릭 홈페이지 배포 | Linkmap',
  description: '3분 안에 내 홈페이지를 만들어 보세요. GitHub 연결, 템플릿 선택, 자동 배포. 코드 소유권은 100% 내 것.',
  keywords: ['홈페이지 배포', '원클릭 배포', 'Vercel', 'GitHub', '포트폴리오', 'Linkmap'],
};

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OneclickPageClient } from '@/components/oneclick/oneclick-page-client';
import type { Profile } from '@/types';

export default async function OneclickPage() {
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
        <OneclickPageClient />
      </main>
      <Footer />
    </div>
  );
}

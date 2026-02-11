export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GitHubSetupGuide } from '@/components/guides/github-setup-guide';
import type { Profile } from '@/types';

export const metadata: Metadata = {
  title: 'GitHub 빠른 설정 가이드 | Linkmap',
  description:
    '바이브 코딩을 시작하기 위한 GitHub 설정 가이드. 가입부터 첫 저장소 생성까지 5단계로 안내합니다.',
  keywords: ['GitHub', '깃허브', '가이드', '바이브 코딩', '초보자', 'Git 설치', '저장소 만들기'],
};

export default async function GitHubGuidePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 container">
        <GitHubSetupGuide />
      </main>
      <Footer />
    </div>
  );
}

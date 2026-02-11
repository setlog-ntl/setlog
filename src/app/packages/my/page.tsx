import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 패키지 | Linkmap',
};

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MyPackagesClient } from '@/components/package/my-packages-client';
import type { Profile } from '@/types';

export default async function MyPackagesPage() {
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
          <h1 className="text-3xl font-bold">내 패키지</h1>
          <p className="text-muted-foreground mt-1">
            내가 발행한 패키지를 관리합니다
          </p>
        </div>
        <MyPackagesClient />
      </main>
      <Footer />
    </div>
  );
}

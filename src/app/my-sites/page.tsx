import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 사이트 | Linkmap',
  description: '배포한 사이트를 관리하세요.',
};

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MySitesClient } from '@/components/my-sites/my-sites-client';
import type { Profile } from '@/types';
import { redirect } from 'next/navigation';

export default async function MySitesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let profile: Profile | null = null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  profile = data ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 container py-8">
        <MySitesClient />
      </main>
      <Footer />
    </div>
  );
}

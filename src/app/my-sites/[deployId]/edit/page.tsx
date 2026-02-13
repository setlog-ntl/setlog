import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '사이트 편집 | Linkmap',
  description: '사이트 파일을 직접 편집하세요.',
};

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { SiteEditorClient } from '@/components/my-sites/site-editor-client';
import type { Profile } from '@/types';
import { redirect } from 'next/navigation';

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ deployId: string }>;
}) {
  const { deployId } = await params;
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
      <main className="flex-1">
        <SiteEditorClient deployId={deployId} />
      </main>
    </div>
  );
}

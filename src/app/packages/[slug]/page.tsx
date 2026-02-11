import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '패키지 상세 | Linkmap',
};

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PackageDetailClient } from '@/components/package/package-detail-client';
import type { Profile } from '@/types';

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let profile: Profile | null = null;
  let projectOptions: { id: string; name: string }[] = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [profileRes, projectsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('projects').select('id, name').eq('user_id', user.id).order('name'),
      ]);
      profile = profileRes.data ?? null;
      projectOptions = projectsRes.data ?? [];
    }
  } catch {
    profile = null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 container py-8">
        <PackageDetailClient slug={slug} projectOptions={projectOptions} />
      </main>
      <Footer />
    </div>
  );
}

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CompareClient } from '@/components/service/compare-client';
import type { Profile, ServiceComparison, Service } from '@/types';

export default async function ComparePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  const [{ data: comparisons }, { data: services }] = await Promise.all([
    supabase.from('service_comparisons').select('*').order('category'),
    supabase.from('services').select('id, name, slug').order('name'),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">서비스 비교</h1>
          <p className="text-muted-foreground mt-1">
            같은 카테고리의 서비스들을 비교하고 적합한 서비스를 선택하세요
          </p>
        </div>
        <CompareClient
          comparisons={(comparisons as ServiceComparison[]) || []}
          services={(services as Pick<Service, 'id' | 'name' | 'slug'>[]) || []}
        />
      </main>
      <Footer />
    </div>
  );
}

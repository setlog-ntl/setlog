export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { ServiceCatalogClient } from '@/components/service/service-catalog-client';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import type { Profile, ServiceDomainRecord } from '@/types';

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  const [{ data: services }, { data: domains }] = await Promise.all([
    supabase.from('services').select('*').order('name'),
    supabase.from('service_domains').select('*').order('order_index'),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">서비스 카탈로그</h1>
          <p className="text-muted-foreground mt-1">
            바이브 코딩에 필요한 서비스들을 둘러보세요
          </p>
        </div>
        <ServiceCatalogClient
          services={services || []}
          domains={(domains as ServiceDomainRecord[]) || []}
        />
      </main>
      <Footer />
    </div>
  );
}

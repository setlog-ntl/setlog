import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '서비스 카탈로그 | Linkmap',
  description: '바이브 코딩에 필요한 인증, 데이터베이스, 배포, AI 등 서비스를 비교하고 프로젝트에 연결하세요.',
  keywords: ['서비스 카탈로그', 'API 서비스', 'Supabase', 'Stripe', 'Vercel', '바이브 코딩'],
};

import { createClient } from '@/lib/supabase/server';
import { ServiceCatalogClient } from '@/components/service/service-catalog-client';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import type { Profile, Service, ServiceDomainRecord } from '@/types';

export default async function ServicesPage() {
  let profile: Profile | null = null;
  let services: Service[] = [];
  let domains: ServiceDomainRecord[] = [];
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      profile = data ?? null;
    }
    const [servicesRes, domainsRes] = await Promise.all([
      supabase.from('services').select('*').order('name'),
      supabase.from('service_domains').select('*').order('order_index'),
    ]);
    services = (servicesRes.data ?? []) as Service[];
    domains = (domainsRes.data ?? []) as ServiceDomainRecord[];
  } catch {
    profile = null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">서비스 카탈로그</h1>
          <p className="text-muted-foreground mt-1">
            내 프로젝트에 필요한 서비스를 쉽게 찾아 연결하세요
          </p>
        </div>
        <ServiceCatalogClient services={services} domains={domains} />
      </main>
      <Footer />
    </div>
  );
}

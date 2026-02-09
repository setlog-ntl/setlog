export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ServiceDetailClient } from '@/components/service/service-detail-client';
import type { Profile, Service, ServiceGuide, ServiceCostTier, ServiceDependency } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  // Fetch service by slug
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!service) notFound();

  // Parallel fetch related data
  const [
    { data: guide },
    { data: costTiers },
    { data: dependencies },
  ] = await Promise.all([
    supabase
      .from('service_guides')
      .select('*')
      .eq('service_id', service.id)
      .single(),
    supabase
      .from('service_cost_tiers')
      .select('*')
      .eq('service_id', service.id)
      .order('order_index'),
    supabase
      .from('service_dependencies')
      .select('*, depends_on_service:services!service_dependencies_depends_on_service_id_fkey(*)')
      .eq('service_id', service.id),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <main className="flex-1 container py-8">
        <ServiceDetailClient
          service={service as Service}
          guide={(guide as ServiceGuide) || null}
          costTiers={(costTiers as ServiceCostTier[]) || []}
          dependencies={(dependencies as (ServiceDependency & { depends_on_service: Service })[]) || []}
        />
      </main>
      <Footer />
    </div>
  );
}

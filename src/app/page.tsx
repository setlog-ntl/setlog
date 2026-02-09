export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { InteractiveDemo } from '@/components/landing/interactive-demo';
import { FeaturesBento } from '@/components/landing/features-bento';
import { HowItWorks } from '@/components/landing/how-it-works';
import { ServicesGrid } from '@/components/landing/services-grid';
import { StatsSection } from '@/components/landing/stats-section';
import { CtaSection } from '@/components/landing/cta-section';
import type { Profile } from '@/types';

export default async function LandingPage() {
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

      {/* Section 1: Hero — Interactive Diagram */}
      <HeroSection />

      {/* Section 2: Interactive Showcase (Bento Grid) */}
      <InteractiveDemo />

      {/* Section 3: Core Features (Bento Grid) */}
      <FeaturesBento />

      {/* Section 4: How It Works */}
      <HowItWorks />

      {/* Section 5: Supported Services */}
      <ServicesGrid />

      {/* Section 6: Stats */}
      <StatsSection />

      {/* Section 7: Pricing + CTA */}
      <CtaSection />

      <Footer />
    </div>
  );
}

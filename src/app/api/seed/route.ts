import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { services, checklistItems } from '@/data/services';
import { templates } from '@/data/templates';
import { domains } from '@/data/domains';
import { subcategories } from '@/data/subcategories';
import { servicesV2 } from '@/data/services-v2';
import { serviceGuides } from '@/data/service-guides';
import { costTiers } from '@/data/cost-tiers';
import { dependencies } from '@/data/dependencies';
import { comparisons } from '@/data/comparisons';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const supabase = await createClient();

  try {
    // 1. Seed domains (must be first - services reference domains)
    const { error: domainsError } = await supabase
      .from('service_domains')
      .upsert(domains.map((d) => ({ ...d })), { onConflict: 'id' });

    if (domainsError) {
      return NextResponse.json({ error: `Domains: ${domainsError.message}` }, { status: 500 });
    }

    // 2. Seed subcategories (must be before services)
    const { error: subcatError } = await supabase
      .from('service_subcategories')
      .upsert(subcategories.map((s) => ({ ...s })), { onConflict: 'id' });

    if (subcatError) {
      return NextResponse.json({ error: `Subcategories: ${subcatError.message}` }, { status: 500 });
    }

    // 3. Seed existing services (with v2 extended fields)
    const { error: servicesError } = await supabase
      .from('services')
      .upsert(services.map((s) => ({ ...s })), { onConflict: 'slug' });

    if (servicesError) {
      return NextResponse.json({ error: `Services: ${servicesError.message}` }, { status: 500 });
    }

    // 4. Seed new v2 services
    const { error: servicesV2Error } = await supabase
      .from('services')
      .upsert(servicesV2.map((s) => ({ ...s })), { onConflict: 'slug' });

    if (servicesV2Error) {
      return NextResponse.json({ error: `Services V2: ${servicesV2Error.message}` }, { status: 500 });
    }

    // 5. Seed checklist items
    const { error: checklistError } = await supabase
      .from('checklist_items')
      .upsert(checklistItems.map((c) => ({ ...c })), { onConflict: 'id' });

    if (checklistError) {
      return NextResponse.json({ error: `Checklist: ${checklistError.message}` }, { status: 500 });
    }

    // 6. Seed templates
    const { error: templatesError } = await supabase
      .from('project_templates')
      .upsert(templates.map((t) => ({ ...t })), { onConflict: 'id' });

    if (templatesError) {
      return NextResponse.json({ error: `Templates: ${templatesError.message}` }, { status: 500 });
    }

    // 7. Seed service guides
    const { error: guidesError } = await supabase
      .from('service_guides')
      .upsert(serviceGuides.map((g) => ({ ...g })), { onConflict: 'service_id' });

    if (guidesError) {
      return NextResponse.json({ error: `Guides: ${guidesError.message}` }, { status: 500 });
    }

    // 8. Seed cost tiers (delete existing first to avoid duplicates)
    const allServiceIds = [
      ...services.map((s) => s.id),
      ...servicesV2.map((s) => s.id),
    ];
    await supabase
      .from('service_cost_tiers')
      .delete()
      .in('service_id', allServiceIds);

    const { error: costError } = await supabase
      .from('service_cost_tiers')
      .insert(costTiers.map((c) => ({ ...c })));

    if (costError) {
      return NextResponse.json({ error: `Cost Tiers: ${costError.message}` }, { status: 500 });
    }

    // 9. Seed dependencies (delete existing first to avoid duplicates)
    await supabase
      .from('service_dependencies')
      .delete()
      .in('service_id', allServiceIds);

    const { error: depsError } = await supabase
      .from('service_dependencies')
      .insert(dependencies.map((d) => ({ ...d })));

    if (depsError) {
      return NextResponse.json({ error: `Dependencies: ${depsError.message}` }, { status: 500 });
    }

    // 10. Seed comparisons (delete all existing, then insert fresh)
    await supabase.from('service_comparisons').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: compError } = await supabase
      .from('service_comparisons')
      .insert(comparisons.map((c) => ({ ...c })));

    if (compError) {
      return NextResponse.json({ error: `Comparisons: ${compError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      counts: {
        domains: domains.length,
        subcategories: subcategories.length,
        services: services.length,
        servicesV2: servicesV2.length,
        totalServices: services.length + servicesV2.length,
        checklistItems: checklistItems.length,
        templates: templates.length,
        guides: serviceGuides.length,
        costTiers: costTiers.length,
        dependencies: dependencies.length,
        comparisons: comparisons.length,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

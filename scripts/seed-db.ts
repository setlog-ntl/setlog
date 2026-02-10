/**
 * Standalone seed script - run with: npx tsx scripts/seed-db.ts
 * Bypasses Next.js server, connects directly to Supabase
 */
import { createClient } from '@supabase/supabase-js';
import { services, checklistItems } from '../src/data/services';
import { templates } from '../src/data/templates';
import { domains } from '../src/data/domains';
import { subcategories } from '../src/data/subcategories';
import { servicesV2 } from '../src/data/services-v2';
import { serviceGuides } from '../src/data/service-guides';
import { costTiers } from '../src/data/cost-tiers';
import { dependencies } from '../src/data/dependencies';
import { comparisons } from '../src/data/comparisons';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding database...\n');

  // 1. Domains
  const { error: domainsError } = await supabase
    .from('service_domains')
    .upsert(domains.map((d) => ({ ...d })), { onConflict: 'id' });
  if (domainsError) { console.error('Domains:', domainsError.message); return; }
  console.log(`✓ Domains: ${domains.length}`);

  // 2. Subcategories
  const { error: subcatError } = await supabase
    .from('service_subcategories')
    .upsert(subcategories.map((s) => ({ ...s })), { onConflict: 'id' });
  if (subcatError) { console.error('Subcategories:', subcatError.message); return; }
  console.log(`✓ Subcategories: ${subcategories.length}`);

  // 3. Services (main)
  const { error: servicesError } = await supabase
    .from('services')
    .upsert(services.map((s) => ({ ...s })), { onConflict: 'slug' });
  if (servicesError) { console.error('Services:', servicesError.message); return; }
  console.log(`✓ Services: ${services.length}`);

  // 4. Services V2
  const { error: servicesV2Error } = await supabase
    .from('services')
    .upsert(servicesV2.map((s) => ({ ...s })), { onConflict: 'slug' });
  if (servicesV2Error) { console.error('Services V2:', servicesV2Error.message); return; }
  console.log(`✓ Services V2: ${servicesV2.length}`);

  // 5. Checklist items
  const { error: checklistError } = await supabase
    .from('checklist_items')
    .upsert(checklistItems.map((c) => ({ ...c })), { onConflict: 'id' });
  if (checklistError) { console.error('Checklist:', checklistError.message); return; }
  console.log(`✓ Checklist items: ${checklistItems.length}`);

  // 6. Templates
  const { error: templatesError } = await supabase
    .from('project_templates')
    .upsert(templates.map((t) => ({ ...t })), { onConflict: 'id' });
  if (templatesError) { console.error('Templates:', templatesError.message); return; }
  console.log(`✓ Templates: ${templates.length}`);

  // 7. Service guides
  const { error: guidesError } = await supabase
    .from('service_guides')
    .upsert(serviceGuides.map((g) => ({ ...g })), { onConflict: 'service_id' });
  if (guidesError) { console.error('Guides:', guidesError.message); return; }
  console.log(`✓ Guides: ${serviceGuides.length}`);

  // 8. Cost tiers
  const allServiceIds = [...services.map((s) => s.id), ...servicesV2.map((s) => s.id)];
  await supabase.from('service_cost_tiers').delete().in('service_id', allServiceIds);
  const { error: costError } = await supabase
    .from('service_cost_tiers')
    .insert(costTiers.map((c) => ({ ...c })));
  if (costError) { console.error('Cost Tiers:', costError.message); return; }
  console.log(`✓ Cost tiers: ${costTiers.length}`);

  // 9. Dependencies
  await supabase.from('service_dependencies').delete().in('service_id', allServiceIds);
  const { error: depsError } = await supabase
    .from('service_dependencies')
    .insert(dependencies.map((d) => ({ ...d })));
  if (depsError) { console.error('Dependencies:', depsError.message); return; }
  console.log(`✓ Dependencies: ${dependencies.length}`);

  // 10. Comparisons
  await supabase.from('service_comparisons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: compError } = await supabase
    .from('service_comparisons')
    .insert(comparisons.map((c) => ({ ...c })));
  if (compError) { console.error('Comparisons:', compError.message); return; }
  console.log(`✓ Comparisons: ${comparisons.length}`);

  console.log(`\n✅ Seed complete! Total services: ${services.length + servicesV2.length}`);
}

seed().catch(console.error);

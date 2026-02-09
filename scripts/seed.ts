/**
 * Seed script: Supabase REST API (PostgREST) 를 통해 시드 데이터 삽입
 * 실행: npx tsx scripts/seed.ts
 */

import { services, checklistItems } from '../src/data/services';
import { templates } from '../src/data/templates';

const SUPABASE_URL = 'https://apqydhwahkccxlltacas.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcXlkaHdhaGtjY3hsbHRhY2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ1MzEyOCwiZXhwIjoyMDg2MDI5MTI4fQ.LUP5VtmIR_ok8p-0AKzTi_1mk6EP-QwViTcHfPr3GGw';

const headers = {
  'Content-Type': 'application/json',
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  Prefer: 'resolution=merge-duplicates',
};

async function upsert(table: string, rows: Record<string, unknown>[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[${table}] ${res.status}: ${body}`);
  }

  console.log(`  ✓ ${table}: ${rows.length}건 삽입 완료`);
}

async function main() {
  console.log('=== SetLog 시드 데이터 삽입 시작 ===\n');

  // 1. Services (20개)
  console.log('1) 서비스 카탈로그...');
  const serviceRows = services.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    category: s.category,
    description: s.description,
    description_ko: s.description_ko,
    icon_url: s.icon_url,
    website_url: s.website_url,
    docs_url: s.docs_url,
    pricing_info: s.pricing_info,
    required_env_vars: s.required_env_vars,
  }));
  await upsert('services', serviceRows);

  // 2. Checklist items (116개)
  console.log('2) 체크리스트 항목...');
  const checklistRows = checklistItems.map((c) => ({
    id: c.id,
    service_id: c.service_id,
    order_index: c.order_index,
    title: c.title,
    title_ko: c.title_ko,
    description: c.description,
    description_ko: c.description_ko,
    guide_url: c.guide_url,
  }));
  await upsert('checklist_items', checklistRows);

  // 3. Templates (5개)
  console.log('3) 프로젝트 템플릿...');
  const templateRows = templates.map((t) => ({
    id: t.id,
    name: t.name,
    name_ko: t.name_ko,
    description: t.description,
    description_ko: t.description_ko,
    services: t.services,
    tech_stack: t.tech_stack,
    is_community: t.is_community,
    author_id: t.author_id,
    downloads_count: t.downloads_count,
  }));
  await upsert('project_templates', templateRows);

  console.log('\n=== 시드 데이터 삽입 완료! ===');
  console.log(`  서비스: ${services.length}개`);
  console.log(`  체크리스트: ${checklistItems.length}개`);
  console.log(`  템플릿: ${templates.length}개`);
}

main().catch((err) => {
  console.error('\n❌ 에러 발생:', err.message);
  process.exit(1);
});

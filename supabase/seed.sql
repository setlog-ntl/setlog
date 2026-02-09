-- SetLog Seed Data
-- Run this after the initial schema migration
-- This file seeds the services, checklist_items, and project_templates tables

-- NOTE: The actual seed data is maintained in TypeScript files:
-- - src/data/services.ts (20 services + 116 checklist items)
-- - src/data/templates.ts (5 project templates)
--
-- To seed the database, use the seed API route: POST /api/seed
-- Or run the seed script: npm run seed
--
-- This SQL file provides a minimal seed for testing.

-- Example: Insert a test service (Supabase)
INSERT INTO public.services (id, name, slug, category, description, description_ko, website_url, docs_url, pricing_info, required_env_vars)
VALUES (
  '10000000-0000-4000-a000-000000000001',
  'Supabase',
  'supabase',
  'database',
  'Open-source Firebase alternative with PostgreSQL database, authentication, real-time subscriptions, edge functions, and storage.',
  'PostgreSQL 데이터베이스, 인증, 실시간 구독, 엣지 함수, 스토리지를 제공하는 오픈소스 Firebase 대안입니다.',
  'https://supabase.com',
  'https://supabase.com/docs',
  '{"free_tier": true, "plans": "무료: 500MB DB, 1GB 스토리지 | Pro: $25/월"}',
  '[{"name": "NEXT_PUBLIC_SUPABASE_URL", "public": true, "description": "Supabase Project URL", "description_ko": "Supabase 프로젝트 URL"}, {"name": "NEXT_PUBLIC_SUPABASE_ANON_KEY", "public": true, "description": "Supabase anonymous key for client-side access", "description_ko": "클라이언트 사이드 접근을 위한 Supabase 익명 키"}, {"name": "SUPABASE_SERVICE_ROLE_KEY", "public": false, "description": "Supabase service role key for server-side admin operations", "description_ko": "서버 사이드 관리 작업을 위한 Supabase 서비스 역할 키"}]'
)
ON CONFLICT (slug) DO NOTHING;

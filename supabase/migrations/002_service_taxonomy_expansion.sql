-- SetLog Service Taxonomy Expansion
-- Migration 002: 3-level classification + service metadata + guides + costs
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql

-- ============================================
-- 1. SERVICE_DOMAINS (Level 1 - 도메인)
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_domains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  description TEXT,
  description_ko TEXT,
  icon_name TEXT,
  order_index INTEGER DEFAULT 0
);

-- ============================================
-- 2. SERVICE_SUBCATEGORIES (Level 3 - 서브카테고리)
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_subcategories (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  description TEXT,
  description_ko TEXT
);

-- ============================================
-- 3. EXTEND SERVICES TABLE (기존 테이블 확장)
-- ============================================

-- Drop the old CHECK constraint on category to allow new categories
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_category_check;

-- Add new category constraint with extended categories
ALTER TABLE public.services ADD CONSTRAINT services_category_check
  CHECK (category IN (
    'auth', 'database', 'deploy', 'email', 'payment', 'storage', 'monitoring', 'ai', 'other',
    'cdn', 'cicd', 'testing', 'sms', 'push', 'chat', 'search', 'cms', 'analytics',
    'media', 'queue', 'cache', 'logging', 'feature_flags', 'scheduling', 'ecommerce',
    'serverless', 'code_quality', 'automation'
  ));

-- Add new columns to services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS domain TEXT REFERENCES public.service_domains(id),
  ADD COLUMN IF NOT EXISTS subcategory TEXT REFERENCES public.service_subcategories(id),
  ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'intermediate'
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS alternatives TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS compatibility JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS official_sdks JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS free_tier_quality TEXT DEFAULT 'good'
    CHECK (free_tier_quality IN ('excellent', 'good', 'limited', 'none')),
  ADD COLUMN IF NOT EXISTS vendor_lock_in_risk TEXT DEFAULT 'medium'
    CHECK (vendor_lock_in_risk IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS setup_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS monthly_cost_estimate JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dx_score NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_services_domain ON public.services(domain);
CREATE INDEX IF NOT EXISTS idx_services_subcategory ON public.services(subcategory);
CREATE INDEX IF NOT EXISTS idx_services_popularity ON public.services(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_services_difficulty ON public.services(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_services_tags ON public.services USING GIN(tags);

-- ============================================
-- 4. SERVICE_DEPENDENCIES (서비스 간 관계)
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  depends_on_service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL CHECK (dependency_type IN ('required', 'recommended', 'optional', 'alternative')),
  description TEXT,
  description_ko TEXT,
  UNIQUE(service_id, depends_on_service_id)
);

CREATE INDEX IF NOT EXISTS idx_service_deps_service ON public.service_dependencies(service_id);
CREATE INDEX IF NOT EXISTS idx_service_deps_depends_on ON public.service_dependencies(depends_on_service_id);

-- ============================================
-- 5. SERVICE_GUIDES (서비스 상세 가이드)
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE UNIQUE,
  quick_start TEXT,
  quick_start_en TEXT,
  setup_steps JSONB DEFAULT '[]',
  code_examples JSONB DEFAULT '{}',
  common_pitfalls JSONB DEFAULT '[]',
  integration_tips JSONB DEFAULT '[]',
  pros JSONB DEFAULT '[]',
  cons JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_guides_service ON public.service_guides(service_id);

-- ============================================
-- 6. SERVICE_COMPARISONS (비교 매트릭스)
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT,
  title_ko TEXT,
  services UUID[],
  comparison_data JSONB DEFAULT '{}',
  recommendation JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_comparisons_category ON public.service_comparisons(category);

-- ============================================
-- 7. SERVICE_COST_TIERS (비용 정보)
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_cost_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  tier_name_ko TEXT,
  price_monthly TEXT,
  price_yearly TEXT,
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  recommended_for TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cost_tiers_service ON public.service_cost_tiers(service_id);

-- ============================================
-- 8. SERVICE_CHANGELOG (변경 이력)
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('added', 'updated', 'deprecated', 'removed')),
  change_description TEXT,
  change_description_ko TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_changelog_service ON public.service_changelog(service_id);
CREATE INDEX IF NOT EXISTS idx_changelog_created ON public.service_changelog(created_at DESC);

-- ============================================
-- 9. AUTO CHANGELOG TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.log_service_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.service_changelog (service_id, change_type, change_description, change_description_ko)
    VALUES (NEW.id, 'added', 'Service added: ' || NEW.name, '서비스 추가: ' || NEW.name);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if meaningful fields changed
    IF OLD.name IS DISTINCT FROM NEW.name
       OR OLD.description IS DISTINCT FROM NEW.description
       OR OLD.pricing_info IS DISTINCT FROM NEW.pricing_info
       OR OLD.required_env_vars IS DISTINCT FROM NEW.required_env_vars
    THEN
      INSERT INTO public.service_changelog (service_id, change_type, change_description, change_description_ko)
      VALUES (NEW.id, 'updated', 'Service updated: ' || NEW.name, '서비스 업데이트: ' || NEW.name);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_service_changes ON public.services;
CREATE TRIGGER trigger_log_service_changes
  AFTER INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.log_service_change();

-- ============================================
-- 10. ROW LEVEL SECURITY (신규 테이블)
-- ============================================

-- service_domains: public read
ALTER TABLE public.service_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view domains" ON public.service_domains
  FOR SELECT USING (true);

-- service_subcategories: public read
ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subcategories" ON public.service_subcategories
  FOR SELECT USING (true);

-- service_dependencies: authenticated read
ALTER TABLE public.service_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view dependencies" ON public.service_dependencies
  FOR SELECT USING (auth.role() = 'authenticated');

-- service_guides: authenticated read
ALTER TABLE public.service_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view guides" ON public.service_guides
  FOR SELECT USING (auth.role() = 'authenticated');

-- service_comparisons: authenticated read
ALTER TABLE public.service_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view comparisons" ON public.service_comparisons
  FOR SELECT USING (auth.role() = 'authenticated');

-- service_cost_tiers: authenticated read
ALTER TABLE public.service_cost_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view cost tiers" ON public.service_cost_tiers
  FOR SELECT USING (auth.role() = 'authenticated');

-- service_changelog: authenticated read
ALTER TABLE public.service_changelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view changelog" ON public.service_changelog
  FOR SELECT USING (auth.role() = 'authenticated');

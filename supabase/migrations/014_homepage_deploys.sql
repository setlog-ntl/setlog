-- Homepage templates and one-click deploy tracking

-- 홈페이지 템플릿 카탈로그 (시스템 관리)
CREATE TABLE IF NOT EXISTS homepage_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  description TEXT,
  description_ko TEXT,
  preview_image_url TEXT,
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  default_branch TEXT DEFAULT 'main',
  framework TEXT DEFAULT 'nextjs',
  required_env_vars JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 홈페이지 배포 추적
CREATE TABLE IF NOT EXISTS homepage_deploys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  template_id UUID NOT NULL REFERENCES homepage_templates(id),
  -- GitHub
  forked_repo_full_name TEXT,
  forked_repo_url TEXT,
  fork_status TEXT DEFAULT 'pending'
    CHECK (fork_status IN ('pending','forking','forked','failed')),
  -- Vercel
  vercel_project_id TEXT,
  vercel_project_url TEXT,
  deployment_id TEXT,
  deployment_url TEXT,
  deploy_status TEXT DEFAULT 'pending'
    CHECK (deploy_status IN ('pending','creating','building','ready','error','canceled')),
  deploy_error_message TEXT,
  -- 메타데이터
  site_name TEXT NOT NULL,
  custom_domain TEXT,
  config_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deployed_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_homepage_deploys_user ON homepage_deploys(user_id);
CREATE INDEX idx_homepage_deploys_project ON homepage_deploys(project_id);
CREATE INDEX idx_homepage_deploys_status ON homepage_deploys(deploy_status);
CREATE INDEX idx_homepage_templates_active ON homepage_templates(is_active, display_order);

-- RLS
ALTER TABLE homepage_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_deploys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_templates" ON homepage_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_all_deploys" ON homepage_deploys
  FOR ALL USING (user_id = auth.uid());

-- plan_quotas 확장
ALTER TABLE plan_quotas ADD COLUMN IF NOT EXISTS max_homepage_deploys INT NOT NULL DEFAULT 1;
UPDATE plan_quotas SET max_homepage_deploys = 1 WHERE plan = 'free';
UPDATE plan_quotas SET max_homepage_deploys = 10 WHERE plan = 'pro';
UPDATE plan_quotas SET max_homepage_deploys = 50 WHERE plan = 'team';

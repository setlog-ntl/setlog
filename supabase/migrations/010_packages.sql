-- ============================================
-- 010: Package Registry System
-- ============================================

-- 패키지 레지스트리
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  description_ko TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  tech_stack JSONB DEFAULT '{}',
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 패키지 버전
CREATE TABLE package_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE NOT NULL,
  version TEXT NOT NULL,
  config JSONB NOT NULL,
  changelog TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(package_id, version)
);

-- 패키지 설치 기록
CREATE TABLE package_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  package_version_id UUID REFERENCES package_versions(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  installed_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_packages_slug ON packages(slug);
CREATE INDEX idx_packages_author ON packages(author_id);
CREATE INDEX idx_packages_public ON packages(is_public) WHERE is_public = true;
CREATE INDEX idx_packages_tags ON packages USING GIN(tags);
CREATE INDEX idx_package_versions_package ON package_versions(package_id);
CREATE INDEX idx_package_installations_project ON package_installations(project_id);
CREATE INDEX idx_package_installations_user ON package_installations(user_id);

-- RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_installations ENABLE ROW LEVEL SECURITY;

-- 공개 패키지는 모든 인증 사용자 조회 가능
CREATE POLICY "packages_select_public" ON packages
  FOR SELECT TO authenticated
  USING (is_public = true OR author_id = auth.uid());

-- 본인 패키지만 생성
CREATE POLICY "packages_insert_own" ON packages
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

-- 본인 패키지만 수정
CREATE POLICY "packages_update_own" ON packages
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

-- 본인 패키지만 삭제
CREATE POLICY "packages_delete_own" ON packages
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- 버전: 접근 가능한 패키지의 버전만 조회
CREATE POLICY "package_versions_select" ON package_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM packages
      WHERE packages.id = package_versions.package_id
        AND (packages.is_public = true OR packages.author_id = auth.uid())
    )
  );

-- 버전: 본인 패키지에만 추가
CREATE POLICY "package_versions_insert_own" ON package_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM packages
      WHERE packages.id = package_versions.package_id
        AND packages.author_id = auth.uid()
    )
  );

-- 설치 기록: 본인 것만 조회
CREATE POLICY "package_installations_select_own" ON package_installations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 설치 기록: 본인만 생성
CREATE POLICY "package_installations_insert_own" ON package_installations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_packages_updated_at();

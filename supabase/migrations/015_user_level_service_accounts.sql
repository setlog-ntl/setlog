-- 015: user-level service accounts (원클릭 배포 지원)
-- service_accounts.project_id를 nullable로 변경하여 user-level 계정 지원
-- oauth_states.project_id를 nullable로 변경 + flow_context 추가

-- 1. service_accounts.project_id nullable
ALTER TABLE service_accounts ALTER COLUMN project_id DROP NOT NULL;

-- 2. 기존 unique 제약조건 교체 → partial unique indexes
ALTER TABLE service_accounts DROP CONSTRAINT service_accounts_project_id_service_id_key;
CREATE UNIQUE INDEX idx_sa_project_service
  ON service_accounts(project_id, service_id) WHERE project_id IS NOT NULL;
CREATE UNIQUE INDEX idx_sa_user_service_no_project
  ON service_accounts(user_id, service_id) WHERE project_id IS NULL;

-- 3. oauth_states.project_id nullable + flow_context
ALTER TABLE oauth_states ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE oauth_states ADD COLUMN flow_context TEXT CHECK (flow_context IN ('oneclick', 'project'));

-- 4. RLS 정책 업데이트 (user-level 계정 지원)
-- 기존 정책은 project_id가 NULL일 때도 user_id = auth.uid() 조건으로 커버됨
-- 추가 변경 불필요 (기존 정책이 이미 user_id OR project owner 체크)

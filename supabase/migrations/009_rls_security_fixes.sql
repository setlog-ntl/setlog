-- ============================================
-- Migration 009: RLS 보안 수정
-- 식별된 RLS 정책 취약점 6건 수정
-- ============================================

-- ============================================
-- P0: subscriptions - 과도한 FOR ALL 정책 수정
-- 기존: USING(true) → 모든 인증 사용자가 타인 구독 조작 가능
-- 수정: service_role만 관리 가능하도록 제한
-- ============================================
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- P1: plan_quotas - RLS 미설정 수정
-- 시스템 참조 데이터: 읽기만 허용, 쓰기는 service_role만
-- ============================================
ALTER TABLE plan_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plan quotas"
  ON plan_quotas FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE 정책 없음 → service_role만 가능

-- ============================================
-- P1: audit_logs INSERT - 과도한 허용 수정
-- 기존: WITH CHECK(true) → 누구나 임의 user_id로 삽입 가능
-- 수정: service_role만 INSERT 가능 (admin client 사용)
-- ============================================
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;

CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- P2: health_checks INSERT - 과도한 허용 수정
-- 기존: WITH CHECK(true) → 누구나 허위 헬스체크 삽입 가능
-- 수정: service_role만 INSERT 가능 (admin client 사용)
-- ============================================
DROP POLICY IF EXISTS "Service role can insert health checks" ON health_checks;

CREATE POLICY "Service role can insert health checks"
  ON health_checks FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- P2: 팀 멤버 하위 리소스 접근 정책 추가
-- 005_teams.sql에서 projects에만 팀 정책을 추가했으나
-- 하위 테이블(project_services, environment_variables,
-- user_checklist_progress, health_checks)에는 누락됨
-- ============================================

-- project_services: 팀 멤버 읽기 + editor 이상 쓰기
CREATE POLICY "Team members can view team project services"
  ON project_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = project_services.project_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors can manage team project services"
  ON project_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = project_services.project_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Team editors can update team project services"
  ON project_services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = project_services.project_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Team editors can delete team project services"
  ON project_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = project_services.project_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

-- environment_variables: 팀 멤버 읽기 + editor 이상 쓰기
CREATE POLICY "Team members can view team env vars"
  ON environment_variables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = environment_variables.project_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors can create team env vars"
  ON environment_variables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = environment_variables.project_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Team editors can update team env vars"
  ON environment_variables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = environment_variables.project_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Team editors can delete team env vars"
  ON environment_variables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = environment_variables.project_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

-- user_checklist_progress: 팀 멤버 읽기 + editor 이상 쓰기
CREATE POLICY "Team members can view team checklist progress"
  ON user_checklist_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_services ps
      JOIN projects p ON p.id = ps.project_id
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE ps.id = user_checklist_progress.project_service_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors can insert team checklist progress"
  ON user_checklist_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_services ps
      JOIN projects p ON p.id = ps.project_id
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE ps.id = user_checklist_progress.project_service_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Team editors can update team checklist progress"
  ON user_checklist_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_services ps
      JOIN projects p ON p.id = ps.project_id
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE ps.id = user_checklist_progress.project_service_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

-- health_checks: 팀 멤버 읽기
CREATE POLICY "Team members can view team health checks"
  ON health_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_services ps
      JOIN projects p ON p.id = ps.project_id
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE ps.id = health_checks.project_service_id
        AND tm.user_id = auth.uid()
    )
  );

-- ============================================
-- P3: user_checklist_progress DELETE 정책 추가
-- 프로젝트 소유자가 체크리스트 초기화 가능하도록
-- ============================================
CREATE POLICY "Project owners can delete progress"
  ON user_checklist_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_services ps
      JOIN projects p ON p.id = ps.project_id
      WHERE ps.id = user_checklist_progress.project_service_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors can delete team checklist progress"
  ON user_checklist_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_services ps
      JOIN projects p ON p.id = ps.project_id
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE ps.id = user_checklist_progress.project_service_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

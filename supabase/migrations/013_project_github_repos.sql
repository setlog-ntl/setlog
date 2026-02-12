-- GitHub repository linking for projects
-- Tracks which GitHub repos are connected to a project for secrets sync

CREATE TABLE IF NOT EXISTS project_github_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  service_account_id UUID NOT NULL REFERENCES service_accounts(id) ON DELETE CASCADE,
  owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  repo_full_name TEXT NOT NULL,
  default_branch TEXT DEFAULT 'main',
  auto_sync_enabled BOOLEAN DEFAULT false,
  sync_environment TEXT DEFAULT 'production',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, repo_full_name)
);

ALTER TABLE project_github_repos ENABLE ROW LEVEL SECURITY;

-- RLS: only project owners can access
CREATE POLICY "owner_select" ON project_github_repos
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "owner_insert" ON project_github_repos
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "owner_update" ON project_github_repos
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "owner_delete" ON project_github_repos
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE INDEX idx_github_repos_project ON project_github_repos(project_id);
CREATE INDEX idx_github_repos_service_account ON project_github_repos(service_account_id);
CREATE INDEX idx_github_repos_auto_sync ON project_github_repos(auto_sync_enabled) WHERE auto_sync_enabled = true;

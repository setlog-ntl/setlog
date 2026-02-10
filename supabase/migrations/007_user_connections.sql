-- User connections: user-defined edges between services on service map
CREATE TABLE public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_service_id UUID NOT NULL REFERENCES services(id),
  target_service_id UUID NOT NULL REFERENCES services(id),
  connection_type TEXT NOT NULL CHECK (connection_type IN ('uses','integrates','data_transfer')),
  label TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, source_service_id, target_service_id)
);

-- Indexes
CREATE INDEX idx_user_connections_project ON public.user_connections(project_id);
CREATE INDEX idx_user_connections_source ON public.user_connections(source_service_id);
CREATE INDEX idx_user_connections_target ON public.user_connections(target_service_id);

-- RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Policy: project owner can do everything
CREATE POLICY "Project owner full access on user_connections"
  ON public.user_connections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = user_connections.project_id
        AND p.user_id = auth.uid()
    )
  );

-- Policy: team members (editor+) can CRUD
CREATE POLICY "Team editor+ access on user_connections"
  ON public.user_connections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = user_connections.project_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'editor')
    )
  );

-- Policy: team viewers can read
CREATE POLICY "Team viewer read on user_connections"
  ON public.user_connections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE p.id = user_connections.project_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'viewer'
    )
  );

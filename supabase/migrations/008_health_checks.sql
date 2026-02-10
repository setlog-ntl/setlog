-- Health check results table
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_service_id UUID NOT NULL REFERENCES project_services(id) ON DELETE CASCADE,
  environment TEXT NOT NULL DEFAULT 'development',
  status TEXT NOT NULL CHECK (status IN ('healthy','unhealthy','degraded','unknown')),
  message TEXT,
  response_time_ms INTEGER,
  details JSONB DEFAULT '{}',
  checked_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_health_checks_ps ON health_checks(project_service_id);
CREATE INDEX idx_health_checks_ps_time ON health_checks(project_service_id, checked_at DESC);

ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

-- Project owners can view health checks
CREATE POLICY "Project owners can view health checks" ON health_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_services ps
      JOIN projects p ON p.id = ps.project_id
      WHERE ps.id = health_checks.project_service_id AND p.user_id = auth.uid()
    )
  );

-- Service role can insert health checks (API routes use admin client)
CREATE POLICY "Service role can insert health checks" ON health_checks
  FOR INSERT WITH CHECK (true);

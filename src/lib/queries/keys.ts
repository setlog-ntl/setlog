export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  services: {
    byProject: (projectId: string) => ['services', 'project', projectId] as const,
  },
  envVars: {
    byProject: (projectId: string) => ['env-vars', 'project', projectId] as const,
  },
  catalog: {
    all: ['catalog'] as const,
  },
  connections: {
    byProject: (projectId: string) => ['connections', 'project', projectId] as const,
  },
  auditLogs: {
    byProject: (projectId: string) => ['audit-logs', 'project', projectId] as const,
  },
  healthChecks: {
    byProjectService: (projectServiceId: string) =>
      ['health-checks', projectServiceId] as const,
  },
} as const;

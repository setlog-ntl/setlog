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
    latestByProject: (projectId: string) =>
      ['health-checks', 'latest', projectId] as const,
  },
  packages: {
    all: ['packages'] as const,
    search: (query: string) => ['packages', 'search', query] as const,
    detail: (slug: string) => ['packages', slug] as const,
    versions: (slug: string) => ['packages', slug, 'versions'] as const,
    my: ['packages', 'my'] as const,
    installations: (projectId: string) => ['packages', 'installations', projectId] as const,
  },
} as const;

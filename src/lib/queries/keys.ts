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
  dependencies: {
    all: ['dependencies'] as const,
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
  serviceAccounts: {
    byProject: (projectId: string) => ['service-accounts', 'project', projectId] as const,
  },
  packages: {
    all: ['packages'] as const,
    search: (query: string) => ['packages', 'search', query] as const,
    detail: (slug: string) => ['packages', slug] as const,
    versions: (slug: string) => ['packages', slug, 'versions'] as const,
    my: ['packages', 'my'] as const,
    installations: (projectId: string) => ['packages', 'installations', projectId] as const,
  },
  github: {
    repos: (projectId: string) => ['github', 'repos', projectId] as const,
    linkedRepos: (projectId: string) => ['github', 'linked-repos', projectId] as const,
    secrets: (projectId: string, owner: string, repo: string) =>
      ['github', 'secrets', projectId, owner, repo] as const,
  },
  linkedAccounts: {
    byProject: (projectId: string) => ['linked-accounts', 'project', projectId] as const,
    byService: (projectId: string, serviceSlug: string) =>
      ['linked-accounts', 'project', projectId, 'service', serviceSlug] as const,
  },
  linkedResources: {
    byType: (projectId: string, resourceType: string) =>
      ['linked-resources', 'project', projectId, resourceType] as const,
  },
  oneclick: {
    templates: ['oneclick', 'templates'] as const,
    status: (deployId: string) => ['oneclick', 'status', deployId] as const,
  },
} as const;

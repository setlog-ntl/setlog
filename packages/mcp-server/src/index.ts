#!/usr/bin/env node

/**
 * Linkmap MCP Server
 *
 * Provides tools for Claude Code / Cursor to interact with Linkmap:
 * - list_services: List available services from the catalog
 * - get_project_services: Get services connected to a project
 * - get_env_vars: Get environment variable names for a project
 * - search_packages: Search packages in the registry
 * - install_package: Install a package into a project
 * - export_package: Export a project as a linkmap.json config
 *
 * Usage:
 *   Set LINKMAP_API_URL and LINKMAP_API_TOKEN environment variables
 *   then run this server via MCP configuration.
 */

const API_URL = process.env.LINKMAP_API_URL || 'https://linkmap.vercel.app';
const API_TOKEN = process.env.LINKMAP_API_TOKEN || '';

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

const tools: Tool[] = [
  {
    name: 'list_services',
    description: 'List all available services from the Linkmap catalog. Returns service names, categories, and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by category (auth, database, deploy, etc.)',
        },
      },
    },
  },
  {
    name: 'get_project_services',
    description: 'Get services connected to a specific project.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project UUID',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_env_vars',
    description: 'Get environment variable names (not values) for a project. Helps identify what needs to be configured.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project UUID',
        },
        environment: {
          type: 'string',
          description: 'Environment: development, staging, or production',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'search_packages',
    description: 'Search for service packages in the Linkmap registry. Returns packages with their descriptions, tags, and download counts.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g. "saas", "ai", "auth")',
        },
        tag: {
          type: 'string',
          description: 'Filter by tag',
        },
      },
    },
  },
  {
    name: 'install_package',
    description: 'Install a service package into a project. Adds all package services and creates environment variable templates.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project UUID to install into',
        },
        package_slug: {
          type: 'string',
          description: 'The package slug/name to install',
        },
        version: {
          type: 'string',
          description: 'Specific version to install (optional, defaults to latest)',
        },
      },
      required: ['project_id', 'package_slug'],
    },
  },
  {
    name: 'export_package',
    description: 'Export a project\'s service configuration as a linkmap.json package config.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project UUID to export',
        },
      },
      required: ['project_id'],
    },
  },
];

async function fetchAPI(path: string, options?: { method?: string; body?: unknown }) {
  const res = await fetch(`${API_URL}${path}`, {
    method: options?.method || 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function handleToolCall(name: string, args: Record<string, string>) {
  switch (name) {
    case 'list_services': {
      const data = await fetchAPI(`/api/services${args.category ? `?category=${args.category}` : ''}`);
      return JSON.stringify(data, null, 2);
    }
    case 'get_project_services': {
      const data = await fetchAPI(`/api/projects/${args.project_id}/services`);
      return JSON.stringify(data, null, 2);
    }
    case 'get_env_vars': {
      const env = args.environment || 'development';
      const data = await fetchAPI(`/api/projects/${args.project_id}/env?environment=${env}`);
      return JSON.stringify(data, null, 2);
    }
    case 'search_packages': {
      const params = new URLSearchParams();
      if (args.query) params.set('q', args.query);
      if (args.tag) params.set('tag', args.tag);
      const data = await fetchAPI(`/api/packages?${params.toString()}`);
      return JSON.stringify(data, null, 2);
    }
    case 'install_package': {
      const data = await fetchAPI('/api/packages/install', {
        method: 'POST',
        body: {
          project_id: args.project_id,
          package_slug: args.package_slug,
          version: args.version || undefined,
        },
      });
      return JSON.stringify(data, null, 2);
    }
    case 'export_package': {
      const data = await fetchAPI('/api/packages/export', {
        method: 'POST',
        body: { project_id: args.project_id },
      });
      return JSON.stringify(data, null, 2);
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// MCP stdio protocol handler
process.stdin.setEncoding('utf-8');
let buffer = '';

process.stdin.on('data', async (chunk: string) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const message = JSON.parse(line);
      await handleMessage(message);
    } catch (e) {
      // Skip invalid JSON
    }
  }
});

async function handleMessage(message: { id?: number; method: string; params?: Record<string, unknown> }) {
  const { id, method, params } = message;

  switch (method) {
    case 'initialize':
      respond(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'linkmap-mcp', version: '0.2.0' },
      });
      break;

    case 'tools/list':
      respond(id, { tools });
      break;

    case 'tools/call': {
      const { name, arguments: args } = params as { name: string; arguments: Record<string, string> };
      try {
        const result = await handleToolCall(name, args || {});
        respond(id, { content: [{ type: 'text', text: result }] });
      } catch (e) {
        respond(id, { content: [{ type: 'text', text: `Error: ${(e as Error).message}` }], isError: true });
      }
      break;
    }

    default:
      respond(id, { error: { code: -32601, message: `Method not found: ${method}` } });
  }
}

function respond(id: number | undefined, result: unknown) {
  const response = JSON.stringify({ jsonrpc: '2.0', id, result });
  process.stdout.write(response + '\n');
}

console.error('Linkmap MCP Server started');

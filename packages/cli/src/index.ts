#!/usr/bin/env node

/**
 * Linkmap CLI
 *
 * Commands:
 *   linkmap login              - Authenticate with Linkmap
 *   linkmap pull [project]     - Pull .env file from Linkmap
 *   linkmap check              - Check for missing environment variables
 *   linkmap list               - List your projects
 *   linkmap init [template]    - Initialize linkmap.json
 *   linkmap export             - Export project as linkmap.json
 *   linkmap apply [file]       - Apply linkmap.json to project
 *   linkmap install <name>     - Install package from registry
 *   linkmap publish            - Publish linkmap.json to registry
 *   linkmap search <query>     - Search packages in registry
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.linkmap');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const API_URL = process.env.LINKMAP_API_URL || 'https://linkmap.vercel.app';

interface Config {
  token?: string;
  defaultProject?: string;
}

interface LinkmapJsonService {
  slug: string;
  required: boolean;
  env_vars: { key: string; description: string; public: boolean; default_value?: string; environment: string[] }[];
  notes?: string;
}

interface LinkmapJsonSnippet {
  path: string;
  content: string;
  strategy: 'create' | 'merge' | 'append';
  description: string;
}

interface LinkmapJson {
  name: string;
  version: string;
  description: string;
  description_ko?: string;
  author?: string;
  tags?: string[];
  tech_stack?: Record<string, string>;
  services: LinkmapJsonService[];
  code_snippets?: LinkmapJsonSnippet[];
}

function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function getToken(): string {
  const config = loadConfig();
  const token = process.env.LINKMAP_TOKEN || config.token;
  if (!token) {
    console.error('Error: Not authenticated. Run `linkmap login` first.');
    process.exit(1);
  }
  return token;
}

async function fetchAPI(path: string, token: string, options?: { method?: string; body?: unknown }) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method: options?.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `API Error ${res.status}`;
    try {
      const json = JSON.parse(text);
      msg = json.error || msg;
    } catch {
      msg = text || msg;
    }
    throw new Error(msg);
  }
  return res.json();
}

// ---------- Existing commands ----------

async function login() {
  console.log('Linkmap Login');
  console.log('============');
  console.log('');
  console.log('1. Go to https://linkmap.vercel.app/settings/tokens');
  console.log('2. Create a new API token');
  console.log('3. Set the LINKMAP_TOKEN environment variable:');
  console.log('');
  console.log('   export LINKMAP_TOKEN=your_token_here');
  console.log('');
  console.log('Or save it to ~/.linkmap/config.json:');
  console.log(`   mkdir -p ${CONFIG_DIR}`);
  console.log(`   echo '{"token":"your_token"}' > ${CONFIG_FILE}`);
}

async function pull(projectId?: string) {
  const token = getToken();
  const config = loadConfig();

  const pid = projectId || config.defaultProject;
  if (!pid) {
    console.error('Error: No project specified. Usage: linkmap pull <project-id>');
    process.exit(1);
  }

  console.log(`Pulling environment variables for project ${pid}...`);

  try {
    const data = await fetchAPI(`/env/download?project_id=${pid}&environment=development`, token);
    const envContent = data.content || '';
    writeFileSync('.env', envContent);
    console.log('Written to .env');
  } catch (error) {
    console.error(`Failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function check() {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    console.log('No .env file found in current directory.');
    return;
  }

  const envContent = readFileSync(envPath, 'utf-8');
  const localVars = new Set(
    envContent
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#'))
      .map((line) => line.split('=')[0].trim())
  );

  console.log(`Found ${localVars.size} variables in .env`);

  const envExamplePath = join(process.cwd(), '.env.example');
  if (existsSync(envExamplePath)) {
    const exampleContent = readFileSync(envExamplePath, 'utf-8');
    const exampleVars = new Set(
      exampleContent
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'))
        .map((line) => line.split('=')[0].trim())
    );

    const missing = [...exampleVars].filter((v) => !localVars.has(v));
    if (missing.length > 0) {
      console.log(`\nMissing variables (from .env.example):`);
      missing.forEach((v) => console.log(`  - ${v}`));
    } else {
      console.log('\nAll variables from .env.example are present.');
    }
  }

  const emptyVars = envContent
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .filter((line) => {
      const [, value] = line.split('=');
      return !value || value.trim() === '' || value.trim() === '""';
    })
    .map((line) => line.split('=')[0].trim());

  if (emptyVars.length > 0) {
    console.log(`\nVariables with empty values:`);
    emptyVars.forEach((v) => console.log(`  - ${v}`));
  }
}

async function listProjects() {
  const token = getToken();

  try {
    const data = await fetchAPI('/projects', token);
    const projects = data.projects || data || [];
    console.log('Your projects:');
    console.log('');
    for (const p of projects) {
      console.log(`  ${p.id}  ${p.name}`);
    }
  } catch (error) {
    console.error(`Failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// ---------- New package commands ----------

async function init(template?: string) {
  const outputPath = join(process.cwd(), 'linkmap.json');
  if (existsSync(outputPath)) {
    console.error('Error: linkmap.json already exists in this directory.');
    process.exit(1);
  }

  const config: LinkmapJson = {
    name: template || 'my-project',
    version: '1.0.0',
    description: 'A Linkmap service package',
    services: [],
  };

  if (template) {
    // 레지스트리에서 템플릿 조회
    try {
      const token = getToken();
      const data = await fetchAPI(`/packages/${template}`, token);
      const versions = data.versions || [];
      if (versions.length > 0) {
        const latest = versions[0].config as LinkmapJson;
        writeFileSync(outputPath, JSON.stringify(latest, null, 2));
        console.log(`Initialized linkmap.json from template "${template}" (v${versions[0].version})`);
        return;
      }
    } catch {
      console.log(`Template "${template}" not found in registry. Creating blank config.`);
    }
  }

  writeFileSync(outputPath, JSON.stringify(config, null, 2));
  console.log('Created linkmap.json');
  console.log('');
  console.log('Edit the file to add services and their environment variables.');
}

async function exportProject() {
  const token = getToken();
  const config = loadConfig();
  const pid = config.defaultProject;

  if (!pid) {
    console.error('Error: No default project set. Specify project in config or use linkmap pull first.');
    process.exit(1);
  }

  console.log(`Exporting project ${pid} as linkmap.json...`);

  try {
    const data = await fetchAPI('/packages/export', token, {
      method: 'POST',
      body: { project_id: pid },
    });

    const outputPath = join(process.cwd(), 'linkmap.json');
    writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log('Exported to linkmap.json');
  } catch (error) {
    console.error(`Failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function apply(filePath?: string) {
  const configPath = filePath || join(process.cwd(), 'linkmap.json');
  if (!existsSync(configPath)) {
    console.error(`Error: File not found: ${configPath}`);
    process.exit(1);
  }

  const linkmapConfig: LinkmapJson = JSON.parse(readFileSync(configPath, 'utf-8'));

  console.log(`Applying package "${linkmapConfig.name}" v${linkmapConfig.version}...`);
  console.log(`  Services: ${linkmapConfig.services.map((s) => s.slug).join(', ')}`);

  // 코드 스니펫 적용
  if (linkmapConfig.code_snippets && linkmapConfig.code_snippets.length > 0) {
    console.log(`\nApplying ${linkmapConfig.code_snippets.length} code snippet(s)...`);

    for (const snippet of linkmapConfig.code_snippets) {
      const targetPath = join(process.cwd(), snippet.path);
      const targetDir = dirname(targetPath);

      if (snippet.strategy === 'create') {
        if (existsSync(targetPath)) {
          console.log(`  SKIP ${snippet.path} (already exists)`);
          continue;
        }
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }
        writeFileSync(targetPath, snippet.content);
        console.log(`  CREATE ${snippet.path}`);
      } else if (snippet.strategy === 'append') {
        const existing = existsSync(targetPath) ? readFileSync(targetPath, 'utf-8') : '';
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }
        writeFileSync(targetPath, existing + '\n' + snippet.content);
        console.log(`  APPEND ${snippet.path}`);
      } else if (snippet.strategy === 'merge') {
        if (!existsSync(targetPath)) {
          if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
          }
          writeFileSync(targetPath, snippet.content);
          console.log(`  CREATE ${snippet.path} (merge target not found)`);
        } else {
          const existing = readFileSync(targetPath, 'utf-8');
          if (!existing.includes(snippet.content.trim().split('\n')[0])) {
            writeFileSync(targetPath, existing + '\n' + snippet.content);
            console.log(`  MERGE ${snippet.path}`);
          } else {
            console.log(`  SKIP ${snippet.path} (content already present)`);
          }
        }
      }
    }
  }

  // .env.example 생성/갱신
  const envExamplePath = join(process.cwd(), '.env.example');
  const envLines: string[] = [];

  for (const svc of linkmapConfig.services) {
    if (svc.env_vars.length === 0) continue;
    envLines.push(`# --- ${svc.slug} ---`);
    for (const ev of svc.env_vars) {
      if (ev.description) envLines.push(`# ${ev.description}`);
      envLines.push(`${ev.key}=${ev.default_value || ''}`);
    }
    envLines.push('');
  }

  if (envLines.length > 0) {
    if (existsSync(envExamplePath)) {
      const existing = readFileSync(envExamplePath, 'utf-8');
      const newContent = envLines.join('\n');
      // 기존 내용에 없는 변수만 추가
      const existingKeys = new Set(
        existing.split('\n')
          .filter((l) => l.trim() && !l.startsWith('#'))
          .map((l) => l.split('=')[0].trim())
      );
      const toAdd = envLines.filter((l) => {
        if (l.startsWith('#') || !l.includes('=')) return false;
        return !existingKeys.has(l.split('=')[0].trim());
      });
      if (toAdd.length > 0) {
        writeFileSync(envExamplePath, existing + '\n' + toAdd.join('\n') + '\n');
        console.log(`\nUpdated .env.example (+${toAdd.length} variables)`);
      }
    } else {
      writeFileSync(envExamplePath, envLines.join('\n'));
      console.log('\nCreated .env.example');
    }
  }

  console.log('\nDone! Fill in the environment variable values in your .env file.');
}

async function install(nameArg: string) {
  if (!nameArg) {
    console.error('Usage: linkmap install <package-name>[@version]');
    process.exit(1);
  }

  const [name, version] = nameArg.split('@');
  const token = getToken();
  const config = loadConfig();

  console.log(`Fetching package "${name}"${version ? ` v${version}` : ''}...`);

  try {
    // 패키지 상세 조회
    const pkg = await fetchAPI(`/packages/${name}`, token);
    const versions = pkg.versions || [];

    let targetVersion = versions[0]; // 최신
    if (version) {
      targetVersion = versions.find((v: { version: string }) => v.version === version);
      if (!targetVersion) {
        console.error(`Version ${version} not found. Available: ${versions.map((v: { version: string }) => v.version).join(', ')}`);
        process.exit(1);
      }
    }

    if (!targetVersion) {
      console.error('No versions available for this package.');
      process.exit(1);
    }

    const linkmapConfig = targetVersion.config as LinkmapJson;

    // linkmap.json 저장
    const outputPath = join(process.cwd(), 'linkmap.json');
    writeFileSync(outputPath, JSON.stringify(linkmapConfig, null, 2));
    console.log(`Downloaded linkmap.json (v${targetVersion.version})`);

    // 서비스를 프로젝트에 적용 (default project가 있으면)
    if (config.defaultProject) {
      console.log(`\nInstalling to project ${config.defaultProject}...`);
      try {
        const result = await fetchAPI('/packages/install', token, {
          method: 'POST',
          body: {
            project_id: config.defaultProject,
            package_slug: name,
            version: targetVersion.version,
          },
        });
        console.log(`  Added: ${result.services_added.join(', ') || 'none'}`);
        if (result.services_skipped.length > 0) {
          console.log(`  Skipped (already connected): ${result.services_skipped.join(', ')}`);
        }
        if (result.env_vars_created.length > 0) {
          console.log(`  Env vars created: ${result.env_vars_created.length}`);
        }
      } catch (err) {
        console.log(`  Warning: Could not install to project: ${(err as Error).message}`);
      }
    }

    // 코드 스니펫 적용
    await apply(outputPath);
  } catch (error) {
    console.error(`Failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function publish() {
  const configPath = join(process.cwd(), 'linkmap.json');
  if (!existsSync(configPath)) {
    console.error('Error: No linkmap.json found. Run `linkmap init` first.');
    process.exit(1);
  }

  const token = getToken();
  const linkmapConfig: LinkmapJson = JSON.parse(readFileSync(configPath, 'utf-8'));

  console.log(`Publishing "${linkmapConfig.name}" v${linkmapConfig.version}...`);

  try {
    // 패키지가 이미 존재하는지 확인
    let existing = false;
    try {
      await fetchAPI(`/packages/${linkmapConfig.name}`, token);
      existing = true;
    } catch {
      existing = false;
    }

    if (existing) {
      // 새 버전 발행
      await fetchAPI(`/packages/${linkmapConfig.name}/versions`, token, {
        method: 'POST',
        body: { config: linkmapConfig },
      });
      console.log(`Published new version v${linkmapConfig.version}`);
    } else {
      // 새 패키지 생성
      await fetchAPI('/packages', token, {
        method: 'POST',
        body: { config: linkmapConfig, is_public: true },
      });
      console.log(`Created and published package "${linkmapConfig.name}" v${linkmapConfig.version}`);
    }

    console.log(`\nOthers can install with: linkmap install ${linkmapConfig.name}`);
  } catch (error) {
    console.error(`Failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function search(query: string) {
  if (!query) {
    console.error('Usage: linkmap search <query>');
    process.exit(1);
  }

  const token = getToken();

  try {
    const data = await fetchAPI(`/packages?q=${encodeURIComponent(query)}`, token);
    const packages = data.packages || [];

    if (packages.length === 0) {
      console.log(`No packages found for "${query}"`);
      return;
    }

    console.log(`Found ${packages.length} package(s):\n`);
    for (const pkg of packages) {
      const tags = pkg.tags?.length ? ` [${pkg.tags.join(', ')}]` : '';
      console.log(`  ${pkg.slug}  v${pkg.latest_version?.[0]?.version || '?'}  (${pkg.downloads_count} downloads)${tags}`);
      if (pkg.description) {
        console.log(`    ${pkg.description}`);
      }
      console.log('');
    }
  } catch (error) {
    console.error(`Failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// CLI entry point
const [, , command, ...args] = process.argv;

switch (command) {
  case 'login':
    login();
    break;
  case 'pull':
    pull(args[0]);
    break;
  case 'check':
    check();
    break;
  case 'list':
    listProjects();
    break;
  case 'init':
    init(args[0]);
    break;
  case 'export':
    exportProject();
    break;
  case 'apply':
    apply(args[0]);
    break;
  case 'install':
    install(args[0]);
    break;
  case 'publish':
    publish();
    break;
  case 'search':
    search(args.join(' '));
    break;
  default:
    console.log('Linkmap CLI v0.2.0');
    console.log('');
    console.log('Commands:');
    console.log('  linkmap login              Authenticate with Linkmap');
    console.log('  linkmap pull [project]     Pull .env file from Linkmap');
    console.log('  linkmap check              Check for missing env vars');
    console.log('  linkmap list               List your projects');
    console.log('');
    console.log('Package commands:');
    console.log('  linkmap init [template]    Initialize linkmap.json');
    console.log('  linkmap export             Export project as linkmap.json');
    console.log('  linkmap apply [file]       Apply linkmap.json to project');
    console.log('  linkmap install <name>     Install package from registry');
    console.log('  linkmap publish            Publish linkmap.json to registry');
    console.log('  linkmap search <query>     Search packages in registry');
}

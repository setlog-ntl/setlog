import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exportPackageSchema } from '@/lib/validations/package';
import { unauthorizedError, notFoundError, validationError, serverError } from '@/lib/api/errors';
import type { LinkmapConfig, PackageServiceDef } from '@/types/package';

// POST /api/packages/export — 기존 프로젝트 → linkmap.json 생성
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const body = await request.json();
  const parsed = exportPackageSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_id, name, description } = parsed.data;

  // 프로젝트 조회
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description, tech_stack')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) return notFoundError('프로젝트');

  // 프로젝트 서비스 + 서비스 정보 조회
  const { data: projectServices } = await supabase
    .from('project_services')
    .select('*, service:services(*)')
    .eq('project_id', project_id);

  if (!projectServices || projectServices.length === 0) {
    return NextResponse.json(
      { error: '프로젝트에 연결된 서비스가 없습니다' },
      { status: 400 }
    );
  }

  // 환경변수 조회 (키 이름만, 값 제외)
  const { data: envVars } = await supabase
    .from('environment_variables')
    .select('key_name, service_id, environment, is_secret, description')
    .eq('project_id', project_id);

  const envVarsByService = new Map<string, typeof envVars>();
  for (const ev of envVars || []) {
    const key = ev.service_id || '__project__';
    if (!envVarsByService.has(key)) envVarsByService.set(key, []);
    envVarsByService.get(key)!.push(ev);
  }

  // linkmap.json 구성
  const slug = name || project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const services: PackageServiceDef[] = projectServices.map((ps) => {
    const svcEnvVars = envVarsByService.get(ps.service_id) || [];
    const envGroups = new Map<string, { key: string; description: string; public: boolean; environments: string[] }>();

    for (const ev of svcEnvVars) {
      if (!envGroups.has(ev.key_name)) {
        envGroups.set(ev.key_name, {
          key: ev.key_name,
          description: ev.description || '',
          public: !ev.is_secret,
          environments: [],
        });
      }
      envGroups.get(ev.key_name)!.environments.push(ev.environment);
    }

    return {
      slug: ps.service?.slug || '',
      required: true,
      env_vars: Array.from(envGroups.values()).map((g) => ({
        key: g.key,
        description: g.description,
        public: g.public,
        environment: g.environments as ('development' | 'staging' | 'production')[],
      })),
      notes: ps.notes || undefined,
    };
  }).filter((s) => s.slug);

  const config: LinkmapConfig = {
    name: slug,
    version: '1.0.0',
    description: description || project.description || `${project.name} 서비스 패키지`,
    tech_stack: project.tech_stack || {},
    services,
  };

  return NextResponse.json(config);
}

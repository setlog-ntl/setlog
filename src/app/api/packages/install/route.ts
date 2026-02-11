import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { installPackageSchema } from '@/lib/validations/package';
import { unauthorizedError, notFoundError, validationError, apiError, serverError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import type { LinkmapConfig, InstallResult } from '@/types/package';

// POST /api/packages/install — 프로젝트에 패키지 적용
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`pkg:install:${user.id}`, 20);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const body = await request.json();
  const parsed = installPackageSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_id, package_slug, version: requestedVersion } = parsed.data;

  // 프로젝트 소유권 확인
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) return notFoundError('프로젝트');

  // 패키지 조회
  const { data: pkg } = await supabase
    .from('packages')
    .select('id, slug')
    .eq('slug', package_slug)
    .single();

  if (!pkg) return notFoundError('패키지');

  // 버전 조회 (지정 버전 또는 최신)
  let versionQuery = supabase
    .from('package_versions')
    .select('*')
    .eq('package_id', pkg.id);

  if (requestedVersion) {
    versionQuery = versionQuery.eq('version', requestedVersion);
  } else {
    versionQuery = versionQuery.order('published_at', { ascending: false }).limit(1);
  }

  const { data: versions } = await versionQuery;
  const pkgVersion = versions?.[0];
  if (!pkgVersion) return notFoundError('패키지 버전');

  const config = pkgVersion.config as unknown as LinkmapConfig;

  // 기존 프로젝트 서비스 조회
  const { data: existingServices } = await supabase
    .from('project_services')
    .select('service_id, service:services(slug)')
    .eq('project_id', project_id);

  const existingSlugs = new Set(
    (existingServices || []).map((ps: Record<string, unknown>) => {
      const svc = ps.service as { slug: string }[] | null;
      return svc?.[0]?.slug;
    }).filter(Boolean)
  );

  const result: InstallResult = {
    services_added: [],
    services_skipped: [],
    env_vars_created: [],
    code_snippets: config.code_snippets || [],
  };

  // 각 서비스 처리
  for (const svc of config.services) {
    if (existingSlugs.has(svc.slug)) {
      result.services_skipped.push(svc.slug);
      continue;
    }

    // services 테이블에서 service_id 조회
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('slug', svc.slug)
      .single();

    if (!service) {
      result.services_skipped.push(svc.slug);
      continue;
    }

    // project_services에 추가
    const { error: psError } = await supabase
      .from('project_services')
      .insert({
        project_id,
        service_id: service.id,
        status: 'not_started',
        notes: svc.notes || null,
      });

    if (psError) {
      result.services_skipped.push(svc.slug);
      continue;
    }

    result.services_added.push(svc.slug);

    // env var 템플릿 생성 (빈 값으로)
    for (const envVar of svc.env_vars) {
      for (const env of envVar.environment) {
        const { error: evError } = await supabase
          .from('environment_variables')
          .insert({
            project_id,
            service_id: service.id,
            key_name: envVar.key,
            encrypted_value: '',
            environment: env,
            is_secret: !envVar.public,
            description: envVar.description,
          });

        if (!evError) {
          result.env_vars_created.push(`${envVar.key} (${env})`);
        }
      }
    }
  }

  // 설치 기록
  await supabase.from('package_installations').insert({
    package_id: pkg.id,
    package_version_id: pkgVersion.id,
    project_id,
    user_id: user.id,
  });

  // 다운로드 수 증가 (직접 SQL 업데이트)
  await supabase
    .from('packages')
    .update({ downloads_count: (pkg as unknown as { downloads_count: number }).downloads_count + 1 })
    .eq('id', pkg.id);

  await logAudit(user.id, {
    action: 'connection.create',
    resourceType: 'package_installation',
    resourceId: pkg.id,
    details: {
      package_slug,
      version: pkgVersion.version,
      services_added: result.services_added,
      services_skipped: result.services_skipped,
    },
  });

  return NextResponse.json(result, { status: 201 });
}

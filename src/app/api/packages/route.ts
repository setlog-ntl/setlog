import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPackageSchema } from '@/lib/validations/package';
import { unauthorizedError, validationError, apiError, serverError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';

// GET /api/packages — 공개 패키지 목록 (검색, 태그 필터, 정렬)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'popular'; // popular | newest
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('packages')
    .select('*, latest_version:package_versions(id, version, published_at)', { count: 'exact' })
    .eq('is_public', true);

  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,description_ko.ilike.%${query}%`);
  }

  if (tag) {
    dbQuery = dbQuery.contains('tags', [tag]);
  }

  if (sort === 'newest') {
    dbQuery = dbQuery.order('created_at', { ascending: false });
  } else {
    dbQuery = dbQuery.order('downloads_count', { ascending: false });
  }

  dbQuery = dbQuery
    .order('published_at', { referencedTable: 'package_versions', ascending: false })
    .limit(1, { referencedTable: 'package_versions' })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) return serverError(error.message);

  return NextResponse.json({
    packages: data || [],
    total: count || 0,
    page,
    limit,
  });
}

// POST /api/packages — 패키지 생성
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`pkg:create:${user.id}`, 10);
  if (!success) return apiError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);

  const body = await request.json();
  const parsed = createPackageSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { config, is_public } = parsed.data;

  // slug 중복 확인
  const { data: existing } = await supabase
    .from('packages')
    .select('id')
    .eq('slug', config.name)
    .single();

  if (existing) {
    return apiError('이미 존재하는 패키지 이름입니다', 409);
  }

  // 패키지 생성
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .insert({
      slug: config.name,
      name: config.name,
      description: config.description,
      description_ko: config.description_ko || null,
      author_id: user.id,
      is_public,
      tags: config.tags || [],
      tech_stack: config.tech_stack || {},
    })
    .select()
    .single();

  if (pkgError) return serverError(pkgError.message);

  // 첫 번째 버전 생성
  const { data: version, error: verError } = await supabase
    .from('package_versions')
    .insert({
      package_id: pkg.id,
      version: config.version,
      config: config as unknown as Record<string, unknown>,
    })
    .select()
    .single();

  if (verError) return serverError(verError.message);

  return NextResponse.json({ package: pkg, version }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { publishVersionSchema } from '@/lib/validations/package';
import { unauthorizedError, notFoundError, validationError, apiError, serverError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';

// GET /api/packages/[slug]/versions — 버전 목록
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { data: pkg } = await supabase
    .from('packages')
    .select('id, is_public, author_id')
    .eq('slug', slug)
    .single();

  if (!pkg) return notFoundError('패키지');
  if (!pkg.is_public && pkg.author_id !== user.id) return notFoundError('패키지');

  const { data: versions, error } = await supabase
    .from('package_versions')
    .select('*')
    .eq('package_id', pkg.id)
    .order('published_at', { ascending: false });

  if (error) return serverError(error.message);

  return NextResponse.json(versions || []);
}

// POST /api/packages/[slug]/versions — 새 버전 발행
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`pkg:publish:${user.id}`, 10);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  const body = await request.json();
  const parsed = publishVersionSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { data: pkg } = await supabase
    .from('packages')
    .select('id, author_id')
    .eq('slug', slug)
    .single();

  if (!pkg || pkg.author_id !== user.id) return notFoundError('패키지');

  // 버전 중복 확인
  const { data: existing } = await supabase
    .from('package_versions')
    .select('id')
    .eq('package_id', pkg.id)
    .eq('version', parsed.data.config.version)
    .single();

  if (existing) {
    return apiError(`버전 ${parsed.data.config.version}은 이미 존재합니다`, 409);
  }

  const { data: version, error } = await supabase
    .from('package_versions')
    .insert({
      package_id: pkg.id,
      version: parsed.data.config.version,
      config: parsed.data.config as unknown as Record<string, unknown>,
      changelog: parsed.data.changelog || null,
    })
    .select()
    .single();

  if (error) return serverError(error.message);

  return NextResponse.json(version, { status: 201 });
}

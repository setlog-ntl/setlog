import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updatePackageSchema } from '@/lib/validations/package';
import { unauthorizedError, notFoundError, validationError, serverError } from '@/lib/api/errors';

// GET /api/packages/[slug] — 패키지 상세 + 버전 목록
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { data: pkg, error } = await supabase
    .from('packages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !pkg) return notFoundError('패키지');

  // 비공개 패키지는 소유자만 접근
  if (!pkg.is_public && pkg.author_id !== user.id) {
    return notFoundError('패키지');
  }

  // 버전 목록
  const { data: versions } = await supabase
    .from('package_versions')
    .select('*')
    .eq('package_id', pkg.id)
    .order('published_at', { ascending: false });

  return NextResponse.json({ ...pkg, versions: versions || [] });
}

// PATCH /api/packages/[slug] — 패키지 메타데이터 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const body = await request.json();
  const parsed = updatePackageSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { data: pkg } = await supabase
    .from('packages')
    .select('id, author_id')
    .eq('slug', slug)
    .single();

  if (!pkg || pkg.author_id !== user.id) return notFoundError('패키지');

  const updates: Record<string, unknown> = {};
  const input = parsed.data;
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.description_ko !== undefined) updates.description_ko = input.description_ko;
  if (input.is_public !== undefined) updates.is_public = input.is_public;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.tech_stack !== undefined) updates.tech_stack = input.tech_stack;

  const { data, error } = await supabase
    .from('packages')
    .update(updates)
    .eq('id', pkg.id)
    .select()
    .single();

  if (error) return serverError(error.message);

  return NextResponse.json(data);
}

// DELETE /api/packages/[slug] — 패키지 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { data: pkg } = await supabase
    .from('packages')
    .select('id, author_id')
    .eq('slug', slug)
    .single();

  if (!pkg || pkg.author_id !== user.id) return notFoundError('패키지');

  const { error } = await supabase.from('packages').delete().eq('id', pkg.id);
  if (error) return serverError(error.message);

  return NextResponse.json({ success: true });
}

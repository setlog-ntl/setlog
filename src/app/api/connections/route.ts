import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createConnectionSchema } from '@/lib/validations/connection';
import { unauthorizedError, validationError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const projectId = request.nextUrl.searchParams.get('project_id');
  if (!projectId) return apiError('project_id가 필요합니다', 400);

  const { data, error } = await supabase
    .from('user_connections')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at');

  if (error) return apiError(error.message, 400);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`conn:${user.id}`, 30);
  if (!success) return apiError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);

  const body = await request.json();
  const parsed = createConnectionSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_id, source_service_id, target_service_id, connection_type, label } = parsed.data;

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) return apiError('프로젝트를 찾을 수 없습니다', 404);

  const { data, error } = await supabase
    .from('user_connections')
    .insert({
      project_id,
      source_service_id,
      target_service_id,
      connection_type,
      label: label || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return apiError('이미 동일한 연결이 존재합니다', 409);
    }
    return apiError(error.message, 400);
  }

  await logAudit(user.id, {
    action: 'connection.create',
    resourceType: 'user_connection',
    resourceId: data.id,
    details: { project_id, source_service_id, target_service_id, connection_type },
  });

  return NextResponse.json(data, { status: 201 });
}

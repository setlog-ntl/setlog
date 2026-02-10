import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateConnectionSchema } from '@/lib/validations/connection';
import { unauthorizedError, validationError, apiError } from '@/lib/api/errors';
import { logAudit } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { id } = await params;

  const body = await request.json();
  const parsed = updateConnectionSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  // Verify ownership via project
  const { data: connection } = await supabase
    .from('user_connections')
    .select('*, project:projects!inner(user_id)')
    .eq('id', id)
    .single();

  if (!connection || (connection.project as { user_id: string }).user_id !== user.id) {
    return apiError('연결을 찾을 수 없습니다', 404);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.connection_type !== undefined) updates.connection_type = parsed.data.connection_type;
  if (parsed.data.label !== undefined) updates.label = parsed.data.label;

  const { data, error } = await supabase
    .from('user_connections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return apiError(error.message, 400);

  await logAudit(user.id, {
    action: 'connection.update',
    resourceType: 'user_connection',
    resourceId: id,
    details: { updated_fields: Object.keys(updates).filter(k => k !== 'updated_at') },
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { id } = await params;

  // Verify ownership via project
  const { data: connection } = await supabase
    .from('user_connections')
    .select('*, project:projects!inner(user_id)')
    .eq('id', id)
    .single();

  if (!connection || (connection.project as { user_id: string }).user_id !== user.id) {
    return apiError('연결을 찾을 수 없습니다', 404);
  }

  const { error } = await supabase.from('user_connections').delete().eq('id', id);
  if (error) return apiError(error.message, 400);

  await logAudit(user.id, {
    action: 'connection.delete',
    resourceType: 'user_connection',
    resourceId: id,
    details: { project_id: connection.project_id },
  });

  return NextResponse.json({ success: true });
}

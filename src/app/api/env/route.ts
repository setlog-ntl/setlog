import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/crypto';
import { createEnvVarSchema, updateEnvVarSchema } from '@/lib/validations/env';
import { unauthorizedError, notFoundError, validationError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { triggerAutoSync } from '@/lib/github/auto-sync';
import type { DbEnvVarWithProject } from '@/lib/supabase/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`env:${user.id}`, 30);
  if (!success) return apiError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);

  const body = await request.json();
  const parsed = createEnvVarSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_id, service_id, key_name, value, environment, is_secret, description } = parsed.data;

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) return notFoundError('프로젝트');

  const encrypted_value = encrypt(value);

  const { data, error } = await supabase
    .from('environment_variables')
    .insert({
      project_id,
      service_id: service_id || null,
      key_name,
      encrypted_value,
      environment,
      is_secret,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAudit(user.id, {
    action: 'env_var.create',
    resourceType: 'environment_variable',
    resourceId: data.id,
    details: { key_name, project_id },
  });

  // Trigger auto-sync to GitHub (non-blocking)
  triggerAutoSync(project_id, environment, user.id).catch(() => {});

  return NextResponse.json({ ...data, decrypted_value: value });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const body = await request.json();
  const parsed = updateEnvVarSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { id, key_name, value, environment, is_secret, description } = parsed.data;

  const { data: envVar } = await supabase
    .from('environment_variables')
    .select('*, project:projects!inner(user_id)')
    .eq('id', id)
    .single();

  const envVarTyped = envVar as DbEnvVarWithProject | null;
  if (!envVarTyped || envVarTyped.project.user_id !== user.id) {
    return notFoundError('환경변수');
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (key_name !== undefined) updates.key_name = key_name;
  if (value !== undefined) updates.encrypted_value = encrypt(value);
  if (environment !== undefined) updates.environment = environment;
  if (is_secret !== undefined) updates.is_secret = is_secret;
  if (description !== undefined) updates.description = description;

  const { data, error } = await supabase
    .from('environment_variables')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAudit(user.id, {
    action: 'env_var.update',
    resourceType: 'environment_variable',
    resourceId: id,
    details: { updated_fields: Object.keys(updates).filter(k => k !== 'updated_at') },
  });

  // Trigger auto-sync (non-blocking)
  if (data) {
    triggerAutoSync(envVarTyped.project_id, data.environment, user.id).catch(() => {});
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID가 필요합니다' }, { status: 400 });
  }

  const { data: envVar } = await supabase
    .from('environment_variables')
    .select('*, project:projects!inner(user_id)')
    .eq('id', id)
    .single();

  const envVarDel = envVar as DbEnvVarWithProject | null;
  if (!envVarDel || envVarDel.project.user_id !== user.id) {
    return notFoundError('환경변수');
  }

  const { error } = await supabase.from('environment_variables').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAudit(user.id, {
    action: 'env_var.delete',
    resourceType: 'environment_variable',
    resourceId: id,
    details: { key_name: envVarDel.key_name },
  });

  // Trigger auto-sync (non-blocking)
  triggerAutoSync(envVarDel.project_id, envVarDel.environment, user.id).catch(() => {});

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { project_id, service_id, key_name, value, environment, is_secret, description } = body;

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const encrypted_value = encrypt(value || '');

  const { data, error } = await supabase
    .from('environment_variables')
    .insert({
      project_id,
      service_id: service_id || null,
      key_name,
      encrypted_value,
      environment: environment || 'development',
      is_secret: is_secret ?? true,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ...data, decrypted_value: value });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, key_name, value, environment, is_secret, description } = body;

  // Verify ownership through project
  const { data: envVar } = await supabase
    .from('environment_variables')
    .select('*, project:projects!inner(user_id)')
    .eq('id', id)
    .single();

  if (!envVar || (envVar as { project: { user_id: string } }).project.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
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

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // Verify ownership
  const { data: envVar } = await supabase
    .from('environment_variables')
    .select('*, project:projects!inner(user_id)')
    .eq('id', id)
    .single();

  if (!envVar || (envVar as { project: { user_id: string } }).project.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error } = await supabase.from('environment_variables').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

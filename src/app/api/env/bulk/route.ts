import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/crypto';
import { bulkEnvVarSchema } from '@/lib/validations/env-bulk';
import { unauthorizedError, notFoundError, validationError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`env-bulk:${user.id}`, 10);
  if (!success) return apiError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('잘못된 요청 형식입니다', 400);
  }

  const parsed = bulkEnvVarSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_id, variables } = parsed.data;

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) return notFoundError('프로젝트');

  // Insert all variables
  const records = variables.map((v) => ({
    project_id,
    service_id: null,
    key_name: v.key_name,
    encrypted_value: encrypt(v.value),
    environment: v.environment,
    is_secret: v.is_secret,
    description: v.description || null,
  }));

  const { data, error } = await supabase
    .from('environment_variables')
    .insert(records)
    .select();

  if (error) {
    return apiError('환경변수 저장에 실패했습니다', 400);
  }

  await logAudit(user.id, {
    action: 'env_var.bulk_create',
    resourceType: 'environment_variable',
    details: {
      project_id,
      count: variables.length,
      key_names: variables.map((v) => v.key_name),
    },
  });

  return NextResponse.json({ created: data?.length || 0, ids: data?.map((d) => d.id) || [] });
}

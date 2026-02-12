import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/crypto';
import { unauthorizedError, notFoundError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';
import type { DbEnvVarWithProject } from '@/lib/supabase/types';

const decryptRequestSchema = z.object({
  id: z.string().uuid('유효한 환경변수 ID가 필요합니다'),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`decrypt:${user.id}`, 20);
  if (!success) return apiError('요청이 너무 많습니다.', 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('유효하지 않은 JSON 형식입니다', 400);
  }

  const parsed = decryptRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400);
  }

  const { id } = parsed.data;

  const { data: envVar } = await supabase
    .from('environment_variables')
    .select('*, project:projects!inner(user_id)')
    .eq('id', id)
    .single();

  const envVarTyped = envVar as DbEnvVarWithProject | null;
  if (!envVarTyped || envVarTyped.project.user_id !== user.id) {
    return notFoundError('환경변수');
  }

  const decryptedValue = decrypt(envVarTyped.encrypted_value);

  await logAudit(user.id, {
    action: 'env_var.decrypt',
    resourceType: 'environment_variable',
    resourceId: id,
    details: { key_name: envVarTyped.key_name },
  });

  return NextResponse.json({ value: decryptedValue });
}

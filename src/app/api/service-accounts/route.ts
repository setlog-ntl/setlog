import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connectApiKeySchema } from '@/lib/validations/service-account';
import { unauthorizedError, validationError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { encrypt } from '@/lib/crypto';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const projectId = request.nextUrl.searchParams.get('project_id');
  if (!projectId) return apiError('project_id가 필요합니다', 400);

  // 토큰 필드는 제외하고 반환
  const { data, error } = await supabase
    .from('service_accounts')
    .select('id, project_id, service_id, user_id, connection_type, token_expires_at, oauth_scopes, oauth_provider_user_id, oauth_metadata, api_key_label, status, last_verified_at, error_message, created_at, updated_at')
    .eq('project_id', projectId)
    .order('created_at');

  if (error) {
    // 테이블이 아직 존재하지 않는 경우 빈 배열 반환 (마이그레이션 미실행)
    if (error.code === '42P01' || error.message?.includes('relation') || error.code === 'PGRST204') {
      return NextResponse.json([]);
    }
    return apiError(error.message, 400);
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`sa:${user.id}`, 30);
  if (!success) return apiError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);

  const body = await request.json();
  const parsed = connectApiKeySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_id, service_id, api_keys, api_key_label } = parsed.data;

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) return apiError('프로젝트를 찾을 수 없습니다', 404);

  // Encrypt API keys as JSON
  const encryptedApiKey = encrypt(JSON.stringify(api_keys));

  // Upsert: 이미 연결된 경우 업데이트
  const { data, error } = await supabase
    .from('service_accounts')
    .upsert(
      {
        project_id,
        service_id,
        user_id: user.id,
        connection_type: 'api_key' as const,
        encrypted_api_key: encryptedApiKey,
        api_key_label: api_key_label || Object.keys(api_keys).join(', '),
        status: 'active' as const,
        last_verified_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,service_id' }
    )
    .select('id, project_id, service_id, user_id, connection_type, api_key_label, status, last_verified_at, error_message, created_at, updated_at')
    .single();

  if (error) return apiError(error.message, 400);

  await logAudit(user.id, {
    action: 'service_account.connect_api_key',
    resourceType: 'service_account',
    resourceId: data.id,
    details: { project_id, service_id, key_count: Object.keys(api_keys).length },
  });

  return NextResponse.json(data, { status: 201 });
}

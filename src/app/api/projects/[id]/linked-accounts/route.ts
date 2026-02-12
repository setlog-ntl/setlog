import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, apiError } from '@/lib/api/errors';
import { mapServiceAccountToLinkedAccount } from '@/lib/mappers/linked-account';

/**
 * GET /api/projects/[id]/linked-accounts
 *
 * - 현재 service_accounts 테이블을 조회하여 LinkedAccount 도메인 객체로 변환해 반환한다.
 * - Next.js 16의 RouteHandler 타입에 맞춰 context.params는 Promise 형태로 처리한다.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return unauthorizedError();

  if (!projectId) return apiError('project_id가 필요합니다', 400);

  // 프로젝트 소유권 검증
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single();

  if (!project || project.user_id !== user.id) {
    return apiError('프로젝트를 찾을 수 없습니다', 404);
  }

  const { data, error } = await supabase
    .from('service_accounts')
    .select(
      'id, project_id, service_id, user_id, connection_type, token_expires_at, oauth_scopes, oauth_provider_user_id, oauth_metadata, api_key_label, status, last_verified_at, error_message, created_at, updated_at',
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    if (error.code === '42P01' || error.message?.includes('relation')) {
      // 테이블 미존재 시에도 클라이언트가 깨지지 않도록 빈 배열 반환
      return NextResponse.json({ accounts: [] });
    }
    return apiError(error.message, 400);
  }

  const accounts = (data || []).map((row) => mapServiceAccountToLinkedAccount(row));

  return NextResponse.json({ accounts });
}


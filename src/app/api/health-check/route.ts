import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runHealthCheck } from '@/lib/health-check';
import { runHealthCheckSchema } from '@/lib/validations/health-check';
import { unauthorizedError, notFoundError, validationError, apiError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`health-check:${user.id}`, 5);
  if (!success) return apiError('검증 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);

  const body = await request.json();
  const parsed = runHealthCheckSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { project_service_id, environment } = parsed.data;

  // Verify ownership: project_service → project → user
  const { data: projectService } = await supabase
    .from('project_services')
    .select('*, service:services(*), project:projects!inner(user_id)')
    .eq('id', project_service_id)
    .single();

  if (!projectService || projectService.project.user_id !== user.id) {
    return notFoundError('서비스');
  }

  const service = projectService.service;
  if (!service) {
    return notFoundError('서비스 카탈로그');
  }

  // Get env vars for this project + service + environment
  const { data: envVars = [] } = await supabase
    .from('environment_variables')
    .select('key_name, encrypted_value')
    .eq('project_id', projectService.project_id)
    .eq('environment', environment);

  // Get required env var names from service catalog
  const requiredEnvVarNames = (service.required_env_vars || []).map(
    (v: { name: string }) => v.name
  );

  // Run health check
  const result = await runHealthCheck({
    serviceSlug: service.slug,
    requiredEnvVarNames,
    encryptedEnvVars: envVars || [],
  });

  // Store result using admin client (bypasses RLS for insert)
  const adminSupabase = createAdminClient();
  const { data: healthCheck, error: insertError } = await adminSupabase
    .from('health_checks')
    .insert({
      project_service_id,
      environment,
      status: result.status,
      message: result.message,
      response_time_ms: result.responseTimeMs,
      details: result.details || {},
      checked_at: result.checkedAt,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to save health check result:', insertError);
  }

  // Update project_services status based on health check result
  const newStatus = result.status === 'healthy' ? 'connected' : result.status === 'unhealthy' ? 'error' : projectService.status;
  if (newStatus !== projectService.status) {
    await supabase
      .from('project_services')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', project_service_id);
  }

  // Audit log
  await logAudit(user.id, {
    action: 'service.health_check',
    resourceType: 'project_service',
    resourceId: project_service_id,
    details: {
      service_slug: service.slug,
      environment,
      status: result.status,
      response_time_ms: result.responseTimeMs,
    },
  });

  return NextResponse.json(healthCheck || {
    project_service_id,
    environment,
    ...result,
  });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { searchParams } = new URL(request.url);
  const projectServiceId = searchParams.get('project_service_id');
  if (!projectServiceId) {
    return apiError('project_service_id가 필요합니다', 400);
  }

  // Verify ownership
  const { data: projectService } = await supabase
    .from('project_services')
    .select('*, project:projects!inner(user_id)')
    .eq('id', projectServiceId)
    .single();

  if (!projectService || projectService.project.user_id !== user.id) {
    return notFoundError('서비스');
  }

  const { data: checks, error } = await supabase
    .from('health_checks')
    .select('*')
    .eq('project_service_id', projectServiceId)
    .order('checked_at', { ascending: false })
    .limit(20);

  if (error) {
    return apiError(error.message, 500);
  }

  return NextResponse.json(checks || []);
}

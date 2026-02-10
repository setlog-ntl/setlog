import type { HealthCheckAdapter, HealthCheckResult } from '../types';

export const supabaseAdapter: HealthCheckAdapter = {
  serviceSlug: 'supabase',
  requiredEnvVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  async check(envVars): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const url = envVars.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
      const res = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      const elapsed = Date.now() - start;

      if (res.ok || res.status === 200) {
        return {
          status: 'healthy',
          message: 'Supabase 연결 정상',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
        };
      }

      if (res.status === 401) {
        return {
          status: 'unhealthy',
          message: 'Supabase Anon Key가 유효하지 않습니다',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
        };
      }

      return {
        status: 'degraded',
        message: `Supabase 응답: ${res.status}`,
        responseTimeMs: elapsed,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Supabase 연결 실패',
        responseTimeMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    }
  },
};

import type { HealthCheckAdapter, HealthCheckResult } from '../types';

export const vercelAdapter: HealthCheckAdapter = {
  serviceSlug: 'vercel',
  requiredEnvVars: ['VERCEL_TOKEN'],
  async check(envVars): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch('https://api.vercel.com/v9/projects?limit=1', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${envVars.VERCEL_TOKEN}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      const elapsed = Date.now() - start;

      if (res.ok) {
        return {
          status: 'healthy',
          message: 'Vercel API 연결 정상',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          status: 'unhealthy',
          message: 'Vercel Token이 유효하지 않습니다',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
        };
      }

      return {
        status: 'degraded',
        message: `Vercel API 응답: ${res.status}`,
        responseTimeMs: elapsed,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Vercel API 연결 실패',
        responseTimeMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    }
  },
};

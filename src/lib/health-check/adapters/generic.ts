import type { HealthCheckAdapter, HealthCheckResult } from '../types';

export function createGenericAdapter(slug: string, requiredVars: string[]): HealthCheckAdapter {
  return {
    serviceSlug: slug,
    requiredEnvVars: requiredVars,
    async check(envVars): Promise<HealthCheckResult> {
      const start = Date.now();
      const missing = requiredVars.filter((v) => !envVars[v] || envVars[v].trim() === '');
      const elapsed = Date.now() - start;

      if (missing.length === 0) {
        return {
          status: 'healthy',
          message: '필수 환경변수가 모두 설정되어 있습니다',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
          details: { configuredVars: requiredVars.length, validation: 'env_var_presence' },
        };
      }

      return {
        status: 'unhealthy',
        message: `누락된 환경변수: ${missing.join(', ')}`,
        responseTimeMs: elapsed,
        checkedAt: new Date().toISOString(),
        details: { missingVars: missing },
      };
    },
  };
}

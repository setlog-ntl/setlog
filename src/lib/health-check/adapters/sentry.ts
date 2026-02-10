import type { HealthCheckAdapter, HealthCheckResult } from '../types';

export const sentryAdapter: HealthCheckAdapter = {
  serviceSlug: 'sentry',
  requiredEnvVars: ['SENTRY_DSN'],
  async check(envVars): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const dsn = envVars.SENTRY_DSN;
      // Validate DSN format: https://<key>@<host>/<project-id>
      const dsnPattern = /^https:\/\/[a-f0-9]+@[^/]+\/\d+$/;
      const elapsed = Date.now() - start;

      if (dsnPattern.test(dsn)) {
        return {
          status: 'healthy',
          message: 'Sentry DSN 형식 유효',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
          details: { validation: 'format_check' },
        };
      }

      return {
        status: 'unhealthy',
        message: 'Sentry DSN 형식이 올바르지 않습니다',
        responseTimeMs: elapsed,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Sentry DSN 검증 실패',
        responseTimeMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    }
  },
};

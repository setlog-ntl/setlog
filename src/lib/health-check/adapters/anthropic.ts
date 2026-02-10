import type { HealthCheckAdapter, HealthCheckResult } from '../types';

export const anthropicAdapter: HealthCheckAdapter = {
  serviceSlug: 'anthropic',
  requiredEnvVars: ['ANTHROPIC_API_KEY'],
  async check(envVars): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        method: 'GET',
        headers: {
          'x-api-key': envVars.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        signal: AbortSignal.timeout(10000),
      });

      const elapsed = Date.now() - start;

      if (res.ok) {
        return {
          status: 'healthy',
          message: 'Anthropic API 연결 정상',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
        };
      }

      if (res.status === 401) {
        return {
          status: 'unhealthy',
          message: 'API 키가 유효하지 않습니다',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
        };
      }

      return {
        status: 'degraded',
        message: `Anthropic API 응답: ${res.status}`,
        responseTimeMs: elapsed,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Anthropic API 연결 실패',
        responseTimeMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    }
  },
};

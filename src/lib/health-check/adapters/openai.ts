import type { HealthCheckAdapter, HealthCheckResult } from '../types';

export const openaiAdapter: HealthCheckAdapter = {
  serviceSlug: 'openai',
  requiredEnvVars: ['OPENAI_API_KEY'],
  async check(envVars): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${envVars.OPENAI_API_KEY}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      const elapsed = Date.now() - start;

      if (res.ok) {
        return {
          status: 'healthy',
          message: 'OpenAI API 연결 정상',
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
        message: `OpenAI API 응답: ${res.status}`,
        responseTimeMs: elapsed,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'OpenAI API 연결 실패',
        responseTimeMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    }
  },
};

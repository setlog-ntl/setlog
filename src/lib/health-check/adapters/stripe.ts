import type { HealthCheckAdapter, HealthCheckResult } from '../types';

export const stripeAdapter: HealthCheckAdapter = {
  serviceSlug: 'stripe',
  requiredEnvVars: ['STRIPE_SECRET_KEY'],
  async check(envVars): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch('https://api.stripe.com/v1/balance', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${envVars.STRIPE_SECRET_KEY}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      const elapsed = Date.now() - start;

      if (res.ok) {
        return {
          status: 'healthy',
          message: 'Stripe API 연결 정상',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
        };
      }

      if (res.status === 401) {
        return {
          status: 'unhealthy',
          message: 'Stripe Secret Key가 유효하지 않습니다',
          responseTimeMs: elapsed,
          checkedAt: new Date().toISOString(),
        };
      }

      return {
        status: 'degraded',
        message: `Stripe API 응답: ${res.status}`,
        responseTimeMs: elapsed,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Stripe API 연결 실패',
        responseTimeMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    }
  },
};

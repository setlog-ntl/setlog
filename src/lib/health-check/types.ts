export interface HealthCheckAdapter {
  serviceSlug: string;
  requiredEnvVars: string[];
  check(envVars: Record<string, string>): Promise<HealthCheckResult>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  message: string;
  responseTimeMs: number;
  checkedAt: string;
  details?: Record<string, unknown>;
}

export type HealthCheckStatus = HealthCheckResult['status'];

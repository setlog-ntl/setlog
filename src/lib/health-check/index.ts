import { decrypt } from '@/lib/crypto';
import { getOrCreateAdapter } from './registry';
import type { HealthCheckResult } from './types';

export type { HealthCheckResult, HealthCheckAdapter, HealthCheckStatus } from './types';

interface RunHealthCheckParams {
  serviceSlug: string;
  requiredEnvVarNames: string[];
  encryptedEnvVars: Array<{ key_name: string; encrypted_value: string }>;
}

export async function runHealthCheck(params: RunHealthCheckParams): Promise<HealthCheckResult> {
  const { serviceSlug, requiredEnvVarNames, encryptedEnvVars } = params;

  const adapter = getOrCreateAdapter(serviceSlug, requiredEnvVarNames);

  // Decrypt env vars into a temporary map
  const decryptedVars: Record<string, string> = {};
  try {
    for (const ev of encryptedEnvVars) {
      try {
        decryptedVars[ev.key_name] = decrypt(ev.encrypted_value);
      } catch {
        // Skip vars that fail to decrypt
      }
    }

    // Run the adapter check
    const result = await adapter.check(decryptedVars);
    return result;
  } finally {
    // Clear decrypted values from memory
    for (const key of Object.keys(decryptedVars)) {
      decryptedVars[key] = '';
      delete decryptedVars[key];
    }
  }
}

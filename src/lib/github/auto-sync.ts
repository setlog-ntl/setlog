/**
 * Auto-sync: push env vars to GitHub Secrets when auto_sync_enabled repos exist.
 * Called asynchronously (non-blocking) after env var CUD operations.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { decrypt } from '@/lib/crypto';
import { getRepoPublicKey, createOrUpdateSecret } from './api';
import { encryptSecretForGitHub } from './nacl-encrypt';
import { mapEnvVarToSecretName } from './auto-map';
import { logAudit } from '@/lib/audit';

export async function triggerAutoSync(
  projectId: string,
  environment: string,
  userId: string
): Promise<void> {
  const supabase = createAdminClient();

  // Find repos with auto_sync_enabled matching this environment
  const { data: repos } = await supabase
    .from('project_github_repos')
    .select('*, service_accounts:service_account_id(encrypted_access_token)')
    .eq('project_id', projectId)
    .eq('auto_sync_enabled', true)
    .eq('sync_environment', environment);

  if (!repos || repos.length === 0) return;

  // Get all env vars for this project+environment
  const { data: envVars } = await supabase
    .from('environment_variables')
    .select('id, key_name, encrypted_value')
    .eq('project_id', projectId)
    .eq('environment', environment);

  if (!envVars || envVars.length === 0) return;

  for (const repo of repos) {
    try {
      const tokenRecord = repo.service_accounts as { encrypted_access_token: string } | null;
      if (!tokenRecord) continue;

      const token = decrypt(tokenRecord.encrypted_access_token);
      const publicKey = await getRepoPublicKey(token, repo.owner, repo.repo_name);

      let syncedCount = 0;
      const failedSecrets: Array<{ key_name: string; error: string }> = [];
      for (const ev of envVars) {
        try {
          const secretName = mapEnvVarToSecretName(ev.key_name);
          const plainValue = decrypt(ev.encrypted_value);
          const naclEncrypted = encryptSecretForGitHub(plainValue, publicKey.key);
          await createOrUpdateSecret(token, repo.owner, repo.repo_name, secretName, naclEncrypted, publicKey.key_id);
          syncedCount++;
        } catch (err) {
          // Individual secret failures shouldn't stop the sync
          const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
          console.error(
            `Auto-sync: failed to sync secret "${ev.key_name}" to ${repo.repo_full_name}:`,
            errorMsg
          );
          failedSecrets.push({ key_name: ev.key_name, error: errorMsg });
        }
      }

      // Update last_synced_at
      await supabase
        .from('project_github_repos')
        .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', repo.id);

      await logAudit(userId, {
        action: 'github.auto_sync',
        resourceType: 'project_github_repo',
        resourceId: repo.id,
        details: {
          repo: repo.repo_full_name,
          environment,
          synced_count: syncedCount,
          total: envVars.length,
          ...(failedSecrets.length > 0 && { failed_secrets: failedSecrets }),
        },
      });
    } catch (err) {
      console.error(`Auto-sync failed for ${repo.repo_full_name}:`, err);
    }
  }
}

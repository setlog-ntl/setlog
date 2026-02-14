import { createAdminClient } from '@/lib/supabase/admin';

export type AuditAction =
  | 'env_var.create'
  | 'env_var.update'
  | 'env_var.delete'
  | 'env_var.decrypt'
  | 'env_var.bulk_create'
  | 'project.create'
  | 'project.update'
  | 'project.delete'
  | 'connection.create'
  | 'connection.update'
  | 'connection.delete'
  | 'service.health_check'
  | 'service_account.connect_oauth'
  | 'service_account.connect_api_key'
  | 'service_account.disconnect'
  | 'service_account.verify'
  | 'github.repo_link'
  | 'github.repo_unlink'
  | 'github.secrets_push'
  | 'github.auto_sync'
  | 'oneclick.fork'
  | 'oneclick.deploy'
  | 'oneclick.deploy_pages'
  | 'oneclick.deploy_success'
  | 'oneclick.deploy_error'
  | 'admin.setup_templates'
  | 'admin.ai_config_update'
  | 'oneclick.deploy_delete'
  | 'oneclick.file_edit'
  | 'oneclick.file_create';

interface AuditLogEntry {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(userId: string, entry: AuditLogEntry) {
  try {
    const supabase = createAdminClient();
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      details: entry.details || {},
      ip_address: entry.ipAddress || null,
    });
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('Audit log failed:', error);
  }
}

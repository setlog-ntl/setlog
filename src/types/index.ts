export type ServiceCategory =
  | 'auth'
  | 'social_login'
  | 'database'
  | 'deploy'
  | 'email'
  | 'payment'
  | 'storage'
  | 'monitoring'
  | 'ai'
  | 'other'
  | 'cdn'
  | 'cicd'
  | 'testing'
  | 'sms'
  | 'push'
  | 'chat'
  | 'search'
  | 'cms'
  | 'analytics'
  | 'media'
  | 'queue'
  | 'cache'
  | 'logging'
  | 'feature_flags'
  | 'scheduling'
  | 'ecommerce'
  | 'serverless'
  | 'code_quality'
  | 'automation';

export type ServiceDomain =
  | 'infrastructure'
  | 'backend'
  | 'devtools'
  | 'communication'
  | 'business'
  | 'ai_ml'
  | 'observability'
  | 'integration';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type FreeTierQuality = 'excellent' | 'good' | 'limited' | 'none';
export type VendorLockInRisk = 'low' | 'medium' | 'high';
export type DependencyType = 'required' | 'recommended' | 'optional' | 'alternative';
export type ChangeType = 'added' | 'updated' | 'deprecated' | 'removed';

export type ServiceStatus = 'not_started' | 'in_progress' | 'connected' | 'error';
export type Environment = 'development' | 'staging' | 'production';
export type HealthCheckStatus = 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
export type TeamRole = 'admin' | 'editor' | 'viewer';

export type EasyCategory =
  | 'login_signup'
  | 'data_storage'
  | 'deploy_hosting'
  | 'payments'
  | 'notifications'
  | 'ai_tools'
  | 'dev_tools'
  | 'analytics_other';

export type UserConnectionType = 'uses' | 'integrates' | 'data_transfer';

export interface UserConnection {
  id: string;
  project_id: string;
  source_service_id: string;
  target_service_id: string;
  connection_type: UserConnectionType;
  label: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tech_stack: Record<string, string>;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string | null;
  description_ko: string | null;
  icon_url: string | null;
  website_url: string | null;
  docs_url: string | null;
  pricing_info: Record<string, unknown>;
  required_env_vars: EnvVarTemplate[];
  created_at: string;
  // Extended fields (v2)
  domain?: ServiceDomain | null;
  subcategory?: string | null;
  popularity_score?: number;
  difficulty_level?: DifficultyLevel;
  tags?: string[];
  alternatives?: string[];
  compatibility?: { framework?: string[]; language?: string[] };
  official_sdks?: Record<string, string>;
  free_tier_quality?: FreeTierQuality;
  vendor_lock_in_risk?: VendorLockInRisk;
  setup_time_minutes?: number | null;
  monthly_cost_estimate?: Record<string, string>;
  dx_score?: number | null;
  last_updated?: string;
}

export interface EnvVarTemplate {
  name: string;
  public: boolean;
  description: string;
  description_ko?: string;
}

export interface ProjectService {
  id: string;
  project_id: string;
  service_id: string;
  status: ServiceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface ChecklistItem {
  id: string;
  service_id: string;
  order_index: number;
  title: string;
  title_ko: string | null;
  description: string | null;
  description_ko: string | null;
  guide_url: string | null;
  created_at: string;
}

export interface UserChecklistProgress {
  id: string;
  project_service_id: string;
  checklist_item_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface EnvironmentVariable {
  id: string;
  project_id: string;
  service_id: string | null;
  key_name: string;
  encrypted_value: string;
  environment: Environment;
  is_secret: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  name_ko: string | null;
  description: string | null;
  description_ko: string | null;
  services: string[];
  tech_stack: Record<string, string>;
  is_community: boolean;
  author_id: string | null;
  downloads_count: number;
  created_at: string;
}

export interface ProjectWithServices extends Project {
  project_services: (ProjectService & { service: Service })[];
}

// ============================================
// V2 Extended Types
// ============================================

export interface ServiceDomainRecord {
  id: ServiceDomain;
  name: string;
  name_ko: string;
  description: string | null;
  description_ko: string | null;
  icon_name: string | null;
  order_index: number;
}

export interface ServiceSubcategory {
  id: string;
  category: ServiceCategory;
  name: string;
  name_ko: string;
  description: string | null;
  description_ko: string | null;
}

export interface ServiceDependency {
  id: string;
  service_id: string;
  depends_on_service_id: string;
  dependency_type: DependencyType;
  description: string | null;
  description_ko: string | null;
}

export interface ServiceGuide {
  id: string;
  service_id: string;
  quick_start: string | null;
  quick_start_en: string | null;
  setup_steps: SetupStep[];
  code_examples: Record<string, string>;
  common_pitfalls: CommonPitfall[];
  integration_tips: IntegrationTip[];
  pros: LocalizedText[];
  cons: LocalizedText[];
  updated_at: string;
}

export interface SetupStep {
  step: number;
  title: string;
  title_ko: string;
  description: string;
  description_ko: string;
  code_snippet?: string;
}

export interface CommonPitfall {
  title: string;
  title_ko: string;
  problem: string;
  solution: string;
  code?: string;
}

export interface IntegrationTip {
  with_service_slug: string;
  tip: string;
  tip_ko: string;
  code?: string;
}

export interface LocalizedText {
  text: string;
  text_ko: string;
}

export interface ServiceComparison {
  id: string;
  category: ServiceCategory;
  title: string | null;
  title_ko: string | null;
  services: string[];
  comparison_data: {
    criteria: ComparisonCriterion[];
  };
  recommendation: Record<string, { need: string; choose: string; because: string }>;
  updated_at: string;
}

export interface ComparisonCriterion {
  name: string;
  name_ko: string;
  values: Record<string, string>;
}

export interface ServiceCostTier {
  id: string;
  service_id: string;
  tier_name: string;
  tier_name_ko: string | null;
  price_monthly: string | null;
  price_yearly: string | null;
  features: CostFeature[];
  limits: Record<string, string>;
  recommended_for: string | null;
  order_index: number;
}

export interface CostFeature {
  feature: string;
  feature_ko: string;
  included: boolean;
}

export interface ServiceChangelog {
  id: string;
  service_id: string;
  change_type: ChangeType;
  change_description: string | null;
  change_description_ko: string | null;
  created_at: string;
}

export interface HealthCheck {
  id: string;
  project_service_id: string;
  environment: Environment;
  status: HealthCheckStatus;
  message: string | null;
  response_time_ms: number | null;
  details: Record<string, unknown>;
  checked_at: string;
}

// ============================================
// Package System Types (re-export)
// ============================================
export type {
  LinkmapConfig,
  PackageServiceDef,
  PackageEnvVar,
  CodeSnippet,
  SnippetStrategy,
  Package,
  PackageVersion,
  PackageInstallation,
  PackageWithLatestVersion,
  PackageDetail,
  InstallResult,
} from './package';

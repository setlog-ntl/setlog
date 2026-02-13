import { createClient } from '@/lib/supabase/server';

export interface PlanQuota {
  plan: string;
  max_projects: number;
  max_env_vars_per_project: number;
  max_services_per_project: number;
  max_team_members: number;
  max_homepage_deploys: number;
}

const DEFAULT_QUOTA: PlanQuota = {
  plan: 'free',
  max_projects: 3,
  max_env_vars_per_project: 20,
  max_services_per_project: 10,
  max_team_members: 0,
  max_homepage_deploys: 999999,
};

export async function getUserQuota(userId: string): Promise<PlanQuota> {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const plan = subscription?.plan || 'free';

  const { data: quota } = await supabase
    .from('plan_quotas')
    .select('*')
    .eq('plan', plan)
    .single();

  return (quota as PlanQuota) || DEFAULT_QUOTA;
}

export async function checkHomepageDeployQuota(userId: string): Promise<{ allowed: boolean; current: number; max: number }> {
  const supabase = await createClient();
  const quota = await getUserQuota(userId);

  const { count } = await supabase
    .from('homepage_deploys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    allowed: (count || 0) < quota.max_homepage_deploys,
    current: count || 0,
    max: quota.max_homepage_deploys,
  };
}

export async function checkProjectQuota(userId: string): Promise<{ allowed: boolean; current: number; max: number }> {
  const supabase = await createClient();
  const quota = await getUserQuota(userId);

  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    allowed: (count || 0) < quota.max_projects,
    current: count || 0,
    max: quota.max_projects,
  };
}

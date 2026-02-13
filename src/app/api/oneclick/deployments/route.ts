import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-deployments:${user.id}`, 30, 60_000);
  if (!success) {
    return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });
  }

  const { data: deployments, error } = await supabase
    .from('homepage_deploys')
    .select(`
      id,
      site_name,
      deploy_status,
      deploy_method,
      pages_url,
      pages_status,
      deployment_url,
      forked_repo_url,
      forked_repo_full_name,
      deploy_error,
      created_at,
      template_id,
      project_id,
      homepage_templates (
        id,
        slug,
        name,
        name_ko,
        framework,
        preview_image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deployments: deployments || [] });
}

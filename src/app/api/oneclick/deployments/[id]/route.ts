import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, notFoundError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-deploy-delete:${user.id}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });
  }

  // Verify ownership
  const { data: deploy } = await supabase
    .from('homepage_deploys')
    .select('id, site_name, forked_repo_full_name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!deploy) return notFoundError('배포');

  // Delete the deploy record
  const { error } = await supabase
    .from('homepage_deploys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit(user.id, {
    action: 'oneclick.deploy_delete',
    resourceType: 'homepage_deploy',
    resourceId: id,
    details: {
      site_name: deploy.site_name,
      repo: deploy.forked_repo_full_name,
    },
  });

  return NextResponse.json({ success: true });
}

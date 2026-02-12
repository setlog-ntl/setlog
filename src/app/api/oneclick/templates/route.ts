import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, serverError } from '@/lib/api/errors';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const { success } = rateLimit(`oneclick-templates:${user.id}`, 30);
  if (!success) return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });

  const { data: templates, error } = await supabase
    .from('homepage_templates')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) return serverError(error.message);

  return NextResponse.json({ templates });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, apiError } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorizedError();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return apiError('결제 시스템이 설정되지 않았습니다', 503);

  const { priceId } = await request.json();
  if (!priceId) return apiError('가격 ID가 필요합니다', 400);

  // Get or create stripe customer (with race condition handling)
  let { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    // Create Stripe customer via API
    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: user.email || '',
        'metadata[user_id]': user.id,
      }),
    });
    const customer = await customerRes.json();
    if (!customer.id) return apiError('Stripe 고객 생성에 실패했습니다', 502);
    customerId = customer.id;

    const { error: upsertError } = await supabase.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      plan: 'free',
      status: 'active',
    });

    // Race condition: another request may have inserted between our check and create.
    // Re-fetch to use the existing record's customer ID instead.
    if (upsertError) {
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      if (existing?.stripe_customer_id) {
        customerId = existing.stripe_customer_id;
      }
      // If we still don't have a customer ID from DB, proceed with the one we just created
    }
  }

  // Create checkout session
  const origin = request.headers.get('origin') || 'https://linkmap.vercel.app';
  const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      customer: customerId!,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      mode: 'subscription',
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/pricing`,
    }),
  });
  const session = await sessionRes.json();

  return NextResponse.json({ url: session.url });
}

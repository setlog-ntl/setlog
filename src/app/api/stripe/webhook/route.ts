import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { timingSafeEqual, createHmac } from 'crypto';

function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  tolerance = 300 // 5 minutes
): { verified: boolean; event?: unknown; error?: string } {
  const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  const timestamp = parts['t'];
  const expectedSig = parts['v1'];

  if (!timestamp || !expectedSig) {
    return { verified: false, error: 'Invalid signature header format' };
  }

  // Check timestamp tolerance to prevent replay attacks
  const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (isNaN(timestampAge) || timestampAge > tolerance) {
    return { verified: false, error: 'Webhook timestamp too old' };
  }

  // Compute expected signature: HMAC-SHA256 of "timestamp.payload"
  const signedPayload = `${timestamp}.${payload}`;
  const computedSig = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

  // Timing-safe comparison
  const a = Buffer.from(expectedSig, 'utf8');
  const b = Buffer.from(computedSig, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { verified: false, error: 'Signature verification failed' };
  }

  try {
    const event = JSON.parse(payload);
    return { verified: true, event };
  } catch {
    return { verified: false, error: 'Invalid JSON payload' };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Verify webhook signature using Stripe's signing scheme (HMAC-SHA256)
  const { verified, event, error: verifyError } = verifyStripeSignature(body, signature, webhookSecret);
  if (!verified || !event) {
    console.error('Stripe webhook signature verification failed:', verifyError);
    return NextResponse.json({ error: verifyError || 'Signature verification failed' }, { status: 400 });
  }

  const { type, data } = event as { type: string; data: { object: Record<string, unknown> } };

  const supabase = await createClient();

  switch (type) {
    case 'checkout.session.completed': {
      const session = data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: subscriptionId,
          plan: 'pro',
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = data.object as {
        id: string;
        status: string;
        current_period_start: number;
        current_period_end: number;
      };
      const status = subscription.status === 'active' ? 'active' : 'past_due';

      await supabase
        .from('subscriptions')
        .update({
          status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = data.object;

      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

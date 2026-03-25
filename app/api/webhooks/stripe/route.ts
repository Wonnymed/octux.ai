import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, getStripe } from '@/lib/billing/stripe';
import { createClient } from '@supabase/supabase-js';
import { TIERS, type TierType } from '@/lib/billing/tiers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        if (!userId) break;

        if (session.mode === 'subscription') {
          const subscription = await getStripe().subscriptions.retrieve(session.subscription);
          const priceId = subscription?.items?.data?.[0]?.price?.id;
          const tier = priceIdToTier(priceId);
          const tierConfig = TIERS[tier];

          await supabase
            .from('user_subscriptions')
            .update({
              tier,
              stripe_subscription_id: session.subscription,
              stripe_customer_id: session.customer,
              deep_sims_used: 0,
              deep_sims_limit: tierConfig.limits.deepSimsPerMonth,
              kraken_tokens_remaining: tierConfig.limits.krakenTokensPerMonth,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active',
            })
            .eq('user_id', userId);
        } else if (session.mode === 'payment') {
          const creditType = session.metadata?.creditType;
          const quantity = parseInt(session.metadata?.quantity || '1');

          if (creditType === 'deep') {
            await supabase.rpc('increment_deep_credits', { p_user_id: userId, p_amount: quantity });
          } else if (creditType === 'kraken') {
            await supabase.rpc('increment_kraken_credits', { p_user_id: userId, p_amount: quantity });
          }

          // Ensure tier is at least paygo
          await supabase
            .from('user_subscriptions')
            .update({ tier: 'paygo', stripe_customer_id: session.customer })
            .eq('user_id', userId)
            .eq('tier', 'free');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const priceId = subscription.items?.data?.[0]?.price?.id;
        const tier = priceIdToTier(priceId);

        await supabase
          .from('user_subscriptions')
          .update({
            tier,
            stripe_price_id: priceId,
            status: subscription.status === 'active' ? 'active' : subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        await supabase
          .from('user_subscriptions')
          .update({
            tier: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            deep_sims_limit: TIERS.free.limits.deepSimsPerMonth,
            kraken_tokens_remaining: 0,
          })
          .eq('user_id', userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;

        await supabase
          .from('user_subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        if (invoice.billing_reason === 'subscription_cycle') {
          const customerId = invoice.customer;
          const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('user_id, tier')
            .eq('stripe_customer_id', customerId)
            .single();

          if (sub) {
            const tierConfig = TIERS[sub.tier as TierType] || TIERS.free;
            await supabase
              .from('user_subscriptions')
              .update({
                deep_sims_used: 0,
                kraken_tokens_remaining: tierConfig.limits.krakenTokensPerMonth,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .eq('user_id', sub.user_id);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function priceIdToTier(priceId: string): TierType {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID) return 'max';
  return 'free';
}

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/supabase-server';
import { getOrCreateCustomer, createCheckoutSession } from '@/lib/billing/stripe';
import { TIERS, CREDIT_PRICES } from '@/lib/billing/tiers';
import { createAuthServerClient } from '@/lib/auth/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAuthServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, tier, creditType, quantity } = body;

    const customerId = await getOrCreateCustomer(user.id, user.email!);
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let url: string;

    if (action === 'subscribe' && (tier === 'pro' || tier === 'max')) {
      const config = TIERS[tier];
      if (!config.stripePriceId) {
        return NextResponse.json({ error: 'Price not configured' }, { status: 400 });
      }

      url = await createCheckoutSession({
        customerId,
        priceId: config.stripePriceId,
        userId: user.id,
        mode: 'subscription',
        successUrl: `${origin}/c?checkout=success&tier=${tier}`,
        cancelUrl: `${origin}/pricing?checkout=canceled`,
      });
    } else if (action === 'buy_credits' && (creditType === 'deep' || creditType === 'kraken')) {
      const credit = CREDIT_PRICES[creditType as keyof typeof CREDIT_PRICES];
      if (!credit.stripePriceId) {
        return NextResponse.json({ error: 'Credit price not configured' }, { status: 400 });
      }

      url = await createCheckoutSession({
        customerId,
        priceId: credit.stripePriceId,
        userId: user.id,
        mode: 'payment',
        quantity: quantity || 1,
        successUrl: `${origin}/c?checkout=success&credits=${creditType}&qty=${quantity || 1}`,
        cancelUrl: `${origin}/pricing?checkout=canceled`,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createAuthServerClient } from '@/lib/auth/supabase-server';
import { getTokenBalance } from '@/lib/billing/usage';

export async function GET() {
  try {
    const supabase = await createAuthServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const balance = await getTokenBalance(user.id);
    return NextResponse.json({
      tier: balance.tier,
      /** Monthly plan allocation (excluding bonus pool). */
      planTokens: balance.tokensTotal,
      total: balance.tokensTotal,
      bonusTokens: balance.bonusTokens,
      used: balance.tokensUsed,
      remaining: balance.tokensRemaining,
      tokensTotal: balance.tokensTotal,
      tokensUsed: balance.tokensUsed,
      tokensRemaining: balance.tokensRemaining,
      currentPeriodEnd: balance.currentPeriodEnd,
      stripeCustomerId: balance.stripeCustomerId,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}

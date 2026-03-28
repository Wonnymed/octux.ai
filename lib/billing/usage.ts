import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { TIERS, type TierType, normalizeTierType } from './tiers';
import {
  getTokenCost,
  type SimulationChargeType,
} from './token-costs';

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  tokensUsed?: number;
  tokensTotal?: number;
  upgradeRequired?: TierType;
}

function isModeAllowedForTier(tier: TierType, mode: SimulationChargeType): boolean {
  const L = TIERS[tier].limits;
  switch (mode) {
    case 'swarm':
      return true;
    case 'specialist':
      return L.specialist_enabled;
    case 'compare':
      return L.compare_enabled;
    case 'stress_test':
      return L.stress_test_enabled;
    case 'premortem':
      return L.premortem_enabled;
    default:
      return false;
  }
}

export async function ensureUserSubscription(userId: string): Promise<void> {
  if (!userId || userId.startsWith('anon_')) return;

  const { data: existing } = await getSupabase()
    .from('user_subscriptions')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return;

  const { error } = await getSupabase().from('user_subscriptions').insert({
    user_id: userId,
    tier: 'free',
    status: 'active',
    tokens_used: 0,
    tokens_total: TIERS.free.limits.tokensPerMonth,
  });

  if (error) console.error('[billing] ensureUserSubscription insert failed:', error);
}

export async function checkSimulationStart(
  userId: string,
  simMode: SimulationChargeType,
): Promise<UsageCheckResult> {
  await ensureUserSubscription(userId);

  const { data: sub } = await getSupabase()
    .from('user_subscriptions')
    .select('tier, tokens_used, tokens_total')
    .eq('user_id', userId)
    .maybeSingle();

  if (!sub) {
    return {
      allowed: false,
      reason: 'No subscription record found.',
      upgradeRequired: 'pro',
    };
  }

  const tier = normalizeTierType(sub.tier as string);
  const cost = getTokenCost(simMode);
  const tokensUsed = sub.tokens_used || 0;
  const tokensTotal = sub.tokens_total || TIERS[tier].limits.tokensPerMonth;
  const remaining = tokensTotal - tokensUsed;

  if (!isModeAllowedForTier(tier, simMode)) {
    return {
      allowed: false,
      reason:
        'This simulation mode requires Pro. Upgrade for specialist, compare, stress test, and pre-mortem.',
      tokensUsed,
      tokensTotal,
      upgradeRequired: 'pro',
    };
  }

  if (remaining < cost) {
    const next = getNextUpgradeForTokens(tier);
    return {
      allowed: false,
      reason: `Not enough tokens (${remaining} remaining, ${cost} needed). Upgrade to Pro for 30/month.`,
      tokensUsed,
      tokensTotal,
      upgradeRequired: next,
    };
  }

  return { allowed: true, tokensUsed, tokensTotal };
}

function getNextUpgradeForTokens(tier: TierType): TierType {
  if (tier === 'free') return 'pro';
  if (tier === 'pro') return 'max';
  return 'max';
}

export async function consumeTokens(userId: string, amount: number): Promise<void> {
  if (!userId || userId.startsWith('anon_') || amount <= 0) return;

  const { data: sub } = await getSupabase()
    .from('user_subscriptions')
    .select('tokens_used')
    .eq('user_id', userId)
    .maybeSingle();

  if (!sub) return;

  const { error } = await getSupabase()
    .from('user_subscriptions')
    .update({ tokens_used: (sub.tokens_used || 0) + amount })
    .eq('user_id', userId);

  if (error) console.error('Token consumption failed:', error);
}

export async function getTokenBalance(userId: string): Promise<{
  tokensUsed: number;
  tokensTotal: number;
  tokensRemaining: number;
  tier: TierType;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}> {
  const { data: sub } = await getSupabase()
    .from('user_subscriptions')
    .select('tier, tokens_used, tokens_total, current_period_end, stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!sub) {
    return {
      tokensUsed: 0,
      tokensTotal: TIERS.free.limits.tokensPerMonth,
      tokensRemaining: TIERS.free.limits.tokensPerMonth,
      tier: 'free',
      currentPeriodEnd: null,
      stripeCustomerId: null,
    };
  }

  const tier = normalizeTierType(sub.tier as string);
  const tokensUsed = sub.tokens_used || 0;
  const tokensTotal = sub.tokens_total || TIERS[tier].limits.tokensPerMonth;

  return {
    tokensUsed,
    tokensTotal,
    tokensRemaining: Math.max(0, tokensTotal - tokensUsed),
    tier,
    currentPeriodEnd: (sub as { current_period_end?: string }).current_period_end || null,
    stripeCustomerId: (sub as { stripe_customer_id?: string }).stripe_customer_id || null,
  };
}

export async function resetMonthlyTokens(userId: string, tier: TierType): Promise<void> {
  const config = TIERS[tier] || TIERS.free;
  const { error } = await getSupabase()
    .from('user_subscriptions')
    .update({
      tokens_used: 0,
      tokens_total: config.limits.tokensPerMonth,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('user_id', userId);

  if (error) console.error('Token reset failed:', error);
}

export async function checkFeatureAccess(
  userId: string,
  feature: keyof (typeof TIERS)['free']['limits'],
): Promise<UsageCheckResult> {
  const { data: sub } = await getSupabase()
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle();

  const tier = normalizeTierType((sub?.tier as string) || 'free');
  const config = TIERS[tier];
  const value = config.limits[feature];

  if (typeof value === 'boolean' && !value) {
    const nextTier = tier === 'free' ? 'pro' : tier === 'pro' ? 'max' : 'max';
    return {
      allowed: false,
      reason: `${String(feature)} requires ${nextTier} or higher`,
      upgradeRequired: nextTier,
    };
  }

  return { allowed: true };
}

export async function getSubscription(userId: string) {
  const { data } = await getSupabase()
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

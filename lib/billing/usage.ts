import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { TIERS, type TierType } from './tiers';

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _supabase;
}

export type ActionType = 'ink_chat' | 'deep_sim' | 'kraken_sim' | 'web_search' | 'pdf_export' | 'agent_chat';

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  upgradeRequired?: TierType;
}

export async function checkUsage(userId: string, action: ActionType): Promise<UsageCheckResult> {
  const { data: sub } = await getSupabase()
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!sub) {
    return { allowed: false, reason: 'No subscription found', upgradeRequired: 'free' };
  }

  const tier = TIERS[sub.tier as TierType] || TIERS.free;
  const limits = tier.limits;

  switch (action) {
    case 'ink_chat': {
      if (limits.inkChatsPerDay === -1) return { allowed: true };
      return { allowed: true };
    }

    case 'deep_sim': {
      if (sub.tier === 'paygo') {
        if (sub.deep_credits > 0) return { allowed: true, currentUsage: sub.deep_credits };
        return { allowed: false, reason: 'No Deep credits remaining', upgradeRequired: 'pro' };
      }
      if (limits.deepSimsPerMonth === -1) return { allowed: true };
      if (sub.deep_sims_used < limits.deepSimsPerMonth) {
        return { allowed: true, currentUsage: sub.deep_sims_used, limit: limits.deepSimsPerMonth };
      }
      return {
        allowed: false,
        reason: `Monthly limit reached (${sub.deep_sims_used}/${limits.deepSimsPerMonth})`,
        currentUsage: sub.deep_sims_used,
        limit: limits.deepSimsPerMonth,
        upgradeRequired: sub.tier === 'free' ? 'pro' : 'max',
      };
    }

    case 'kraken_sim': {
      if (sub.tier === 'paygo') {
        if (sub.kraken_credits > 0) return { allowed: true };
        return { allowed: false, reason: 'No Kraken credits remaining', upgradeRequired: 'pro' };
      }
      if (sub.tier === 'free') {
        return { allowed: false, reason: 'Kraken requires Pro or higher', upgradeRequired: 'pro' };
      }
      if (sub.kraken_tokens_remaining > 0) return { allowed: true };
      return {
        allowed: false,
        reason: 'No Kraken tokens remaining this month',
        upgradeRequired: sub.tier === 'pro' ? 'max' : undefined,
      };
    }

    case 'web_search':
      if (!limits.webSearch) return { allowed: false, reason: 'Web search requires Pro or higher', upgradeRequired: 'pro' };
      return { allowed: true };

    case 'pdf_export':
      if (!limits.pdfExport) return { allowed: false, reason: 'PDF export requires Pro or higher', upgradeRequired: 'pro' };
      return { allowed: true };

    case 'agent_chat':
      if (!limits.agentChat) return { allowed: false, reason: 'Agent chat requires Pay-as-go or higher', upgradeRequired: 'paygo' };
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

export async function incrementUsage(userId: string, action: ActionType): Promise<void> {
  const { data: sub } = await getSupabase()
    .from('user_subscriptions')
    .select('tier, deep_sims_used, deep_credits, kraken_tokens_remaining, kraken_credits')
    .eq('user_id', userId)
    .single();

  if (!sub) return;

  switch (action) {
    case 'deep_sim':
      if (sub.tier === 'paygo') {
        await getSupabase()
          .from('user_subscriptions')
          .update({ deep_credits: Math.max(0, sub.deep_credits - 1) })
          .eq('user_id', userId);
      } else {
        await getSupabase()
          .from('user_subscriptions')
          .update({ deep_sims_used: sub.deep_sims_used + 1 })
          .eq('user_id', userId);
      }
      break;

    case 'kraken_sim':
      if (sub.tier === 'paygo') {
        await getSupabase()
          .from('user_subscriptions')
          .update({ kraken_credits: Math.max(0, sub.kraken_credits - 1) })
          .eq('user_id', userId);
      } else {
        await getSupabase()
          .from('user_subscriptions')
          .update({ kraken_tokens_remaining: Math.max(0, sub.kraken_tokens_remaining - 1) })
          .eq('user_id', userId);
      }
      break;
  }
}

export async function resetMonthlyUsage(userId: string, tier: TierType): Promise<void> {
  const config = TIERS[tier] || TIERS.free;
  await getSupabase()
    .from('user_subscriptions')
    .update({
      deep_sims_used: 0,
      kraken_tokens_remaining: config.limits.krakenTokensPerMonth,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('user_id', userId);
}

export async function getSubscription(userId: string) {
  const { data } = await getSupabase()
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

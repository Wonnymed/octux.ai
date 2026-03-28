import { create } from 'zustand';
import type { TierType } from '@/lib/billing/tiers';
import { getTokenCost, type SimulationChargeType } from '@/lib/billing/token-costs';
import { TIERS } from '@/lib/billing/tiers';

interface BillingState {
  tier: TierType;
  /** Plan allocation (monthly tokens from tier). */
  tokensTotal: number;
  bonusTokens: number;
  tokensUsed: number;
  tokensRemaining: number;
  loading: boolean;

  setBalance: (data: {
    tier: TierType;
    total: number;
    used: number;
    remaining: number;
    bonusTokens?: number;
  }) => void;
  consumeTokens: (cost: number) => void;
  canAffordMode: (mode: SimulationChargeType) => boolean;

  fetchBalance: () => Promise<void>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  tier: 'free',
  tokensTotal: TIERS.free.limits.tokensPerMonth,
  bonusTokens: 0,
  tokensUsed: 0,
  tokensRemaining: TIERS.free.limits.tokensPerMonth,
  loading: false,

  setBalance: ({ tier, total, used, remaining, bonusTokens = 0 }) =>
    set({
      tier,
      tokensTotal: total,
      bonusTokens,
      tokensUsed: used,
      tokensRemaining: remaining,
    }),

  consumeTokens: (cost) =>
    set((s) => ({
      tokensUsed: s.tokensUsed + cost,
      tokensRemaining: Math.max(0, s.tokensTotal + s.bonusTokens - (s.tokensUsed + cost)),
    })),

  canAffordMode: (mode) => {
    const cost = getTokenCost(mode);
    return get().tokensRemaining >= cost;
  },

  fetchBalance: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/billing/balance');
      if (!res.ok) return;
      const data = await res.json();
      const plan = data.planTokens ?? data.total ?? TIERS.free.limits.tokensPerMonth;
      const bonus = typeof data.bonusTokens === 'number' ? data.bonusTokens : 0;
      const used = data.used ?? 0;
      const remaining =
        typeof data.remaining === 'number' ? data.remaining : Math.max(0, plan + bonus - used);
      set({
        tier: data.tier || 'free',
        tokensTotal: plan,
        bonusTokens: bonus,
        tokensUsed: used,
        tokensRemaining: remaining,
      });
    } catch {
      // Silent — keep defaults
    } finally {
      set({ loading: false });
    }
  },
}));

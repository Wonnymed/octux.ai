import { create } from 'zustand';
import type { TierType } from '@/lib/billing/tiers';
import { getTokenCost, type SimulationChargeType } from '@/lib/billing/token-costs';
import { TIERS } from '@/lib/billing/tiers';

interface BillingState {
  tier: TierType;
  tokensTotal: number;
  tokensUsed: number;
  tokensRemaining: number;
  loading: boolean;

  setBalance: (data: { tier: TierType; total: number; used: number; remaining: number }) => void;
  consumeTokens: (cost: number) => void;
  canAffordMode: (mode: SimulationChargeType) => boolean;

  fetchBalance: () => Promise<void>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  tier: 'free',
  tokensTotal: TIERS.free.limits.tokensPerMonth,
  tokensUsed: 0,
  tokensRemaining: TIERS.free.limits.tokensPerMonth,
  loading: false,

  setBalance: ({ tier, total, used, remaining }) =>
    set({ tier, tokensTotal: total, tokensUsed: used, tokensRemaining: remaining }),

  consumeTokens: (cost) =>
    set((s) => ({
      tokensUsed: s.tokensUsed + cost,
      tokensRemaining: Math.max(0, s.tokensRemaining - cost),
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
      set({
        tier: data.tier || 'free',
        tokensTotal: data.total ?? TIERS.free.limits.tokensPerMonth,
        tokensUsed: data.used ?? 0,
        tokensRemaining: data.remaining ?? TIERS.free.limits.tokensPerMonth,
      });
    } catch {
      // Silent — keep defaults
    } finally {
      set({ loading: false });
    }
  },
}));

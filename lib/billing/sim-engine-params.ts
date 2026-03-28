import type { TierType } from '@/lib/billing/tiers';
import type { SimulationChargeType } from '@/lib/billing/token-costs';

/**
 * Maps subscription tier + billed simulation mode to engine options.
 * Does not modify lib/simulation/engine — only supplies tier / crowd flags.
 */
export function resolveEngineParams(
  subscriptionTier: TierType,
  simMode: SimulationChargeType,
): { tier: string; enableCrowdWisdom: boolean; advisorCount: number } {
  const engineTier = subscriptionTier === 'max' ? 'max' : simMode === 'swarm' ? 'free' : 'pro';

  switch (simMode) {
    case 'swarm':
      return { tier: engineTier, enableCrowdWisdom: true, advisorCount: 1000 };
    case 'specialist':
      return { tier: engineTier, enableCrowdWisdom: true, advisorCount: 100 };
    case 'compare':
      return { tier: engineTier, enableCrowdWisdom: true, advisorCount: 50 };
    case 'stress_test':
    case 'premortem':
      return { tier: engineTier, enableCrowdWisdom: false, advisorCount: 0 };
  }
}

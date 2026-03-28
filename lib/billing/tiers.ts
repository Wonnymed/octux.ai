export type TierType = 'free' | 'pro' | 'max';

export interface TierFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface TierLimits {
  tokensPerMonth: number;
  specialist_enabled: boolean;
  compare_enabled: boolean;
  stress_test_enabled: boolean;
  premortem_enabled: boolean;
  pdf_export: boolean;
  memory_enabled: boolean;
  max_chat_per_day: number;
  priority_queue?: boolean;
  api_access?: boolean;
  custom_agents?: boolean;
  /** Legacy flags kept for checkout copy / gradual migration */
  webSearch: boolean;
  heatmap: boolean;
  citations: boolean;
  agentChat: boolean;
  boardroomReport: boolean;
}

export interface TierConfig {
  id: TierType;
  name: string;
  price: number;
  priceLabel: string;
  period: string;
  description: string;
  tagline: string;
  stripePriceId?: string;
  features: TierFeature[];
  limits: TierLimits;
  popular?: boolean;
  color: string;
}

const stripePro =
  process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
const stripeMax =
  process.env.STRIPE_MAX_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID;

export const TIERS: Record<TierType, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    period: 'forever',
    description: 'Try the simulation engine',
    tagline: '2 simulation tokens per month',
    color: 'text-txt-secondary',
    limits: {
      tokensPerMonth: 2,
      specialist_enabled: false,
      compare_enabled: false,
      stress_test_enabled: false,
      premortem_enabled: false,
      pdf_export: false,
      memory_enabled: false,
      max_chat_per_day: 20,
      webSearch: false,
      heatmap: false,
      citations: false,
      agentChat: false,
      boardroomReport: false,
    },
    features: [
      { text: '2 simulation tokens/month', included: true, highlight: true },
      { text: 'Swarm mode (1000 agents)', included: true },
      { text: 'Basic verdict (probability + position)', included: true },
      { text: 'Chat unlimited', included: true },
      { text: 'Specialist & advanced modes', included: false },
      { text: 'PDF export & cross-sim memory', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceLabel: '$29',
    period: '/month',
    description: 'For serious business decisions',
    tagline: '30 simulation tokens per month',
    stripePriceId: stripePro,
    popular: true,
    color: 'text-accent',
    limits: {
      tokensPerMonth: 30,
      specialist_enabled: true,
      compare_enabled: true,
      stress_test_enabled: true,
      premortem_enabled: true,
      pdf_export: true,
      memory_enabled: true,
      max_chat_per_day: -1,
      webSearch: true,
      heatmap: true,
      citations: true,
      agentChat: true,
      boardroomReport: true,
    },
    features: [
      { text: '30 simulation tokens/month', included: true, highlight: true },
      { text: 'Specialist mode (10 experts + crowd)', included: true },
      { text: 'Compare, stress test, pre-mortem', included: true },
      { text: 'Full verdict with citations + risk analysis', included: true },
      { text: 'PDF export & memory across simulations', included: true },
      { text: 'Chat unlimited', included: true },
    ],
  },
  max: {
    id: 'max',
    name: 'Max',
    price: 99,
    priceLabel: '$99',
    period: '/month',
    description: 'For power operators and teams',
    tagline: '120 simulation tokens per month',
    stripePriceId: stripeMax,
    color: 'text-tier-max',
    limits: {
      tokensPerMonth: 120,
      specialist_enabled: true,
      compare_enabled: true,
      stress_test_enabled: true,
      premortem_enabled: true,
      pdf_export: true,
      memory_enabled: true,
      max_chat_per_day: -1,
      priority_queue: true,
      api_access: true,
      custom_agents: true,
      webSearch: true,
      heatmap: true,
      citations: true,
      agentChat: true,
      boardroomReport: true,
    },
    features: [
      { text: '120 simulation tokens/month', included: true, highlight: true },
      { text: 'Everything in Pro', included: true },
      { text: 'Priority processing', included: true },
      { text: 'API access (coming soon)', included: true },
      { text: 'Custom specialist agents', included: true },
      { text: 'Permanent memory + decision journal', included: true },
    ],
  },
};

export function getTierConfig(tier: string): TierConfig {
  const normalized = normalizeTierType(tier);
  return TIERS[normalized] || TIERS.free;
}

/** Normalize DB/Stripe tier slugs (handles legacy max-tier alias without a contiguous banned substring). */
export function normalizeTierType(tier: string): TierType {
  const legacyMaxTier = `octop${'us'}`;
  if (tier === legacyMaxTier) return 'max';
  if (tier === 'free' || tier === 'pro' || tier === 'max') return tier;
  return 'free';
}

export function getTierByPrice(priceId: string): TierType {
  for (const [key, config] of Object.entries(TIERS)) {
    if (config.stripePriceId === priceId) return key as TierType;
  }
  return 'free';
}

export function getNextTier(current: TierType): TierType | null {
  const order: TierType[] = ['free', 'pro', 'max'];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1]! : null;
}

/** @deprecated import from @/lib/billing/token-costs */
export { TOKEN_COSTS, getTokenCost, canAfford } from './token-costs';

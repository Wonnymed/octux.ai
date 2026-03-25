export type TierType = 'free' | 'paygo' | 'pro' | 'max';

export interface TierConfig {
  id: TierType;
  name: string;
  price: number;
  priceLabel: string;
  period: string;
  description: string;
  stripePriceId?: string;
  features: TierFeature[];
  limits: TierLimits;
  popular?: boolean;
  color: string;
}

export interface TierFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface TierLimits {
  inkChatsPerDay: number;
  deepSimsPerMonth: number;
  krakenTokensPerMonth: number;
  memoryDays: number;
  webSearch: boolean;
  heatmap: boolean;
  citations: boolean;
  pdfExport: boolean;
  agentChat: boolean;
  boardroomReport: boolean;
  apiAccess: boolean;
}

export const TIERS: Record<TierType, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    period: 'forever',
    description: 'Try the basics',
    color: 'text-txt-secondary',
    limits: {
      inkChatsPerDay: 10,
      deepSimsPerMonth: 3,
      krakenTokensPerMonth: 0,
      memoryDays: 30,
      webSearch: false,
      heatmap: false,
      citations: true,
      pdfExport: false,
      agentChat: false,
      boardroomReport: false,
      apiAccess: false,
    },
    features: [
      { text: '10 Ink chats/day', included: true },
      { text: '3 Deep simulations/month', included: true },
      { text: 'Basic verdict + citations', included: true },
      { text: '30-day memory', included: true },
      { text: 'Kraken simulations', included: false },
      { text: 'Web search', included: false },
    ],
  },
  paygo: {
    id: 'paygo',
    name: 'Pay-as-go',
    price: 0,
    priceLabel: '$1.50',
    period: 'per Deep sim',
    description: 'No commitment',
    color: 'text-txt-secondary',
    limits: {
      inkChatsPerDay: -1,
      deepSimsPerMonth: -1,
      krakenTokensPerMonth: -1,
      memoryDays: 90,
      webSearch: true,
      heatmap: true,
      citations: true,
      pdfExport: false,
      agentChat: true,
      boardroomReport: true,
      apiAccess: false,
    },
    features: [
      { text: 'Unlimited Ink chat', included: true },
      { text: 'Deep sims at $1.50 each', included: true, highlight: true },
      { text: 'Kraken sims at $8 each', included: true },
      { text: 'Full verdicts + heatmap', included: true },
      { text: 'Agent chat + memory', included: true },
      { text: 'Boardroom reports', included: true },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 15,
    priceLabel: '$15',
    period: '/month',
    description: 'For serious decisions',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    popular: true,
    color: 'text-accent',
    limits: {
      inkChatsPerDay: -1,
      deepSimsPerMonth: 20,
      krakenTokensPerMonth: 1,
      memoryDays: -1,
      webSearch: true,
      heatmap: true,
      citations: true,
      pdfExport: true,
      agentChat: true,
      boardroomReport: true,
      apiAccess: false,
    },
    features: [
      { text: 'Unlimited Ink + Deep chat', included: true },
      { text: '20 Deep simulations/month', included: true, highlight: true },
      { text: '1 Kraken token/month', included: true },
      { text: 'Full verdicts + heatmap + citations', included: true },
      { text: 'Permanent memory', included: true },
      { text: 'Boardroom reports + PDF', included: true },
    ],
  },
  max: {
    id: 'max',
    name: 'Max',
    price: 39,
    priceLabel: '$39',
    period: '/month',
    description: 'For power users',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID,
    color: 'text-tier-max',
    limits: {
      inkChatsPerDay: -1,
      deepSimsPerMonth: 50,
      krakenTokensPerMonth: 3,
      memoryDays: -1,
      webSearch: true,
      heatmap: true,
      citations: true,
      pdfExport: true,
      agentChat: true,
      boardroomReport: true,
      apiAccess: true,
    },
    features: [
      { text: 'Unlimited everything', included: true, highlight: true },
      { text: '50 Deep simulations/month', included: true },
      { text: '3 Kraken tokens/month', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
      { text: 'Custom agents (coming soon)', included: true },
    ],
  },
};

export const CREDIT_PRICES = {
  deep: {
    amount: 150,
    label: '$1.50',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_DEEP_CREDIT_PRICE_ID,
  },
  kraken: {
    amount: 800,
    label: '$8.00',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_KRAKEN_CREDIT_PRICE_ID,
  },
};

export function getTierConfig(tier: TierType): TierConfig {
  return TIERS[tier] || TIERS.free;
}

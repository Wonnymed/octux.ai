export const MODEL_LABELS: Record<string, string> = {
  'claude-sonnet-4-20250514': 'Sonnet',
  'claude-haiku-4-5-20251001': 'Haiku',
  'claude-opus-4-6': 'Opus',
};

export function getModelLabel(modelId: string): string {
  return MODEL_LABELS[modelId] || modelId;
}

export const TIERS = {
  free: {
    name: 'Free',
    agents: 10,
    model: 'claude-sonnet-4-20250514',
    maxSimsBeforeAuth: 1,
    maxSimsPerMonth: 5,
    features: ['10 specialist agents', 'Basic verdict', 'Single simulation'],
    advisorsAvailable: false,
    advisorCount: 0,
    selfRefine: false,
    requiresAuth: false,
  },
  pro: {
    name: 'Pro',
    price: 29,
    agents: 10,
    model: 'claude-sonnet-4-20250514',
    maxSimsPerMonth: 100,
    features: ['10 specialist agents', 'Deep analysis + self-refine', 'Full audit trail', 'Agent ELO tracking', 'Crowd Wisdom (+20 advisors)'],
    advisorsAvailable: true,
    advisorCount: 20,
    selfRefine: true,
  },
  max: {
    name: 'Max',
    price: 99,
    agents: 10,
    model: 'claude-sonnet-4-20250514',
    maxSimsPerMonth: -1,
    features: ['Everything in Pro', 'Crowd Wisdom (+50 advisors)', 'Human intervention mid-sim', 'API access'],
    advisorsAvailable: true,
    advisorCount: 50,
    selfRefine: true,
    hitl: true,
  },
  ultra: {
    name: 'Ultra',
    price: 199,
    agents: 10,
    model: 'claude-sonnet-4-20250514',
    maxSimsPerMonth: -1,
    features: ['Everything in Max', 'Crowd Wisdom (+100 advisors)', 'Priority support', 'Custom agent prompts'],
    advisorsAvailable: true,
    advisorCount: 100,
    selfRefine: true,
    hitl: true,
  },
} as const;

export type TierKey = keyof typeof TIERS;

export const ADVISOR_OPTIONS = [
  { count: 20, label: '+ 20 Local Voices', tier: 'pro' as TierKey },
  { count: 50, label: '+ 50 Local Voices', tier: 'max' as TierKey },
  { count: 100, label: '+ 100 Local Voices', tier: 'ultra' as TierKey },
] as const;

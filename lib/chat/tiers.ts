/** Chat uses one default model; simulations use separate billing modes. */
export type ModelTier = 'default';

export const DEFAULT_CHAT_MODEL = 'claude-haiku-4-5-20251001';

export type UserPlan = 'free' | 'pro' | 'max';

export function getModelForTier(_tier: ModelTier): string {
  return DEFAULT_CHAT_MODEL;
}

export function getDefaultTier(_plan: UserPlan): ModelTier {
  return 'default';
}

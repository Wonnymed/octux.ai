export const MODEL_TIERS = {
  /** Chief Simulation Orchestrator — panel / crowd design */
  chief: 'claude-opus-4-20250514',

  // PREMIUM — 10 specialist debate rounds (user sees this quality)
  specialist: 'claude-sonnet-4-20250514',

  // ORCHESTRATOR — Chair synthesis, verdict generation
  orchestrator: 'claude-sonnet-4-20250514',

  // ECONOMY — background processing (user never sees raw output)
  extraction: 'claude-haiku-4-5-20251001', // fact extraction post-sim
  evaluation: 'claude-haiku-4-5-20251001', // evals.ts scoring
  reflection: 'claude-haiku-4-5-20251001', // reflect.ts loop
  memory: 'claude-haiku-4-5-20251001', // hooks.ts memory ops
  crowd: 'claude-haiku-4-5-20251001', // crowd.ts God's View
  optimization: 'claude-haiku-4-5-20251001', // prompt-optimizer.ts
  chat: 'claude-haiku-4-5-20251001', // regular chat (non-sim)
  swarm: 'claude-haiku-4-5-20251001', // swarm mode (1000 agents)
} as const;

export type ModelTier = keyof typeof MODEL_TIERS;

export function getModel(tier: ModelTier): string {
  return MODEL_TIERS[tier];
}

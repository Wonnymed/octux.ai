/**
 * Model routing for simulation + Claude calls.
 * Kept in one place for engine, claude.ts, and follow-up APIs.
 */
export type ModelTier =
  | 'swarm'
  | 'specialist'
  | 'orchestrator'
  | 'chief'
  /** Fast structured extraction (agent picker, etc.) */
  | 'extraction'
  /** High-volume market voice generation */
  | 'crowd'
  /** Standalone chat assistant */
  | 'chat';

const MODEL_IDS: Record<ModelTier, string> = {
  swarm: 'claude-haiku-4-5-20251001',
  specialist: 'claude-sonnet-4-20250514',
  orchestrator: 'claude-sonnet-4-20250514',
  chief: 'claude-opus-4-20250514',
  extraction: 'claude-haiku-4-5-20251001',
  crowd: 'claude-haiku-4-5-20251001',
  chat: 'claude-haiku-4-5-20251001',
};

export const MODEL_TIERS = {
  swarm: MODEL_IDS.swarm,
  specialist: MODEL_IDS.specialist,
  orchestrator: MODEL_IDS.orchestrator,
  chief: MODEL_IDS.chief,
  extraction: MODEL_IDS.extraction,
  crowd: MODEL_IDS.crowd,
  chat: MODEL_IDS.chat,
} as const;

export function getModel(tier: ModelTier): string {
  return MODEL_IDS[tier] ?? MODEL_IDS.specialist;
}

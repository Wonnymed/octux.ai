/**
 * Renamed agent ids — some databases still have old rows in `agent_library`.
 * Canonical ids live in lib/agents/catalog.ts; drop these when merging API + catalog.
 */
export const LEGACY_AGENT_IDS = new Set<string>([
  'reality_check_biz', // → reality_check (business)
  'devils_mirror', // → devils_advocate (relationships)
]);

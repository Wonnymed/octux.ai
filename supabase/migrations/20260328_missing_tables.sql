-- ═══════════════════════════════════════════════════════════════════════════
-- PROMPT 0.3 — Missing memory / graph tables + user_facts bi-temporal + simulations
--
-- Sources: lib/memory/*.ts (behavioral, experiences, opinions, outcomes, optimize,
--          knowledge-graph, agent-improvement, prompt-optimizer, multi-optimizer,
--          procedural, session, team-memory, temporal, recall, cron)
--
-- CANONICAL simulations shape: 001_memory_system.sql (id TEXT, JSONB debate/verdict…).
-- lib/memory/persistence.ts inserts string IDs (e.g. sim_${Date.now()}). The file
-- 20260321_simulations.sql is a LEGACY alternate schema (UUID id, scenario, rounds).
-- If both ever existed on one DB, resolve manually — this migration only ALTERs the
-- 001-style table when present.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── simulations: columns required by persistence.ts / engine (beyond 001) ─────
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'business';
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS share_digest TEXT;
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS disclaimer TEXT;
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- ── user_facts: bi-temporal + recall full-text (lib/memory/temporal.ts, recall.ts) ──
ALTER TABLE user_facts ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ DEFAULT now();
ALTER TABLE user_facts ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;
ALTER TABLE user_facts ADD COLUMN IF NOT EXISTS learned_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE user_facts ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;
ALTER TABLE user_facts ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT true;
ALTER TABLE user_facts ADD COLUMN IF NOT EXISTS superseded_by UUID REFERENCES user_facts(id) ON DELETE SET NULL;

-- Backfill for existing rows (created before these columns existed)
UPDATE user_facts SET learned_at = COALESCE(learned_at, created_at) WHERE learned_at IS NULL;
UPDATE user_facts SET valid_from = COALESCE(valid_from, created_at) WHERE valid_from IS NULL;
UPDATE user_facts SET is_current = COALESCE(is_current, true) WHERE is_current IS NULL;

-- BM25 / plain tsquery search (recall.ts → .textSearch('search_vector', …))
ALTER TABLE user_facts ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_user_facts_search_vector ON user_facts USING gin (search_vector);
CREATE INDEX IF NOT EXISTS idx_user_facts_user_current ON user_facts (user_id) WHERE is_current = true;

-- ============================================
-- TABLE: behavioral_profiles
-- Source: lib/memory/behavioral.ts
-- ============================================
CREATE TABLE IF NOT EXISTS behavioral_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_tolerance DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  speed_preference DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  evidence_threshold DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  optimism_bias DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  detail_preference DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  confidence_calibration DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  inference_confidence DOUBLE PRECISION NOT NULL DEFAULT 0,
  user_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  sim_count_at_inference INTEGER NOT NULL DEFAULT 0,
  inferred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE behavioral_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "behavioral_profiles_own" ON behavioral_profiles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: decision_experiences
-- Source: lib/memory/experiences.ts, outcomes.ts, reflect.ts, recall.ts, …
-- ============================================
CREATE TABLE IF NOT EXISTS decision_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id TEXT NOT NULL,
  question TEXT NOT NULL,
  verdict_recommendation TEXT NOT NULL DEFAULT 'unknown',
  verdict_probability NUMERIC NOT NULL DEFAULT 0,
  verdict_summary TEXT NOT NULL DEFAULT '',
  key_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  agent_consensus JSONB NOT NULL DEFAULT '{}'::jsonb,
  outcome_status TEXT NOT NULL DEFAULT 'pending',
  outcome_notes TEXT,
  outcome_reported_at TIMESTAMPTZ,
  brier_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decision_experiences_user_id ON decision_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_experiences_simulation_id ON decision_experiences(simulation_id);

ALTER TABLE decision_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decision_experiences_own" ON decision_experiences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: decision_opinions
-- Source: lib/memory/opinions.ts, outcomes.ts, reflect.ts, cron.ts, optimize.ts
-- ============================================
CREATE TABLE IF NOT EXISTS decision_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  belief TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  confidence_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  supporting_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  contradicting_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  formed_from_simulation TEXT,
  last_evaluated_simulation TEXT,
  evaluation_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decision_opinions_user_status ON decision_opinions(user_id, status);

ALTER TABLE decision_opinions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decision_opinions_own" ON decision_opinions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: decision_observations
-- Source: lib/memory/opinions.ts, reflect.ts, recall.ts, optimize.ts
-- ============================================
CREATE TABLE IF NOT EXISTS decision_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  strength DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  derived_from_simulations JSONB NOT NULL DEFAULT '[]'::jsonb,
  applicability TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decision_observations_user_status ON decision_observations(user_id, status);

ALTER TABLE decision_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decision_observations_own" ON decision_observations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: calibration_scores
-- Source: lib/memory/outcomes.ts, behavioral.ts
-- ============================================
CREATE TABLE IF NOT EXISTS calibration_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_brier NUMERIC NOT NULL,
  total_outcomes INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calibration_scores_user_calc ON calibration_scores(user_id, calculated_at DESC);

ALTER TABLE calibration_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calibration_scores_own" ON calibration_scores
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: memory_optimization_log
-- Source: lib/memory/optimize.ts
-- ============================================
CREATE TABLE IF NOT EXISTS memory_optimization_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL,
  facts_consolidated INTEGER NOT NULL DEFAULT 0,
  facts_pruned INTEGER NOT NULL DEFAULT 0,
  edges_strengthened INTEGER NOT NULL DEFAULT 0,
  facts_derived INTEGER NOT NULL DEFAULT 0,
  lessons_pruned INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_optimization_log_user ON memory_optimization_log(user_id);

ALTER TABLE memory_optimization_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memory_optimization_log_own" ON memory_optimization_log
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: knowledge_entities
-- Source: lib/memory/knowledge-graph.ts
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  mention_count INTEGER NOT NULL DEFAULT 1,
  first_seen_sim TEXT,
  last_seen_sim TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_entities_user ON knowledge_entities(user_id);

ALTER TABLE knowledge_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_entities_own" ON knowledge_entities
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: knowledge_relations
-- Source: lib/memory/knowledge-graph.ts, optimize.ts, cron.ts
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_entity_id UUID NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  target_entity_id UUID NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  source_simulation_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_relations_user ON knowledge_relations(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_relations_endpoints ON knowledge_relations(source_entity_id, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_relations_user_active_created ON knowledge_relations(user_id, is_active, created_at);

ALTER TABLE knowledge_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_relations_own" ON knowledge_relations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: knowledge_triplets
-- Source: lib/memory/knowledge-graph.ts (SELECT only — materialization may be future)
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_triplets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  target_name TEXT NOT NULL,
  source_type TEXT,
  target_type TEXT,
  relation_type TEXT NOT NULL,
  weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_triplets_user_active ON knowledge_triplets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_triplets_source ON knowledge_triplets(user_id, source_name);

ALTER TABLE knowledge_triplets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_triplets_own" ON knowledge_triplets
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: agent_lessons
-- Source: lib/memory/agent-improvement.ts, optimize.ts, cron.ts
-- ============================================
CREATE TABLE IF NOT EXISTS agent_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  lesson TEXT NOT NULL,
  lesson_type TEXT NOT NULL DEFAULT 'quality',
  derived_from_sim TEXT,
  evidence_count INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_lessons_user_agent ON agent_lessons(user_id, agent_id);

ALTER TABLE agent_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_lessons_own" ON agent_lessons
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: agent_prompt_versions
-- Source: lib/memory/prompt-optimizer.ts, multi-optimizer.ts
-- ============================================
CREATE TABLE IF NOT EXISTS agent_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  role TEXT NOT NULL,
  goal TEXT NOT NULL,
  backstory TEXT NOT NULL,
  sop TEXT,
  extra_constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'optimized',
  critique TEXT,
  improvement_summary TEXT,
  avg_eval_score DOUBLE PRECISION,
  sim_count INTEGER NOT NULL DEFAULT 0,
  total_eval_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id, version)
);

CREATE INDEX IF NOT EXISTS idx_agent_prompt_versions_user_agent_active ON agent_prompt_versions(user_id, agent_id, is_active);

ALTER TABLE agent_prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_prompt_versions_own" ON agent_prompt_versions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: optimization_cycles
-- Source: lib/memory/multi-optimizer.ts
-- ============================================
CREATE TABLE IF NOT EXISTS optimization_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL,
  sim_count_at_trigger INTEGER NOT NULL DEFAULT 0,
  agents_optimized TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  agents_skipped TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  agents_rolled_back TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  total_improvement NUMERIC,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_optimization_cycles_user ON optimization_cycles(user_id, created_at DESC);

ALTER TABLE optimization_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "optimization_cycles_own" ON optimization_cycles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: procedural_rules
-- Source: lib/memory/procedural.ts
-- ============================================
CREATE TABLE IF NOT EXISTS procedural_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  rule TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'methodology',
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0.6,
  source_sims JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_count INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_procedural_rules_user_agent ON procedural_rules(user_id, agent_id);

ALTER TABLE procedural_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "procedural_rules_own" ON procedural_rules
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: session_threads
-- Source: lib/memory/session.ts
-- ============================================
CREATE TABLE IF NOT EXISTS session_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_threads_user_updated ON session_threads(user_id, updated_at DESC);

ALTER TABLE session_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "session_threads_own" ON session_threads
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: session_summaries
-- Source: lib/memory/session.ts
-- ============================================
CREATE TABLE IF NOT EXISTS session_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES session_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id TEXT NOT NULL,
  question TEXT NOT NULL,
  summary TEXT NOT NULL,
  verdict_recommendation TEXT,
  verdict_probability NUMERIC,
  key_insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  sim_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_summaries_thread ON session_summaries(thread_id, sim_order);

ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "session_summaries_own" ON session_summaries
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: working_buffer
-- Source: lib/memory/session.ts, cron.ts
-- ============================================
CREATE TABLE IF NOT EXISTS working_buffer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_type TEXT NOT NULL,
  agent_id TEXT,
  summary TEXT NOT NULL DEFAULT '',
  agent_positions JSONB,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (simulation_id, round_number)
);

CREATE INDEX IF NOT EXISTS idx_working_buffer_user ON working_buffer(user_id);
CREATE INDEX IF NOT EXISTS idx_working_buffer_sim ON working_buffer(simulation_id);

ALTER TABLE working_buffer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "working_buffer_own" ON working_buffer
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: team_insights
-- Source: lib/memory/team-memory.ts
-- ============================================
CREATE TABLE IF NOT EXISTS team_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  insight_type TEXT NOT NULL DEFAULT 'dynamic',
  evidence_count INTEGER NOT NULL DEFAULT 1,
  source_sims JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_insights_user_active ON team_insights(user_id, is_active);

ALTER TABLE team_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_insights_own" ON team_insights
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT SUMMARY (manual validation checklist)
-- ═══════════════════════════════════════════════════════════════════════════
-- Tables created: 17
--   behavioral_profiles, decision_experiences, decision_opinions, decision_observations,
--   calibration_scores, memory_optimization_log, knowledge_entities, knowledge_relations,
--   knowledge_triplets, agent_lessons, agent_prompt_versions, optimization_cycles,
--   procedural_rules, session_threads, session_summaries, working_buffer, team_insights
--
-- Columns added to existing tables:
--   simulations: domain, share_digest, disclaimer, is_public (4)
--   user_facts: valid_from, valid_until, learned_at, expired_at, is_current,
--               superseded_by, search_vector (7)
--
-- Remaining / known mismatches (TypeScript vs DB — not fixed in SQL per instructions):
--   • lib/simulation/*.ts does not use Supabase .from() — N/A
--   • knowledge_triplets: no INSERT path in current TS; table exists for queries / future use
--   • decision_opinions.confidence_history: some code paths JSON.stringify arrays before insert;
--     column is JSONB — ensure runtime passes objects or valid JSON strings Supabase accepts
--   • outcomes.ts updates decision_opinions.confidence_history with raw JS arrays; Postgres JSONB OK
--   • session getOrCreateThread fallback IDs (thread_${Date.now}) are not UUIDs — if used without
--     DB insert, FK to session_threads will not apply (app-layer concern)
--   • decision_experiences.simulation_id: no FK to simulations(id) here (TEXT) to avoid failures
--     when sim rows are missing or id format differs; optional FK can be added later
--   • Legacy 20260321_simulations.sql: if it created a second incompatible table name, rename/drop
--     outside this migration; persistence expects 001_memory_system + this file’s ALTERs
-- ═══════════════════════════════════════════════════════════════════════════

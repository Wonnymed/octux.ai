// ── Hindsight Network 2: Decision Experiences ───────────────
// Logs what Octux recommended and what the outcome was.
// Each completed simulation = 1 experience.

import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────────

export type DecisionExperience = {
  id?: string;
  user_id: string;
  simulation_id: string;
  question: string;
  verdict_recommendation: string;
  verdict_probability: number;
  verdict_summary: string;
  key_risks: string[];
  key_opportunities: string[];
  agent_consensus: Record<string, number>;
  outcome_status: string;
  outcome_notes?: string;
};

// ── Save ───────────────────────────────────────────────────

export async function saveExperience(
  userId: string,
  simulationId: string,
  question: string,
  verdict: Record<string, unknown>,
): Promise<string | null> {
  if (!supabase) return null;

  try {
    const recommendation = (verdict?.recommendation || verdict?.position || 'unknown') as string;
    const probability = (verdict?.probability || verdict?.confidence_score || 0) as number;
    const summary = (verdict?.one_liner || verdict?.summary || `${recommendation} at ${probability}%`) as string;

    const risks = Array.isArray(verdict?.risks)
      ? (verdict.risks as unknown[]).slice(0, 5).map((r: unknown) => typeof r === 'string' ? r : (r as Record<string, string>).description || '')
      : verdict?.main_risk ? [verdict.main_risk as string] : [];

    const opportunities = Array.isArray(verdict?.opportunities)
      ? (verdict.opportunities as unknown[]).slice(0, 5).map((o: unknown) => typeof o === 'string' ? o : (o as Record<string, string>).description || '')
      : verdict?.leverage_point ? [verdict.leverage_point as string] : [];

    const consensus = (verdict?.consensus || verdict?.agent_consensus || { proceed: 0, delay: 0, abandon: 0 }) as Record<string, number>;

    const { data, error } = await supabase
      .from('decision_experiences')
      .insert({
        user_id: userId,
        simulation_id: simulationId,
        question,
        verdict_recommendation: recommendation,
        verdict_probability: probability,
        verdict_summary: summary,
        key_risks: risks,
        key_opportunities: opportunities,
        agent_consensus: consensus,
        outcome_status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[experiences] Save failed:', error.message);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error('[experiences] Save error:', err);
    return null;
  }
}

// ── Read ───────────────────────────────────────────────────

export async function getUserExperiences(userId: string, limit = 10): Promise<DecisionExperience[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('decision_experiences')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as DecisionExperience[];
}

// ── Format for Context Injection ───────────────────────────

export function formatExperiencesForContext(experiences: DecisionExperience[]): string {
  if (experiences.length === 0) return '';

  const lines = experiences.slice(0, 5).map(e => {
    const q = e.question.substring(0, 60);
    const outcome = e.outcome_status !== 'pending'
      ? ` → Outcome: ${e.outcome_status}`
      : '';
    return `  • "${q}..." → ${e.verdict_recommendation.toUpperCase()} (${e.verdict_probability}%)${outcome}`;
  });

  return `\nPREVIOUS DECISIONS:\n${lines.join('\n')}\nConsider how past decisions relate to this new question.`;
}

// ── Update Outcome ─────────────────────────────────────────

export async function updateExperienceOutcome(
  experienceId: string,
  status: 'success' | 'failure' | 'partial' | 'cancelled',
  notes?: string,
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('decision_experiences')
    .update({
      outcome_status: status,
      outcome_notes: notes || null,
      outcome_reported_at: new Date().toISOString(),
    })
    .eq('id', experienceId);

  return !error;
}

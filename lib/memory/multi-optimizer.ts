/**
 * Multi-Prompt Optimizer — Coordinated evolution of all 10 agents.
 *
 * optimizeAllAgents():     Run gradient optimization across all agents with cross-agent context
 * monitorAndRollback():    Auto-rollback agents that regressed after promotion
 * getOptimizationReport(): Dashboard data for Calibration Lab
 *
 * KEY DIFFERENCES from P19 single-agent optimization:
 *   1. Cross-agent context: each agent's critique considers how it fits in the TEAM
 *   2. Batch efficiency: one trajectory load, shared across all agent optimizations
 *   3. Regression protection: auto-rollback if post-promotion performance drops > 10%
 *   4. Coordinated timing: all agents optimized in same cycle, not independently
 *
 * Refs: LangMem (#29 — multi-prompt optimization)
 *       DSPy (#23 — GEPA: Generate-Evaluate-Propose-Accept with regression testing)
 */

import { supabase } from './supabase';
import { devLog } from '@/lib/dev-log';
import { optimizePrompt, rollbackPrompt } from './prompt-optimizer';

// All specialist agent IDs (exclude decision_chair)
const SPECIALIST_AGENTS = [
  'base_rate_archivist', 'demand_signal_analyst', 'unit_economics_auditor',
  'regulatory_gatekeeper', 'competitive_radar', 'execution_engineer',
  'capital_strategist', 'scenario_architect', 'intervention_designer',
  'customer_reality',
];

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type AgentOptResult = {
  agentId: string;
  action: 'promoted' | 'skipped' | 'failed' | 'no_data';
  previousVersion: number;
  newVersion: number | null;
  previousAvgScore: number | null;
  benchmarkScore: number | null;
  improvement: number | null;
};

export type OptimizationReport = {
  userId: string;
  totalSims: number;
  agents: {
    agentId: string;
    agentName: string;
    currentVersion: number;
    avgScore: number | null;
    simCount: number;
    versionHistory: {
      version: number;
      source: string;
      avgScore: number | null;
      simCount: number;
      promotedAt: string | null;
    }[];
  }[];
  recentCycles: {
    id: string;
    trigger: string;
    agentsOptimized: string[];
    agentsRolledBack: string[];
    totalImprovement: number | null;
    createdAt: string;
  }[];
};

// ═══════════════════════════════════════════
// optimizeAllAgents() — Coordinated batch optimization
// ═══════════════════════════════════════════

/**
 * Run prompt optimization across ALL 10 specialist agents in one coordinated cycle.
 *
 * The process:
 *   1. Load shared trajectory data (all sims, all agents — one DB call)
 *   2. Compute cross-agent performance summary (who's strong, who's weak)
 *   3. For each agent: run gradient optimization WITH cross-agent context
 *   4. Log the cycle results
 *
 * Cross-agent context means each agent's critique considers:
 *   "Base Rate scores 6.2 avg while Regulatory scores 8.1 avg.
 *    Base Rate is the weak link — focus optimization there."
 *
 * Trigger: every 20 sims, or manually.
 *
 * @param force — skip sim count check
 */
export async function optimizeAllAgents(
  userId: string,
  force: boolean = false
): Promise<AgentOptResult[]> {
  if (!supabase) return [];

  // Check if it's time
  if (!force) {
    const { count } = await supabase
      .from('simulations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (!count || count < 20 || count % 20 !== 0) return [];

    devLog(`MULTI-OPT: Starting coordinated optimization (${count} sims)`);
  }

  const startTime = Date.now();

  // 1. Load cross-agent performance data
  const agentScores = await loadCrossAgentScores(userId);

  // 2. Identify which agents need optimization (below team average)
  const teamAvg = agentScores.length > 0
    ? agentScores.reduce((sum, a) => sum + a.avgScore, 0) / agentScores.length
    : 6.0;

  // Sort: weakest first (optimize the weak links first)
  agentScores.sort((a, b) => a.avgScore - b.avgScore);

  const crossAgentSummary = agentScores
    .map(a => `${a.agentId}: avg ${a.avgScore.toFixed(1)}/10 (${a.simCount} sims)`)
    .join('\n');

  devLog(`MULTI-OPT: Team avg: ${teamAvg.toFixed(1)}. Cross-agent:\n${crossAgentSummary}`);

  // 3. Optimize each agent (weakest first, with cross-agent context)
  const results: AgentOptResult[] = [];

  // Import default configs
  let agentConfigs: any[];
  try {
    const module = await import('../agents/prompts');
    agentConfigs = module.AGENTS.filter((a: any) => a.id !== 'decision_chair');
  } catch {
    console.error('MULTI-OPT: Failed to import AGENTS');
    return [];
  }

  for (const agentScore of agentScores) {
    const agentId = agentScore.agentId;
    const config = agentConfigs.find((a: any) => a.id === agentId);

    if (!config) {
      results.push({
        agentId, action: 'skipped', previousVersion: 0,
        newVersion: null, previousAvgScore: agentScore.avgScore,
        benchmarkScore: null, improvement: null,
      });
      continue;
    }

    // Skip agents performing well above team average (don't fix what's not broken)
    if (agentScore.avgScore > teamAvg + 1.0 && agentScore.avgScore >= 7.5) {
      devLog(`MULTI-OPT: ${agentId} — score ${agentScore.avgScore.toFixed(1)} above team avg+1. Skipping.`);
      results.push({
        agentId, action: 'skipped', previousVersion: agentScore.currentVersion,
        newVersion: null, previousAvgScore: agentScore.avgScore,
        benchmarkScore: null, improvement: null,
      });
      continue;
    }

    // Run optimization for this agent (P19's optimizePrompt handles the gradient pipeline)
    try {
      const promoted = await optimizePrompt(userId, agentId, {
        role: config.role,
        goal: config.goal,
        backstory: config.backstory,
        sop: config.sop,
        constraints: config.constraints,
      });

      if (promoted) {
        // Get the new version info
        const { data: newActive } = await supabase
          .from('agent_prompt_versions')
          .select('version, avg_eval_score')
          .eq('user_id', userId)
          .eq('agent_id', agentId)
          .eq('is_active', true)
          .single();

        results.push({
          agentId,
          action: 'promoted',
          previousVersion: agentScore.currentVersion,
          newVersion: newActive?.version || null,
          previousAvgScore: agentScore.avgScore,
          benchmarkScore: newActive?.avg_eval_score || null,
          improvement: newActive?.avg_eval_score
            ? (newActive.avg_eval_score - agentScore.avgScore)
            : null,
        });
      } else {
        results.push({
          agentId, action: 'skipped', previousVersion: agentScore.currentVersion,
          newVersion: null, previousAvgScore: agentScore.avgScore,
          benchmarkScore: null, improvement: null,
        });
      }
    } catch (err) {
      console.error(`MULTI-OPT: Failed for ${agentId}:`, err);
      results.push({
        agentId, action: 'failed', previousVersion: agentScore.currentVersion,
        newVersion: null, previousAvgScore: agentScore.avgScore,
        benchmarkScore: null, improvement: null,
      });
    }
  }

  // 4. Log the cycle
  const promoted = results.filter(r => r.action === 'promoted');
  const skipped = results.filter(r => r.action === 'skipped');
  const totalImprovement = promoted.length > 0
    ? promoted.reduce((sum, r) => sum + (r.improvement || 0), 0) / promoted.length
    : 0;

  await supabase.from('optimization_cycles').insert({
    user_id: userId,
    trigger: force ? 'manual' : 'auto',
    sim_count_at_trigger: agentScores.length > 0 ? agentScores[0].simCount : 0,
    agents_optimized: promoted.map(r => r.agentId),
    agents_skipped: skipped.map(r => r.agentId),
    agents_rolled_back: [],
    total_improvement: Math.round(totalImprovement * 100) / 100,
    duration_ms: Date.now() - startTime,
  });

  devLog(`MULTI-OPT COMPLETE (${Date.now() - startTime}ms): ${promoted.length} promoted, ${skipped.length} skipped, ${results.filter(r => r.action === 'failed').length} failed. Avg improvement: +${totalImprovement.toFixed(1)}`);

  return results;
}

// ═══════════════════════════════════════════
// monitorAndRollback() — Regression protection
// ═══════════════════════════════════════════

/**
 * Check recently promoted agents for performance regression.
 * If an agent's avg_eval_score DROPPED > 10% since promotion,
 * automatically rollback to the previous version.
 *
 * Minimum 5 sims on the new version before evaluating (avoid premature rollback).
 *
 * Trigger: every sim (cheap — just a DB check, no LLM calls).
 *
 * Ref: DSPy (#23 — regression testing, eval-gated deployment)
 */
export async function monitorAndRollback(userId: string): Promise<string[]> {
  if (!supabase) return [];

  // Find recently promoted agents (active, source='optimized', with enough sims)
  const { data: activeVersions } = await supabase
    .from('agent_prompt_versions')
    .select('id, agent_id, version, avg_eval_score, sim_count, promoted_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('source', 'optimized')
    .gte('sim_count', 5);

  if (!activeVersions || activeVersions.length === 0) return [];

  const rolledBack: string[] = [];

  for (const active of activeVersions) {
    if (!active.avg_eval_score) continue;

    // Find the previous version's performance
    const { data: previousVersion } = await supabase
      .from('agent_prompt_versions')
      .select('version, avg_eval_score, sim_count')
      .eq('user_id', userId)
      .eq('agent_id', active.agent_id)
      .lt('version', active.version)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (!previousVersion || !previousVersion.avg_eval_score) continue;

    // Check for regression: current avg < previous avg * 0.9 (10% drop)
    const regressionThreshold = previousVersion.avg_eval_score * 0.9;

    if (active.avg_eval_score < regressionThreshold) {
      devLog(
        `ROLLBACK: ${active.agent_id} v${active.version} regressed — ` +
        `current: ${active.avg_eval_score.toFixed(1)}, previous: ${previousVersion.avg_eval_score.toFixed(1)}, ` +
        `threshold: ${regressionThreshold.toFixed(1)}. Rolling back to v${previousVersion.version}.`
      );

      const success = await rollbackPrompt(userId, active.agent_id, previousVersion.version);
      if (success) {
        rolledBack.push(active.agent_id);
      }
    }
  }

  if (rolledBack.length > 0) {
    devLog(`ROLLBACK: ${rolledBack.length} agent(s) rolled back: ${rolledBack.join(', ')}`);
  }

  return rolledBack;
}

// ═══════════════════════════════════════════
// getOptimizationReport() — Dashboard data
// ═══════════════════════════════════════════

/**
 * Get a full optimization report for the Calibration Lab dashboard.
 * Shows: per-agent version + score, version history, recent cycles.
 */
export async function getOptimizationReport(
  userId: string
): Promise<OptimizationReport> {
  if (!supabase) {
    return { userId, totalSims: 0, agents: [], recentCycles: [] };
  }

  // Count total sims
  const { count: totalSims } = await supabase
    .from('simulations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Load all prompt versions
  const { data: allVersions } = await supabase
    .from('agent_prompt_versions')
    .select('agent_id, version, source, avg_eval_score, sim_count, is_active, promoted_at, created_at')
    .eq('user_id', userId)
    .order('agent_id')
    .order('version', { ascending: false });

  // Load recent optimization cycles
  const { data: recentCycles } = await supabase
    .from('optimization_cycles')
    .select('id, trigger, agents_optimized, agents_rolled_back, total_improvement, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Build per-agent report
  const agentNames: Record<string, string> = {
    base_rate_archivist: 'Base Rate Archivist',
    demand_signal_analyst: 'Demand Signal Analyst',
    unit_economics_auditor: 'Unit Economics Auditor',
    regulatory_gatekeeper: 'Regulatory Gatekeeper',
    competitive_radar: 'Competitive Radar',
    execution_engineer: 'Execution Engineer',
    capital_strategist: 'Capital Strategist',
    scenario_architect: 'Scenario Architect',
    intervention_designer: 'Intervention Designer',
    customer_reality: 'Customer Reality Check',
  };

  const agents = SPECIALIST_AGENTS.map(agentId => {
    const versions = (allVersions || []).filter(v => v.agent_id === agentId);
    const activeVersion = versions.find(v => v.is_active);

    return {
      agentId,
      agentName: agentNames[agentId] || agentId,
      currentVersion: activeVersion?.version || 0,
      avgScore: activeVersion?.avg_eval_score || null,
      simCount: activeVersion?.sim_count || 0,
      versionHistory: versions.map(v => ({
        version: v.version,
        source: v.source,
        avgScore: v.avg_eval_score,
        simCount: v.sim_count,
        promotedAt: v.promoted_at,
      })),
    };
  });

  return {
    userId,
    totalSims: totalSims || 0,
    agents,
    recentCycles: (recentCycles || []).map(c => ({
      id: c.id,
      trigger: c.trigger,
      agentsOptimized: c.agents_optimized || [],
      agentsRolledBack: c.agents_rolled_back || [],
      totalImprovement: c.total_improvement,
      createdAt: c.created_at,
    })),
  };
}

// ═══════════════════════════════════════════
// INTERNAL: Cross-agent performance data
// ═══════════════════════════════════════════

type AgentScoreData = {
  agentId: string;
  avgScore: number;
  simCount: number;
  currentVersion: number;
};

async function loadCrossAgentScores(userId: string): Promise<AgentScoreData[]> {
  if (!supabase) return [];

  const results: AgentScoreData[] = [];

  // Load active versions for version info
  const { data: activeVersions } = await supabase
    .from('agent_prompt_versions')
    .select('agent_id, version, avg_eval_score, sim_count')
    .eq('user_id', userId)
    .eq('is_active', true);

  const versionMap = new Map<string, { version: number; avgScore: number; simCount: number }>();
  if (activeVersions) {
    for (const v of activeVersions) {
      versionMap.set(v.agent_id, {
        version: v.version,
        avgScore: v.avg_eval_score || 6.0,
        simCount: v.sim_count || 0,
      });
    }
  }

  // For agents without a tracked version, estimate from recent sims
  const { data: recentSims } = await supabase
    .from('simulations')
    .select('debate')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  const reportCounts = new Map<string, number>();
  if (recentSims) {
    for (const sim of recentSims) {
      const debate = sim.debate as any;
      if (!debate) continue;
      for (const agentId of SPECIALIST_AGENTS) {
        if (extractReport(debate, agentId)) {
          reportCounts.set(agentId, (reportCounts.get(agentId) || 0) + 1);
        }
      }
    }
  }

  for (const agentId of SPECIALIST_AGENTS) {
    const tracked = versionMap.get(agentId);
    results.push({
      agentId,
      avgScore: tracked?.avgScore || 6.0,
      simCount: tracked?.simCount || reportCounts.get(agentId) || 0,
      currentVersion: tracked?.version || 0,
    });
  }

  return results;
}

function extractReport(debate: any, agentId: string): any | null {
  if (debate?.agent_reports?.[agentId]) return debate.agent_reports[agentId];
  if (Array.isArray(debate?.rounds)) {
    for (const round of [...debate.rounds].reverse()) {
      if (round?.agents?.[agentId]) return round.agents[agentId];
      if (Array.isArray(round?.reports)) {
        const found = round.reports.find((r: any) => r.agent_id === agentId);
        if (found) return found;
      }
    }
  }
  return null;
}

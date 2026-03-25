/**
 * Per-Agent Knowledge Injection — MiroFish individual memory pattern.
 * Each specialist agent receives knowledge graph entities/relations
 * RELEVANT to their expertise, not the full graph dump.
 *
 * Refs: MiroFish (#10 — individual + collective dual memory)
 *       Cognee (#22 — ontology-grounded entity queries)
 *       Agno (#11 — agent-level memory scope)
 */

import {
  getEntities,
  getTriplets,
  type OctuxEntityType,
  type OctuxRelationType,
} from './knowledge-graph';

// ═══════════════════════════════════════════
// AGENT → ENTITY/RELATION AFFINITY MAP
// ═══════════════════════════════════════════

type AgentKnowledgeProfile = {
  primaryEntityTypes: OctuxEntityType[];
  secondaryEntityTypes: OctuxEntityType[];
  primaryRelationTypes: OctuxRelationType[];
  contextLabel: string;
};

export const AGENT_KNOWLEDGE_MAP: Record<string, AgentKnowledgeProfile> = {
  base_rate_archivist: {
    primaryEntityTypes: ['market', 'metric', 'decision'],
    secondaryEntityTypes: ['company', 'risk'],
    primaryRelationTypes: ['targets_market', 'costs', 'risks'],
    contextLabel: 'HISTORICAL & STATISTICAL CONTEXT',
  },
  demand_signal_analyst: {
    primaryEntityTypes: ['market', 'product', 'metric'],
    secondaryEntityTypes: ['company', 'location', 'opportunity'],
    primaryRelationTypes: ['targets_market', 'competes_with', 'enables'],
    contextLabel: 'MARKET & DEMAND CONTEXT',
  },
  unit_economics_auditor: {
    primaryEntityTypes: ['metric', 'resource', 'product'],
    secondaryEntityTypes: ['company', 'location', 'milestone'],
    primaryRelationTypes: ['costs', 'has_budget', 'depends_on'],
    contextLabel: 'FINANCIAL & UNIT ECONOMICS CONTEXT',
  },
  regulatory_gatekeeper: {
    primaryEntityTypes: ['regulation', 'location', 'milestone'],
    secondaryEntityTypes: ['company', 'risk', 'market'],
    primaryRelationTypes: ['requires', 'regulated_by', 'blocks'],
    contextLabel: 'REGULATORY & COMPLIANCE CONTEXT',
  },
  competitive_intel: {
    primaryEntityTypes: ['company', 'market', 'product'],
    secondaryEntityTypes: ['person', 'metric', 'opportunity'],
    primaryRelationTypes: ['competes_with', 'targets_market', 'supplies'],
    contextLabel: 'COMPETITIVE LANDSCAPE CONTEXT',
  },
  execution_operator: {
    primaryEntityTypes: ['milestone', 'resource', 'person'],
    secondaryEntityTypes: ['risk', 'product', 'company'],
    primaryRelationTypes: ['depends_on', 'employs', 'launches_at'],
    contextLabel: 'EXECUTION & OPERATIONS CONTEXT',
  },
  capital_allocator: {
    primaryEntityTypes: ['metric', 'resource', 'company'],
    secondaryEntityTypes: ['milestone', 'risk', 'opportunity'],
    primaryRelationTypes: ['has_budget', 'costs', 'depends_on'],
    contextLabel: 'CAPITAL & FUNDING CONTEXT',
  },
  scenario_planner: {
    primaryEntityTypes: ['risk', 'opportunity', 'decision'],
    secondaryEntityTypes: ['market', 'milestone', 'metric'],
    primaryRelationTypes: ['risks', 'enables', 'blocks'],
    contextLabel: 'SCENARIO & RISK CONTEXT',
  },
  intervention_optimizer: {
    primaryEntityTypes: ['decision', 'resource', 'opportunity'],
    secondaryEntityTypes: ['person', 'milestone', 'product'],
    primaryRelationTypes: ['enables', 'decided', 'depends_on'],
    contextLabel: 'INTERVENTION & ACTION CONTEXT',
  },
  customer_reality: {
    primaryEntityTypes: ['product', 'market', 'person'],
    secondaryEntityTypes: ['company', 'metric', 'location'],
    primaryRelationTypes: ['targets_market', 'competes_with', 'costs'],
    contextLabel: 'CUSTOMER & PRODUCT-FIT CONTEXT',
  },
};

// ═══════════════════════════════════════════
// BATCH PER-AGENT KNOWLEDGE BUILDER
// ═══════════════════════════════════════════

/**
 * Build knowledge context for ALL agents in one batch.
 * Fetches all entities once (2 DB queries), then routes to each agent.
 */
export async function buildAllAgentKnowledge(
  userId: string
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  const [allEntities, allTriplets] = await Promise.all([
    getEntities(userId, undefined, 60),
    getTriplets(userId, 40),
  ]);

  if (allEntities.length === 0 && allTriplets.length === 0) {
    return result;
  }

  for (const [agentId, profile] of Object.entries(AGENT_KNOWLEDGE_MAP)) {
    const primaryEnts = allEntities
      .filter((e: Record<string, unknown>) => profile.primaryEntityTypes.includes(e.entity_type as OctuxEntityType))
      .slice(0, 8);
    const secondaryEnts = allEntities
      .filter((e: Record<string, unknown>) => profile.secondaryEntityTypes.includes(e.entity_type as OctuxEntityType))
      .slice(0, 4);
    const relevantRels = allTriplets
      .filter((t: Record<string, unknown>) => profile.primaryRelationTypes.includes(t.relation_type as OctuxRelationType))
      .slice(0, 8);

    if (primaryEnts.length === 0 && secondaryEnts.length === 0 && relevantRels.length === 0) {
      continue;
    }

    let context = `\n── ${profile.contextLabel} ──\n`;

    if (primaryEnts.length > 0) {
      context += 'Known entities:\n';
      for (const e of primaryEnts) {
        context += `  • ${e.name} (${e.entity_type})`;
        if (e.description) context += ` — ${e.description}`;
        if ((e.mention_count as number) > 1) context += ` [seen ${e.mention_count}x]`;
        context += '\n';
      }
    }

    if (secondaryEnts.length > 0) {
      context += 'Related:\n';
      for (const e of secondaryEnts) {
        context += `  • ${e.name} (${e.entity_type})`;
        if (e.description) context += ` — ${e.description}`;
        context += '\n';
      }
    }

    if (relevantRels.length > 0) {
      context += 'Known relationships:\n';
      for (const t of relevantRels) {
        context += `  • ${t.source_name} —[${t.relation_type}]→ ${t.target_name}`;
        if ((t.weight as number) > 1.5) context += ' (confirmed)';
        context += '\n';
      }
    }

    context += '────────────────────────\n';
    context += 'Ground your analysis in these known facts.\n';

    result.set(agentId, context);
  }

  return result;
}

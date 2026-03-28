import Anthropic from '@anthropic-ai/sdk';
import {
  getModel,
  MODEL_TIERS,
  type ModelTier,
} from '@/lib/config/model-tiers';

export type { ModelTier };
export { getModel, MODEL_TIERS };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Default when no `tier` or `model` is passed — specialist debate quality. */
export const DEFAULT_MODEL = MODEL_TIERS.specialist;

export type CallClaudeOptions = {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  /** Explicit model id — overrides `tier` when set. */
  model?: string;
  /** Routing tier (Sonnet vs Haiku). Ignored when `model` is set. */
  tier?: ModelTier;
};

export async function callClaude(options: CallClaudeOptions): Promise<string> {
  const { systemPrompt, userMessage, maxTokens = 1024 } = options;
  const model =
    options.model ??
    (options.tier ? getModel(options.tier) : getModel('specialist'));

  console.log(
    `[MODEL] ${options.tier ?? (options.model ? 'explicit' : 'default')} → ${model}`,
  );

  try {
    const timeoutMs = 30000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Claude API timeout after ${timeoutMs}ms`)), timeoutMs),
    );

    const response = await Promise.race([
      client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      timeoutPromise,
    ]);
    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

export function parseJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// ═══════════════════════════════════════════
// WEB SEARCH — Agent search config + tool call
// ═══════════════════════════════════════════

export type AgentSearchConfig = {
  enabled: boolean;
  maxSearches: number;
  searchContext: string;
};

export const AGENT_SEARCH_CONFIG: Record<string, AgentSearchConfig> = {
  // HIGH SEARCH — verifiable data agents
  base_rate_archivist: {
    enabled: true, maxSearches: 2,
    searchContext: 'Search for: market statistics, industry reports, growth rates, comparable benchmarks. Prefer official sources (government data, industry associations, research firms).',
  },
  regulatory_gatekeeper: {
    enabled: true, maxSearches: 2,
    searchContext: 'Search for: permits, licenses, regulations, compliance requirements, government agency guidelines. Look for official government sources and legal databases.',
  },
  demand_signal_analyst: {
    enabled: true, maxSearches: 2,
    searchContext: 'Search for: market trends, consumer behavior data, demand indicators, industry growth forecasts. Look for recent reports and market analysis.',
  },
  // LOW SEARCH — mixed data agents
  competitive_intel: {
    enabled: true, maxSearches: 1,
    searchContext: 'Search for: competitor companies, market players, competitive landscape in the relevant industry and location.',
  },
  unit_economics_auditor: {
    enabled: true, maxSearches: 1,
    searchContext: 'Search for: cost benchmarks, pricing data, industry margins, breakeven references for similar businesses.',
  },
  capital_allocator: {
    enabled: true, maxSearches: 1,
    searchContext: 'Search for: funding trends, investment data, startup funding benchmarks in the relevant market.',
  },
  scenario_planner: {
    enabled: true, maxSearches: 1,
    searchContext: 'Search for: risk factors, industry failure rates, scenario data, economic indicators relevant to the decision.',
  },
  // NO SEARCH — qualitative/action agents
  execution_operator:      { enabled: false, maxSearches: 0, searchContext: '' },
  intervention_optimizer:  { enabled: false, maxSearches: 0, searchContext: '' },
  customer_reality:        { enabled: false, maxSearches: 0, searchContext: '' },
  decision_chair:          { enabled: false, maxSearches: 0, searchContext: '' },
};

export type SearchCitation = {
  url: string;
  title: string;
  snippet: string;
  source_domain: string;
  cited_by_agent: string;
};

export type ToolCallResult = {
  text: string;
  searchCitations: SearchCitation[];
  searchCount: number;
};

export type CallClaudeWithToolsOptions = {
  systemPrompt: string;
  userMessage: string;
  agentId: string;
  maxTokens?: number;
  model?: string;
  tier?: ModelTier;
  /** When set with maxUses > 0, enables web search regardless of AGENT_SEARCH_CONFIG. */
  forceWebSearch?: { maxUses: number; searchContext?: string };
};

/**
 * Call Claude with web search tool enabled.
 * Handles multi-block responses: text + tool_use + web_search_tool_result.
 * Falls back to regular callClaude if search is disabled or fails.
 */
export async function callClaudeWithTools(
  options: CallClaudeWithToolsOptions,
): Promise<ToolCallResult> {
  const forced = options.forceWebSearch;
  const searchConfig = AGENT_SEARCH_CONFIG[options.agentId];
  const maxUsesFromForced = forced && forced.maxUses > 0 ? forced.maxUses : 0;
  const maxUsesFromConfig = searchConfig?.enabled ? searchConfig.maxSearches : 0;
  const maxUses = maxUsesFromForced > 0 ? maxUsesFromForced : maxUsesFromConfig;
  const searchEnabled = maxUses > 0;
  const searchContext =
    (forced && forced.maxUses > 0 ? forced.searchContext : undefined) ||
    searchConfig?.searchContext ||
    'Search for current, verifiable data relevant to your task. Prefer primary sources.';

  if (!searchEnabled) {
    const text = await callClaude({
      systemPrompt: options.systemPrompt,
      userMessage: options.userMessage,
      maxTokens: options.maxTokens,
      model: options.model,
      tier: options.tier,
    });
    return { text, searchCitations: [], searchCount: 0 };
  }

  try {
    const model =
      options.model ??
      (options.tier ? getModel(options.tier) : getModel('specialist'));
    console.log(
      `[MODEL] ${options.tier ?? (options.model ? 'explicit' : 'default')} (tools) → ${model}`,
    );
    const timeoutMs = 45000; // longer timeout for search
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Claude API timeout after ${timeoutMs}ms`)), timeoutMs),
    );

    const response = await Promise.race([
      client.messages.create({
        model,
        max_tokens: options.maxTokens || 1500,
        system: `${options.systemPrompt}\n\nWEB SEARCH: You have access to web search. ${searchContext}\nUse search to VERIFY your claims with real, current data. Cite your sources. If search returns no useful results, state that clearly and proceed with your best analysis.`,
        messages: [{ role: 'user', content: options.userMessage }],
        tools: [
          {
            type: 'web_search_20250305' as any,
            name: 'web_search',
            max_uses: maxUses,
          } as any,
        ],
      }),
      timeoutPromise,
    ]);

    const textParts: string[] = [];
    const citations: SearchCitation[] = [];
    let searchCount = 0;

    for (const block of response.content) {
      if (block.type === 'text') {
        textParts.push(block.text);
      }
      if ((block as any).type === 'web_search_tool_result') {
        searchCount++;
        const searchContent = (block as any).content;
        if (Array.isArray(searchContent)) {
          for (const result of searchContent) {
            if (result.type === 'web_search_result' && result.url) {
              citations.push({
                url: result.url,
                title: result.title || '',
                snippet: (result.page_content || result.encrypted_content || '').substring(0, 200),
                source_domain: extractDomain(result.url),
                cited_by_agent: options.agentId,
              });
            }
          }
        }
      }
    }

    const fullText = textParts.join('\n\n');

    if (searchCount > 0) {
      console.log(`SEARCH: ${options.agentId} made ${searchCount} search(es), found ${citations.length} sources`);
    }

    return { text: fullText, searchCitations: citations, searchCount };
  } catch (err) {
    console.error(`SEARCH: callClaudeWithTools failed for ${options.agentId}, falling back:`, err);
    const text = await callClaude({
      systemPrompt: options.systemPrompt,
      userMessage: options.userMessage,
      maxTokens: options.maxTokens,
      model: options.model,
      tier: options.tier,
    });
    return { text, searchCitations: [], searchCount: 0 };
  }
}

/**
 * Deduplicate and format search citations for simulation output.
 */
export function formatSearchCitations(
  allCitations: SearchCitation[],
): { agent: string; url: string; title: string; domain: string }[] {
  const seen = new Set<string>();
  const unique: SearchCitation[] = [];
  for (const c of allCitations) {
    if (!seen.has(c.url)) {
      seen.add(c.url);
      unique.push(c);
    }
  }
  return unique.map(c => ({
    agent: c.cited_by_agent,
    url: c.url,
    title: c.title,
    domain: c.source_domain,
  }));
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.substring(0, 50);
  }
}

/** Display helper: shows PRODUCTION model names in UI (not the test model) */
export function getDisplayModel(tier?: string): string {
  if (tier === 'max') return 'Opus';
  return 'Sonnet';
}

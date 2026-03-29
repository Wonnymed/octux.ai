/**
 * Sukgo decision chat — memory-aware conversational AI.
 * User memory is optional context: injected with strict “use only when relevant” rules.
 */

import { supabase } from '../memory/supabase';
import { callClaude } from '../simulation/claude';
import { loadMemoryForSimulation, formatMemoryContext } from '../memory/core-memory';
import { getTopKMemories } from '../memory/recall';
import { getOrCreateProfile, formatBehavioralContext } from '../memory/behavioral';
import { detectDomain, getDisclaimer } from '../simulation/domain';
import { searchKnowledge, formatKnowledgeForAgent } from '../knowledge/search';
import { parseQuestionForFacts, applyFactActions } from '../memory/facts';
import type { ModelTier } from './tiers';
import { userRequestedContextFree } from './memoryPolicy';

export type ChatWithMemoryOptions = {
  /** Settings → Profile → Decision context (user-written); injected with "use sparingly" rules */
  settingsDecisionContext?: string;
};

function formatSettingsDecisionContextBlock(text: string): string {
  const t = text.trim();
  if (!t) return '';
  return `## User-written background (from Settings)
The user chose to save this as general decision context. It is **reference only**.

RULES:
- Use it **sparingly** and only when it clearly improves the answer to the **current** message.
- Do **not** open responses by restating this block.
- If the current question is unrelated, ignore it.

Decision context:
${t}`;
}

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  response: string;
  tier: ModelTier;
  suggestSimulation: boolean;
  simulationPrompt?: string;
  factsExtracted: number;
  disclaimer?: string;
  relatedSimulations?: { id: string; question: string; verdict: string }[];
};

// ═══════════════════════════════════════════
// buildChatContext() — Assemble full memory context
// ═══════════════════════════════════════════

async function buildChatContext(userId: string, currentMessage: string): Promise<string> {
  const [memoryPayload, topKMemories, behavioralProfile] = await Promise.all([
    loadMemoryForSimulation(userId, currentMessage),
    getTopKMemories(userId, currentMessage, 5),
    getOrCreateProfile(userId),
  ]);

  const sections: string[] = [];

  // Core memory (who is this person)
  if (memoryPayload) {
    const memCtx = formatMemoryContext(memoryPayload);
    if (memCtx) sections.push(memCtx);
  }

  // Behavioral context (how to communicate with them)
  const behavioralText = formatBehavioralContext(behavioralProfile);
  if (behavioralText) sections.push(behavioralText);

  // Relevant memories (facts, experiences, opinions related to this question)
  if (topKMemories) sections.push(topKMemories);

  // Knowledge graph is already folded into the core memory BUSINESS block via loadMemoryForSimulation

  // Recent simulations — only list lines that overlap the current question (avoid dumping unrelated past runs)
  if (supabase) {
    const { data: recentSims } = await supabase
      .from('simulations')
      .select('id, question, verdict, domain, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(8);

    if (recentSims && recentSims.length > 0) {
      const msgWords = currentMessage
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const relevant = recentSims.filter((s) => {
        const q = ((s.question || '') as string).toLowerCase();
        return msgWords.some((w) => q.includes(w));
      });
      const list = (relevant.length > 0 ? relevant : []).slice(0, 3);
      if (list.length > 0) {
        const simSummary = list
          .map((s) => {
            const v = s.verdict as Record<string, unknown> | null;
            const q = (s.question || '').substring(0, 60);
            const rec = String(v?.recommendation || '?').toUpperCase();
            const prob = v?.probability ?? 0;
            return `  • "${q}..." → ${rec} (${prob}%) [${s.domain || 'business'}]`;
          })
          .join('\n');
        sections.push(`\nRELATED PAST SIMULATIONS (topic overlap with current message):\n${simSummary}`);
      } else {
        sections.push(
          `\nNOTE: User has ${recentSims.length} past simulation(s) on file — do not list or assume topics unless they clearly match the current question.`,
        );
      }
    }
  }

  return sections.filter(Boolean).join('\n\n');
}

/** Wraps raw DB-derived context with explicit conditional-use rules for the model. */
function wrapUserContextForPrompt(rawBody: string): string {
  const body = rawBody.trim();
  if (!body) return '';

  return `## User context (use ONLY when directly relevant)
The following is background from past sessions, profile, and stored facts.

RULES FOR USING THIS CONTEXT:
- Only reference it if the user's **current** message is **directly** related to it.
- For general or factual questions, answer directly first. Do **not** open with a biography, budget list, or recap of every past topic.
- If the user asked to ignore or forget prior context this turn, none of this applies (it should not have been injected — if you still see stale chat history above, ignore it for personalization).
- Never refuse to answer because stored context is incomplete — give a direct, useful answer first.
- Do **not** pad responses by restating everything you know about the user.
- Keep most answers under ~200 words unless the user clearly needs depth; offer to go deeper if useful.

Context:
${body}
`;
}

// ═══════════════════════════════════════════
// chatWithMemory() — Main chat function
// ═══════════════════════════════════════════

const CHAT_MAX_TOKENS = 2048;

export async function chatWithMemory(
  userId: string,
  message: string,
  history: ChatMessage[],
  tier: ModelTier = 'default',
  options?: ChatWithMemoryOptions,
): Promise<ChatResponse> {
  const contextFree = userRequestedContextFree(message);

  // 1. User-specific memory (skip entirely when they ask for a clean answer)
  let rawUserContext = contextFree ? '' : await buildChatContext(userId, message);
  if (!contextFree && options?.settingsDecisionContext?.trim()) {
    const block = formatSettingsDecisionContextBlock(options.settingsDecisionContext);
    rawUserContext = rawUserContext ? `${rawUserContext}\n\n${block}` : block;
  }
  const memoryContext = contextFree ? '' : wrapUserContextForPrompt(rawUserContext);

  // 2. Detect domain for potential disclaimer
  const domain = await detectDomain(message);
  const disclaimer = getDisclaimer(domain.domain);

  // 3. RAG: Search relevant knowledge for chat response (P43)
  let ragContext = '';
  try {
    const domainKnowledgeMap: Record<string, string[]> = {
      investment: ['crypto-opsec', 'banking', 'economics', 'market-intel', 'risk-intel'],
      business: ['market-intel', 'logistics', 'legal', 'economics'],
      career: ['negotiation-warfare'],
      legal: ['legal', 'regulatory-compliance'],
      technology: ['cybersecurity', 'intelligence-systems'],
    };
    const searchCategories = domainKnowledgeMap[domain.domain] || [];
    if (searchCategories.length > 0) {
      const chunks = await searchKnowledge(message, {
        categories: searchCategories,
        limit: 3,
        minSimilarity: 0.4,
      });
      if (chunks.length > 0) {
        ragContext = formatKnowledgeForAgent(chunks, 'Sukgo Chat');
      }
    }
  } catch {} // non-blocking

  // 4. WAL: extract any new facts from the user's message
  let factsExtracted = 0;
  try {
    const walFacts = await parseQuestionForFacts(userId, message);
    if (walFacts.length > 0) {
      await applyFactActions(userId, 'chat', walFacts);
      factsExtracted = walFacts.length;
    }
  } catch {} // non-blocking

  // 5. Build conversation with memory + RAG (RAG is domain knowledge, not user biography)
  const fullContext = [ragContext, memoryContext].filter(Boolean).join('\n\n');
  const systemPrompt = buildChatSystemPrompt(fullContext, tier, {
    contextFree,
    hasUserMemory: memoryContext.length > 0,
  });

  const messages = [
    ...history.slice(-8).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  const response = await callClaude({
    systemPrompt,
    userMessage: messages.map(m => `${m.role === 'user' ? 'User' : 'Sukgo'}: ${m.content}`).join('\n\n') + '\n\nSukgo:',
    maxTokens: CHAT_MAX_TOKENS,
    tier: 'chat',
  });

  // 6. Detect if this question deserves a full simulation
  const simSuggestion = detectSimulationOpportunity(message);

  // 7. Find related past simulations
  const relatedSims = await findRelatedSimulations(userId, message);

  // 8. Save chat messages
  if (supabase) {
    const now = new Date().toISOString();
    await supabase.from('chat_messages').insert([
      { user_id: userId, role: 'user', content: message, model_tier: tier, created_at: now },
      { user_id: userId, role: 'assistant', content: response, model_tier: tier, created_at: now },
    ]);
  }

  return {
    response,
    tier,
    suggestSimulation: simSuggestion.suggest,
    simulationPrompt: simSuggestion.prompt,
    factsExtracted,
    disclaimer: disclaimer || undefined,
    relatedSimulations: relatedSims,
  };
}

// ═══════════════════════════════════════════
// System prompt builder
// ═══════════════════════════════════════════

function buildChatSystemPrompt(
  referenceContext: string,
  _tier: ModelTier,
  opts: { contextFree: boolean; hasUserMemory: boolean },
): string {
  const contextFreeBlock = opts.contextFree
    ? `
## This turn: context-free answer
The user asked to ignore stored personal context or to answer without using prior profile/history.
- Give a direct, clean answer. Do **not** cite their saved profile, locations, employers, budgets, or past simulations unless they explicitly ask about those.
- Do **not** say you "won't forget" their context or lecture them about why memory matters.
`
    : '';

  const memoryPreamble = opts.hasUserMemory
    ? `Optional user-specific background may appear below in "## User context". It is **supplementary**, not a script to read aloud.`
    : `No long-form user memory block is attached for this turn — answer from the question and recent chat turns only.`;

  return `You are Sukgo AI — a decision operating system.
Chat is fast and efficient; full multi-agent simulation is available separately when the user runs a simulation.

You help people think through decisions clearly. ${memoryPreamble}

${contextFreeBlock}

## Response guidelines

1. **Answer the question first.** Give a direct, useful answer before adding nuance or follow-ups.

2. **Context is supplementary.** Stored memory and past simulations are background — use them only when they **change** or **sharpen** the recommendation. Never open by listing everything you know about the user.

3. **Respect "forget / ignore / just answer".** If this turn is context-free (see above), comply fully.

4. **Match length to complexity.**
   - Simple or factual question → short answer (about 2–5 sentences).
   - Big life/career/business decision → structured analysis, still avoid pointless recap of unrelated stored facts.
   - Yes/no questions → give **yes or no first**, then briefly why.

5. **Do not:**
   - Open with a summary of the user's entire situation
   - Refuse to answer without many clarifying questions — give your best answer, then offer optional follow-ups
   - Pad with unrelated context ("You also mentioned Miami…") unless the current question ties to it

6. **Do:**
   - Be concise by default (often under ~200 words)
   - Mention stored context **only** when it is genuinely relevant
   - Offer a simulation or deeper pass when the decision is high-stakes

7. If the user states **new** facts about themselves, acknowledge briefly — the system may persist them.

8. If they ask about a **specific past simulation**, then reference verdict, probability, and main risk.

9. For investment / legal / medical topics, include the appropriate disclaimer when needed.

10. If you don't know, say so. Do not invent facts about the user.

${referenceContext ? `\n---\n${referenceContext}\n---\n` : ''}`;
}

// ═══════════════════════════════════════════
// Simulation upsell detection
// ═══════════════════════════════════════════

function detectSimulationOpportunity(message: string): { suggest: boolean; prompt?: string } {
  const msg = message.toLowerCase();

  const bigDecisionSignals = [
    'should i', 'is it worth', 'pros and cons', 'what do you think about',
    'good idea to', 'bad idea to', 'invest in', 'start a', 'open a',
    'launch', 'hire', 'fire', 'quit', 'accept', 'decline', 'buy', 'sell',
    'move to', 'switch to', 'pivot', 'expand', 'close', 'merge',
  ];

  const isBigDecision = bigDecisionSignals.some(signal => msg.includes(signal));

  if (message.length < 20 || !isBigDecision) {
    return { suggest: false };
  }

  const prompt = message.length > 150 ? message.substring(0, 147) + '...' : message;

  return { suggest: true, prompt };
}

// ═══════════════════════════════════════════
// Find related past simulations
// ═══════════════════════════════════════════

async function findRelatedSimulations(
  userId: string,
  message: string
): Promise<{ id: string; question: string; verdict: string }[]> {
  if (!supabase) return [];

  const { data: sims } = await supabase
    .from('simulations')
    .select('id, question, verdict')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!sims) return [];

  const msgWords = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  return sims
    .filter(s => {
      const q = ((s.question || '') as string).toLowerCase();
      return msgWords.some(w => q.includes(w));
    })
    .slice(0, 3)
    .map(s => ({
      id: s.id,
      question: ((s.question || '') as string).substring(0, 60),
      verdict: ((s.verdict as any)?.recommendation || 'unknown').toUpperCase(),
    }));
}

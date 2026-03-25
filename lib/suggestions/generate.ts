import Anthropic from '@anthropic-ai/sdk';

export type SuggestionContext = 'post_verdict' | 'post_chat' | 'post_agent_chat';

export interface SuggestionInput {
  context: SuggestionContext;
  conversationTitle?: string;
  // Post-verdict
  verdict?: {
    recommendation: string;
    probability: number;
    grade?: string;
    one_liner?: string;
    main_risk?: string;
    next_action?: string;
    agent_scores?: { agent_name: string; position: string; confidence: number }[];
  };
  // Post-chat
  recentMessages?: { role: string; content: string }[];
  // Post-agent-chat
  agentName?: string;
  agentCategory?: string;
  agentLastResponse?: string;
}

export interface Suggestion {
  id: string;
  text: string;
  type: 'what_if' | 'deep_dive' | 'compare' | 'simulate' | 'explore' | 'challenge';
  priority: number;
}

const SUGGESTION_COUNTS: Record<SuggestionContext, number> = {
  post_verdict: 4,
  post_chat: 3,
  post_agent_chat: 2,
};

export async function generateSuggestions(input: SuggestionInput): Promise<Suggestion[]> {
  const anthropic = new Anthropic();
  const count = SUGGESTION_COUNTS[input.context];

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input, count);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    return parseSuggestions(text, count);
  } catch (error) {
    console.error('Failed to generate suggestions:', error);
    return getFallbackSuggestions(input);
  }
}

function buildSystemPrompt(): string {
  return `You are a follow-up suggestion generator for Octux AI, a Decision Operating System.
Your job: generate short, actionable follow-up questions that help users explore their decision deeper.

Rules:
- Each suggestion is 5-12 words, phrased as a question or action
- Be SPECIFIC to the conversation context (never generic)
- Include at least 1 "what if" scenario
- Include at least 1 actionable next step
- Never repeat what was already discussed
- Match the user's domain (investment = financial terms, relationships = emotional terms)
- Vary the types: what-if, deep-dive, compare, simulate, explore, challenge

Format: Return ONLY a JSON array of objects with "text" and "type" fields.
Types: what_if, deep_dive, compare, simulate, explore, challenge
Example: [{"text":"What if the budget was 2× larger?","type":"what_if"},{"text":"Which permits do I need first?","type":"deep_dive"}]`;
}

function buildUserPrompt(input: SuggestionInput, count: number): string {
  let context = '';

  if (input.context === 'post_verdict' && input.verdict) {
    const v = input.verdict;
    context = `The user just received a verdict for: "${input.conversationTitle || 'their decision'}"
Recommendation: ${v.recommendation?.toUpperCase()} (${v.probability}%)
Grade: ${v.grade || 'N/A'}
Summary: ${v.one_liner || ''}
Main risk: ${v.main_risk || 'none identified'}
Recommended action: ${v.next_action || 'none specified'}
Agents: ${v.agent_scores?.map(a => `${a.agent_name} (${a.position}, ${a.confidence}/10)`).join(', ') || 'N/A'}`;
  } else if (input.context === 'post_chat' && input.recentMessages) {
    const msgs = input.recentMessages.slice(-3);
    context = `Conversation about: "${input.conversationTitle || 'a decision'}"
Recent messages:
${msgs.map(m => `${m.role}: ${m.content.substring(0, 200)}`).join('\n')}`;
  } else if (input.context === 'post_agent_chat') {
    context = `The user is chatting with agent "${input.agentName}" (${input.agentCategory || 'general'}).
Agent's last response: ${input.agentLastResponse?.substring(0, 300) || 'N/A'}`;
  }

  return `${context}

Generate exactly ${count} follow-up suggestions. Return ONLY valid JSON array.`;
}

function parseSuggestions(text: string, count: number): Suggestion[] {
  try {
    // Strip markdown code fences if present
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, count).map((item: any, i: number) => ({
      id: `sug_${Date.now()}_${i}`,
      text: typeof item.text === 'string' ? item.text : String(item),
      type: ['what_if', 'deep_dive', 'compare', 'simulate', 'explore', 'challenge'].includes(item.type) ? item.type : 'explore',
      priority: count - i,
    }));
  } catch {
    // If JSON parse fails, try line-by-line
    const lines = text.split('\n').filter(l => l.trim().length > 5);
    return lines.slice(0, count).map((line, i) => ({
      id: `sug_${Date.now()}_${i}`,
      text: line.replace(/^[-•*\d.)\s]+/, '').replace(/[""]/g, '').trim(),
      type: 'explore' as const,
      priority: count - i,
    }));
  }
}

function getFallbackSuggestions(input: SuggestionInput): Suggestion[] {
  if (input.context === 'post_verdict') {
    return [
      { id: 'fb_1', text: 'What if the timeline was twice as long?', type: 'what_if', priority: 4 },
      { id: 'fb_2', text: 'Which risk should I address first?', type: 'deep_dive', priority: 3 },
      { id: 'fb_3', text: 'Run a deeper simulation with more agents', type: 'simulate', priority: 2 },
      { id: 'fb_4', text: 'What are the alternatives?', type: 'compare', priority: 1 },
    ];
  }
  if (input.context === 'post_agent_chat') {
    return [
      { id: 'fb_1', text: 'What data sources did you use?', type: 'deep_dive', priority: 2 },
      { id: 'fb_2', text: 'How does your view compare to the others?', type: 'challenge', priority: 1 },
    ];
  }
  return [
    { id: 'fb_1', text: 'Tell me more about this', type: 'explore', priority: 3 },
    { id: 'fb_2', text: 'Run a full simulation', type: 'simulate', priority: 2 },
    { id: 'fb_3', text: 'What are the risks?', type: 'deep_dive', priority: 1 },
  ];
}

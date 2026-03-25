/**
 * LLM call with tools (web search).
 * Wraps the Anthropic tools API. Other providers can be added.
 */

export type LLMToolCallOptions = {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  model?: string;
  tools?: any[];
};

export type LLMToolResponse = {
  text: string;
  citations: { url: string; title: string; snippet: string; agent?: string }[];
};

export async function callLLMWithTools(options: LLMToolCallOptions): Promise<LLMToolResponse> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: options.model || 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens || 2048,
    system: options.systemPrompt,
    messages: [{ role: 'user', content: options.userMessage }],
    tools: options.tools || [{ type: 'web_search_20250305', name: 'web_search' } as any],
  });

  let text = '';
  const citations: LLMToolResponse['citations'] = [];

  for (const block of response.content) {
    if (block.type === 'text') {
      text += block.text;
    }
    if ((block as any).type === 'web_search_tool_result' && 'content' in (block as any)) {
      for (const item of (block as any).content || []) {
        if (item.type === 'web_search_result') {
          citations.push({
            url: item.url || '',
            title: item.title || '',
            snippet: item.snippet || '',
          });
        }
      }
    }
  }

  return { text, citations };
}

# PF-18 — Agent Chat (Talk to Individual Specialists)

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion.

**Ref:** Expert witness cross-examination. After 10 agents debate a decision, the user can "pull one aside" and drill deeper. "Why did you vote DELAY?" / "What if I changed the timeline?" This is one of the strongest retention features — it makes the agents feel REAL.

**What exists (PF-01 → PF-16):**
- `VerdictCard` (PF-14) with "Talk to agents" button and clickable agent names in the Agents tab
- `AgentScoreboard` (PF-11) showing all agents with positions + confidence
- `VerdictResult.agent_scoreboard[]` with `{ agent_name, role, position, confidence, key_argument }`
- `VerdictResult.citations[]` with `{ agent_id, agent_name, round, claim, confidence }`
- Backend `/api/c/[id]/chat` supports sending messages to conversations
- `useChatStore` with `sendMessage`, `addMessage`, `messages`
- `MessageRenderer` orchestrates all message types
- `UserMessage` (right, purple), `AssistantMessage` (left, bubble)

**What this prompt builds:**

1. `AgentChatDrawer` — slide-in panel to chat with a specific agent
2. `/api/c/[id]/agent-chat` — API route that calls LLM with agent persona
3. `useAgentChat` — hook managing the agent conversation state
4. Integration with VerdictCard's "Talk to agents" button
5. Agent persona prompt engineering

The user clicks an agent name → drawer slides in from the right → they can ask the agent questions → the agent responds IN CHARACTER with their position, expertise, and evidence.

---

## Part A — Agent Persona System

CREATE `lib/agents/personas.ts`:

```typescript
/**
 * Agent persona definitions.
 * Each agent has a name, role, expertise, and communication style.
 * Used to construct the system prompt when a user chats with a specific agent.
 */

export interface AgentPersona {
  name: string;
  role: string;
  expertise: string[];
  style: string; // communication tone
  systemPromptFragment: string; // injected into LLM system prompt
}

export const AGENT_PERSONAS: Record<string, AgentPersona> = {
  'Base Rate Archivist': {
    name: 'Base Rate Archivist',
    role: 'Historical data analysis',
    expertise: ['historical success rates', 'statistical baselines', 'pattern recognition', 'survivorship bias'],
    style: 'precise, data-driven, cites percentages',
    systemPromptFragment: `You are the Base Rate Archivist, a specialist in historical data analysis. You always ground your arguments in base rates, historical precedents, and statistical evidence. You speak with precision, cite approximate percentages, and caution against ignoring historical patterns. You are skeptical of "this time is different" arguments.`,
  },
  'Regulatory Gatekeeper': {
    name: 'Regulatory Gatekeeper',
    role: 'Compliance and regulatory analysis',
    expertise: ['permits', 'licensing', 'legal requirements', 'compliance timelines', 'regulatory risk'],
    style: 'cautious, thorough, flags risks early',
    systemPromptFragment: `You are the Regulatory Gatekeeper, a specialist in compliance and regulatory analysis. You identify permits, licenses, legal requirements, and regulatory timelines that could block or delay a decision. You are naturally cautious and prefer to flag risks early rather than discover them late. You speak with authority about process requirements.`,
  },
  'Demand Signal Analyst': {
    name: 'Demand Signal Analyst',
    role: 'Market demand and customer analysis',
    expertise: ['market sizing', 'customer segments', 'demand trends', 'TAM/SAM/SOM', 'competitive landscape'],
    style: 'optimistic but data-grounded, market-focused',
    systemPromptFragment: `You are the Demand Signal Analyst, a specialist in market demand and customer analysis. You analyze market size, growth trends, customer segments, and competitive dynamics. You tend to be optimistic about market opportunities but always ground your analysis in observable signals, not wishful thinking.`,
  },
  'Unit Economics Hawk': {
    name: 'Unit Economics Hawk',
    role: 'Financial viability and margins',
    expertise: ['unit economics', 'margins', 'break-even analysis', 'cash flow', 'financial modeling'],
    style: 'blunt about numbers, skeptical of revenue projections',
    systemPromptFragment: `You are the Unit Economics Hawk, a specialist in financial viability. You focus ruthlessly on unit economics: margins, break-even timelines, cash flow, and financial sustainability. You are blunt about numbers and skeptical of optimistic revenue projections. If the math doesn't work, you say so directly.`,
  },
  'Timing Strategist': {
    name: 'Timing Strategist',
    role: 'Market timing and opportunity windows',
    expertise: ['market timing', 'seasonal patterns', 'competitive windows', 'first-mover advantage'],
    style: 'strategic, thinks in windows and phases',
    systemPromptFragment: `You are the Timing Strategist, a specialist in market timing and opportunity windows. You analyze whether NOW is the right time, considering seasonal patterns, competitive windows, macroeconomic conditions, and first-mover advantages. You think in phases and timelines.`,
  },
  'Risk Cartographer': {
    name: 'Risk Cartographer',
    role: 'Risk mapping and mitigation',
    expertise: ['risk assessment', 'scenario analysis', 'downside protection', 'insurance strategies'],
    style: 'maps every risk, suggests mitigations',
    systemPromptFragment: `You are the Risk Cartographer, a specialist in risk mapping. You identify, categorize, and map every significant risk — financial, operational, reputational, and existential. For each risk you identify, you suggest specific mitigations. You never dismiss risks as unlikely without evidence.`,
  },
  'Opportunity Cost Auditor': {
    name: 'Opportunity Cost Auditor',
    role: 'Alternative analysis and trade-offs',
    expertise: ['opportunity cost', 'alternative analysis', 'resource allocation', 'trade-off frameworks'],
    style: 'always asks "compared to what?", challenges assumptions',
    systemPromptFragment: `You are the Opportunity Cost Auditor. Your fundamental question is always "compared to what?" You analyze what the person gives up by choosing this path, identify better alternatives they may not have considered, and ensure resources are allocated to the highest-value opportunity. You challenge assumptions about sunk costs.`,
  },
  'Execution Realist': {
    name: 'Execution Realist',
    role: 'Operational feasibility and execution',
    expertise: ['operations', 'execution planning', 'team requirements', 'logistics', 'implementation'],
    style: 'practical, focuses on "how" not "if"',
    systemPromptFragment: `You are the Execution Realist, a specialist in operational feasibility. You focus on HOW something gets done: team requirements, skill gaps, logistics, supply chain, vendor dependencies, and realistic timelines. You are practical and skeptical of plans that assume everything goes smoothly.`,
  },
  'Contrarian Provocateur': {
    name: 'Contrarian Provocateur',
    role: 'Devil's advocate and stress-testing',
    expertise: ['devil's advocacy', 'stress testing', 'assumption challenging', 'blind spot detection'],
    style: 'provocative, challenges consensus, asks uncomfortable questions',
    systemPromptFragment: `You are the Contrarian Provocateur, the devil's advocate. Your job is to stress-test every assumption, challenge the consensus, and ask the uncomfortable questions nobody wants to hear. You are deliberately provocative but intellectually honest — you don't argue for the sake of arguing, you argue to expose blind spots.`,
  },
  'Synthesis Architect': {
    name: 'Synthesis Architect',
    role: 'Integration and final recommendation',
    expertise: ['synthesis', 'integration', 'recommendation frameworks', 'decision architecture'],
    style: 'balanced, integrative, builds on other agents\' insights',
    systemPromptFragment: `You are the Synthesis Architect, responsible for integrating all perspectives into a coherent recommendation. You weigh competing arguments, identify where agents agree and disagree, and build a balanced framework. You are the most diplomatic agent, acknowledging valid points from all sides while still arriving at a clear recommendation.`,
  },
};

/**
 * Build the system prompt for agent chat.
 * Includes: persona, original question, verdict context, their position.
 */
export function buildAgentSystemPrompt(
  agentName: string,
  question: string,
  verdictSummary: {
    recommendation: string;
    probability: number;
    agentPosition?: string;
    agentConfidence?: number;
    agentArgument?: string;
  },
): string {
  const persona = AGENT_PERSONAS[agentName];
  if (!persona) {
    return `You are ${agentName}, a specialist analyst. Answer the user's questions based on your expertise. Be concise and specific.`;
  }

  return `${persona.systemPromptFragment}

CONTEXT:
The user asked: "${question}"
The simulation concluded with: ${verdictSummary.recommendation.toUpperCase()} at ${verdictSummary.probability}% probability.
${verdictSummary.agentPosition ? `Your position was: ${verdictSummary.agentPosition.toUpperCase()} with confidence ${verdictSummary.agentConfidence}/10.` : ''}
${verdictSummary.agentArgument ? `Your key argument was: "${verdictSummary.agentArgument}"` : ''}

RULES:
- Stay in character as ${persona.name} (${persona.role}).
- Be concise (2-4 paragraphs max per response).
- Reference your specific expertise and evidence when answering.
- If asked about areas outside your expertise, acknowledge the limitation and suggest which agent to ask instead.
- If the user proposes a "what if" change, re-evaluate from your perspective.
- Never break character or mention that you are an AI.
- Speak naturally, as an expert consultant would.`;
}
```

---

## Part B — API Route

CREATE `app/api/c/[id]/agent-chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/supabase-client';
import { callLLM } from '@/lib/llm/provider';
import { buildAgentSystemPrompt } from '@/lib/agents/personas';

/**
 * POST /api/c/[id]/agent-chat
 * Chat with a specific agent post-verdict.
 * Body: { agentName, message, question, verdict, history? }
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, isAuthenticated } = await getUserIdFromRequest(req);
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { agentName, message, question, verdict, history } = body;

    if (!agentName || !message) {
      return NextResponse.json({ error: 'agentName and message required' }, { status: 400 });
    }

    // Find agent's position from verdict
    const agentEntry = verdict?.agent_scoreboard?.find(
      (a: any) => a.agent_name === agentName
    );

    // Build system prompt with agent persona
    const systemPrompt = buildAgentSystemPrompt(agentName, question || '', {
      recommendation: verdict?.recommendation || 'unknown',
      probability: verdict?.probability || 0,
      agentPosition: agentEntry?.position,
      agentConfidence: agentEntry?.confidence,
      agentArgument: agentEntry?.key_argument,
    });

    // Build conversation history for context
    const messages: Array<{ role: string; content: string }> = [];

    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) { // Last 10 messages max
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    // Call LLM with agent persona
    const response = await callLLM({
      model: 'claude-sonnet-4-20250514', // Use Sonnet for quality agent responses
      maxTokens: 600,
      systemPrompt,
      messages,
    });

    return NextResponse.json({
      agentName,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get agent response' },
      { status: 500 }
    );
  }
}
```

---

## Part C — useAgentChat Hook

CREATE `hooks/useAgentChat.ts`:

```typescript
'use client';

import { useState, useCallback, useRef } from 'react';
import type { VerdictResult } from '@/lib/simulation/events';

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

interface UseAgentChatOptions {
  conversationId: string;
  agentName: string;
  question: string;
  verdict: VerdictResult;
}

export function useAgentChat({ conversationId, agentName, question, verdict }: UseAgentChatOptions) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<Array<{ role: string; content: string }>>([]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/c/${conversationId}/agent-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName,
          message: text.trim(),
          question,
          verdict,
          history: historyRef.current,
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();

      const agentMsg: AgentMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: data.response,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Update history ref for context
      historyRef.current.push(
        { role: 'user', content: text.trim() },
        { role: 'assistant', content: data.response },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
    }
  }, [conversationId, agentName, question, verdict, sending]);

  const reset = useCallback(() => {
    setMessages([]);
    setSending(false);
    setError(null);
    historyRef.current = [];
  }, []);

  return { messages, sending, error, sendMessage, reset };
}
```

---

## Part D — AgentChatDrawer Component

CREATE `components/agent/AgentChatDrawer.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { useAgentChat, type AgentMessage } from '@/hooks/useAgentChat';
import { AGENT_PERSONAS } from '@/lib/agents/personas';
import { verdictColors } from '@/lib/design/tokens';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import type { VerdictResult } from '@/lib/simulation/events';

// ═══ AVATAR COLORS (same as AgentCard PF-11) ═══

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
  'from-lime-500 to-green-600',
  'from-fuchsia-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-red-500 to-rose-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(/[\s_-]+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

// ═══ SUGGESTED QUESTIONS ═══

function getSuggestedQuestions(agentName: string, position?: string): string[] {
  const base = [
    `Why did you vote ${position?.toUpperCase() || 'this way'}?`,
    'What evidence supports your position?',
    'What would change your mind?',
  ];

  const persona = AGENT_PERSONAS[agentName];
  if (persona?.expertise?.[0]) {
    base.push(`Tell me more about the ${persona.expertise[0]} angle`);
  }

  return base.slice(0, 3);
}

// ═══ MAIN COMPONENT ═══

interface AgentChatDrawerProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
  conversationId: string;
  question: string;
  verdict: VerdictResult;
}

export default function AgentChatDrawer({
  open, onClose, agentName, conversationId, question, verdict,
}: AgentChatDrawerProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sending, error, sendMessage, reset } = useAgentChat({
    conversationId,
    agentName,
    question,
    verdict,
  });

  // Agent info
  const persona = AGENT_PERSONAS[agentName];
  const agentEntry = verdict.agent_scoreboard?.find((a) => a.agent_name === agentName);
  const position = agentEntry?.position;
  const confidence = agentEntry?.confidence;
  const positionColor = position ? verdictColors[position] : '#7C3AED';

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sending]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      reset();
      setInput('');
    }
  }, [open, reset]);

  const handleSend = () => {
    if (!input.trim() || sending) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface-overlay/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-surface-0 border-l border-border-subtle flex flex-col shadow-2xl"
          >
            {/* ─── HEADER ─── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle shrink-0">
              {/* Avatar */}
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold bg-gradient-to-br shrink-0',
                  getAvatarColor(agentName),
                )}
              >
                {getInitials(agentName)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-txt-primary truncate">{agentName}</span>
                  {position && (
                    <span
                      className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                      style={{ color: positionColor, backgroundColor: `${positionColor}15` }}
                    >
                      {position}
                    </span>
                  )}
                </div>
                <span className="text-micro text-txt-disabled">
                  {persona?.role || 'Specialist'}
                  {confidence ? ` · ${confidence}/10 confidence` : ''}
                </span>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-surface-2 text-txt-tertiary hover:text-txt-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* ─── MESSAGES ─── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
              {/* Welcome / context */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  {/* Agent intro */}
                  <div className="text-center py-4">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br mx-auto mb-3',
                        getAvatarColor(agentName),
                      )}
                    >
                      {getInitials(agentName)}
                    </div>
                    <p className="text-sm text-txt-primary font-medium">{agentName}</p>
                    <p className="text-micro text-txt-tertiary mt-0.5">{persona?.role || 'Specialist'}</p>
                    {agentEntry?.key_argument && (
                      <p className="text-xs text-txt-secondary mt-2 max-w-xs mx-auto italic">
                        "{agentEntry.key_argument}"
                      </p>
                    )}
                  </div>

                  {/* Suggested questions */}
                  <div className="space-y-1.5">
                    <span className="text-micro text-txt-disabled">Ask me about...</span>
                    {getSuggestedQuestions(agentName, position).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(q)}
                        disabled={sending}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-txt-secondary border border-border-subtle hover:bg-surface-2/50 hover:text-txt-primary transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <AgentChatMessage
                  key={msg.id}
                  message={msg}
                  agentName={agentName}
                />
              ))}

              {/* Typing indicator */}
              {sending && (
                <div className="flex items-start gap-2 mb-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold bg-gradient-to-br shrink-0',
                      getAvatarColor(agentName),
                    )}
                  >
                    {getInitials(agentName)}
                  </div>
                  <div className="px-3 py-2 rounded-xl rounded-bl-md bg-surface-1 border border-border-subtle">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-verdict-abandon text-center py-2">{error}</p>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── INPUT ─── */}
            <div className="shrink-0 border-t border-border-subtle px-4 py-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Ask ${agentName.split(' ')[0]}...`}
                  disabled={sending}
                  className="flex-1 h-9 px-3 text-sm bg-surface-1 rounded-lg text-txt-primary placeholder:text-txt-disabled outline-none border border-border-subtle focus:border-accent/30 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all',
                    input.trim()
                      ? 'bg-accent text-white hover:bg-accent-hover'
                      : 'bg-surface-2 text-txt-disabled',
                  )}
                >
                  {sending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ArrowUp size={14} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══ MESSAGE BUBBLE ═══

function AgentChatMessage({ message, agentName }: { message: AgentMessage; agentName: string }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex mb-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold bg-gradient-to-br shrink-0 mr-2 mt-1',
            getAvatarColor(agentName),
          )}
        >
          {getInitials(agentName)}
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-accent text-white rounded-2xl rounded-br-md'
            : 'bg-surface-1 border border-border-subtle text-txt-primary rounded-2xl rounded-bl-md',
        )}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  );
}
```

---

## Part E — Wire into VerdictCard

UPDATE `components/verdict/VerdictCard.tsx`:

**Add state and import:**

```typescript
import { useState } from 'react';
import AgentChatDrawer from '@/components/agent/AgentChatDrawer';

// Inside VerdictCard component, add state:
const [agentChatOpen, setAgentChatOpen] = useState(false);
const [activeAgent, setActiveAgent] = useState<string | null>(null);

// Find the original question from the conversation context
const [originalQuestion, setOriginalQuestion] = useState('');
```

**Replace the `onAgentChat` callback:**

```typescript
// The "Talk to agents" button and agent name clicks should:
const handleAgentChat = (agentName: string) => {
  setActiveAgent(agentName);
  setAgentChatOpen(true);
};
```

**Add drawer at the end of VerdictCard JSX (inside the root div):**

```typescript
{/* Agent Chat Drawer */}
{activeAgent && (
  <AgentChatDrawer
    open={agentChatOpen}
    onClose={() => { setAgentChatOpen(false); setActiveAgent(null); }}
    agentName={activeAgent}
    conversationId={conversationId}
    question={originalQuestion}
    verdict={verdict}
  />
)}
```

**Update the "Talk to agents" button:**

```typescript
<OctButton variant="outline" size="xs" onClick={() => handleAgentChat(verdict.agent_scoreboard![0].agent_name)}>
  <MessageSquare size={12} className="mr-1" />
  Talk to agents
</OctButton>
```

**Update agent name buttons in the Agents tab:**

```typescript
{verdict.agent_scoreboard.slice(0, 5).map((agent) => (
  <button
    key={agent.agent_name}
    onClick={() => handleAgentChat(agent.agent_name)}
    className="text-micro px-2 py-1 rounded-md border border-border-subtle text-txt-tertiary hover:text-accent hover:border-accent/30 transition-colors"
  >
    {agent.agent_name}
  </button>
))}
```

---

## Part F — Export

CREATE `components/agent/index.ts`:

```typescript
export { default as AgentChatDrawer } from './AgentChatDrawer';
```

---

## Testing

### Test 1 — Open agent drawer:
Click "Talk to agents" on VerdictCard → drawer slides in from right with agent avatar, name, role, key argument, 3 suggested questions.

### Test 2 — Suggested question works:
Click "Why did you vote PROCEED?" → user message appears → agent responds in character. Response references their specific expertise and evidence.

### Test 3 — Custom question:
Type "What if I had double the budget?" → agent re-evaluates from their perspective, staying in character.

### Test 4 — Conversation history:
Send 3 messages → each response considers previous context. Agent remembers what was discussed.

### Test 5 — Different agents, different responses:
Chat with Base Rate Archivist → cites percentages and historical data.
Chat with Contrarian Provocateur → challenges assumptions provocatively.
Chat with Unit Economics Hawk → focuses on numbers and margins.

### Test 6 — Typing indicator:
While waiting for response → 3 dots pulse with agent avatar.

### Test 7 — Close and reset:
Close drawer → messages cleared. Open same agent again → fresh start with suggestions.

### Test 8 — Agent avatar matches AgentCard:
Same `getAvatarColor` function → Base Rate always gets same gradient in drawer AND in AgentCardsStream (PF-11).

### Test 9 — Backdrop click closes:
Click the semi-transparent backdrop → drawer closes.

### Test 10 — Mobile responsive:
Drawer width `max-w-md` → fills screen on mobile, 448px max on desktop.

### Test 11 — Position badge in header:
If agent voted PROCEED → green badge. DELAY → amber. ABANDON → red. With confidence.

### Test 12 — Markdown in agent responses:
Agent uses **bold**, *italic*, lists → renders via MarkdownRenderer inside bubble.

---

## Files Created/Modified

```
CREATED:
  lib/agents/personas.ts                  — 10 agent personas + prompt builder
  app/api/c/[id]/agent-chat/route.ts      — API endpoint
  hooks/useAgentChat.ts                    — conversation hook
  components/agent/AgentChatDrawer.tsx     — slide-in drawer
  components/agent/index.ts             — barrel export

MODIFIED:
  components/verdict/VerdictCard.tsx       — wire "Talk to agents" to drawer
```

---

Manda pro Fernando. Próximo é **PF-19** (Boardroom Report — PDF export). 🐙


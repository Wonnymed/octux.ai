# PF-16 — Follow-up Suggestions

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion.

**Ref:** Perplexity (related questions after every answer), v0 (action chips). After every verdict, show 3-4 contextual follow-up chips. Click → sends as user message in same thread. Keeps the user engaged and exploring.

**What exists (PF-01 → PF-15):**
- VerdictCard (PF-14) renders after simulation complete
- Chat flow working end-to-end (PF-08)
- `useChatStore.sendMessage` sends messages to conversation
- `VerdictResult` type with all verdict data
- Design tokens, shadcn/ui, Framer Motion

**Cost decision:**
- FREE/Free tier: suggestions generated from LOCAL templates ($0 cost)
- PRO/MAX tier: AI-generated suggestions via Haiku post-verdict (~$0.003/call)
- This means suggestions NEVER block the verdict from appearing
- They appear 1-2 seconds AFTER the verdict as a separate element

**What this prompt builds:**

1. `FollowUpSuggestions` — chip row that appears below verdict
2. `lib/suggestions/templates.ts` — local template generator (zero API cost)
3. `lib/suggestions/ai.ts` — AI generator for paid tiers
4. `/api/c/[id]/suggestions` — API route for AI-generated suggestions
5. Integration into conversation page

---

## Part A — Local Template Generator (Zero Cost)

CREATE `lib/suggestions/templates.ts`:

```typescript
/**
 * Local follow-up suggestion templates.
 * Zero API cost. Used for FREE tier users.
 * Also used as instant fallback while AI suggestions load for paid tiers.
 *
 * Templates are contextual based on verdict data.
 */

import type { VerdictResult } from '@/lib/simulation/events';

export type SuggestionType = 'what_if' | 'deep_dive' | 'compare' | 'challenge' | 'action';

export interface Suggestion {
  text: string;
  type: SuggestionType;
}

/**
 * Generate 4 follow-up suggestions from templates.
 * Uses verdict data to make them contextual.
 */
export function generateLocalSuggestions(verdict: VerdictResult, question: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const rec = verdict.recommendation;
  const prob = verdict.probability || 0;

  // ─── WHAT-IF (always include 1-2) ───
  suggestions.push(...getWhatIfSuggestions(rec, prob, question));

  // ─── DEEP DIVE (based on risk or action) ───
  if (verdict.main_risk) {
    suggestions.push({
      text: `How serious is the risk of ${extractKeyPhrase(verdict.main_risk)}?`,
      type: 'deep_dive',
    });
  }

  // ─── CHALLENGE (if confident verdict) ───
  if (prob >= 70) {
    suggestions.push({
      text: `What's the strongest argument against ${rec === 'proceed' ? 'proceeding' : rec === 'delay' ? 'delaying' : 'abandoning'}?`,
      type: 'challenge',
    });
  } else if (prob < 50) {
    suggestions.push({
      text: `What would need to change to make this a clear ${rec === 'proceed' ? 'go' : 'no-go'}?`,
      type: 'challenge',
    });
  }

  // ─── ACTION (based on next_action) ───
  if (verdict.next_action) {
    suggestions.push({
      text: `Break down the first step: ${extractKeyPhrase(verdict.next_action)}`,
      type: 'action',
    });
  }

  // ─── COMPARE ───
  suggestions.push({
    text: 'What are the top 3 alternatives I should consider?',
    type: 'compare',
  });

  // Return 4 unique, shuffled
  return deduplicateAndLimit(suggestions, 4);
}

// ═══ WHAT-IF TEMPLATES ═══

function getWhatIfSuggestions(rec: string, prob: number, question: string): Suggestion[] {
  const results: Suggestion[] = [];

  // Budget variant
  if (containsAny(question, ['invest', 'buy', 'spend', 'budget', 'cost', 'price', '$', 'money', 'fund'])) {
    results.push({
      text: 'What if my budget was 50% larger?',
      type: 'what_if',
    });
    results.push({
      text: 'What if I started with half the investment?',
      type: 'what_if',
    });
  }

  // Timeline variant
  if (containsAny(question, ['when', 'timeline', 'start', 'launch', 'deadline', 'month', 'year', 'time'])) {
    results.push({
      text: 'What if I waited 6 months to start?',
      type: 'what_if',
    });
  }

  // Location variant
  if (containsAny(question, ['where', 'location', 'city', 'country', 'move', 'relocate', 'open', 'restaurant', 'café', 'shop', 'store'])) {
    results.push({
      text: 'What about a different location?',
      type: 'what_if',
    });
  }

  // Partner variant
  if (containsAny(question, ['alone', 'solo', 'partner', 'co-founder', 'team', 'hire'])) {
    results.push({
      text: 'What if I had a co-founder or partner?',
      type: 'what_if',
    });
  }

  // Relationship variant
  if (containsAny(question, ['break up', 'relationship', 'marriage', 'dating', 'boyfriend', 'girlfriend', 'partner', 'divorce'])) {
    results.push({
      text: 'What if we tried counseling first?',
      type: 'what_if',
    });
    results.push({
      text: 'How would the analysis change if I had kids?',
      type: 'what_if',
    });
  }

  // Career variant
  if (containsAny(question, ['job', 'quit', 'career', 'salary', 'promotion', 'offer', 'resign', 'startup'])) {
    results.push({
      text: 'What if I negotiated a higher salary first?',
      type: 'what_if',
    });
    results.push({
      text: 'What if I started it as a side project?',
      type: 'what_if',
    });
  }

  // Generic fallback
  if (results.length === 0) {
    results.push({
      text: 'What if I had more time to prepare?',
      type: 'what_if',
    });
    results.push({
      text: 'What if the market conditions changed?',
      type: 'what_if',
    });
  }

  return results.slice(0, 2);
}

// ═══ HELPERS ═══

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function extractKeyPhrase(text: string): string {
  // Take first meaningful chunk (up to 40 chars)
  const cleaned = text.replace(/^(the |a |an )/i, '');
  if (cleaned.length <= 40) return cleaned.toLowerCase();
  const cut = cleaned.substring(0, 40);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 20 ? cut.substring(0, lastSpace) : cut).toLowerCase() + '...';
}

function deduplicateAndLimit(suggestions: Suggestion[], limit: number): Suggestion[] {
  const seen = new Set<string>();
  const unique: Suggestion[] = [];

  for (const s of suggestions) {
    const key = s.text.toLowerCase().substring(0, 30);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
    if (unique.length >= limit) break;
  }

  return unique;
}
```

---

## Part B — AI Suggestion Generator (Paid Tiers)

CREATE `lib/suggestions/ai.ts`:

```typescript
/**
 * AI-generated follow-up suggestions.
 * Uses Haiku (~$0.003/call) for paid tier users.
 * Called AFTER verdict is delivered — never blocks the verdict.
 */

import { callLLM } from '@/lib/llm/provider';
import type { VerdictResult } from '@/lib/simulation/events';
import type { Suggestion, SuggestionType } from './templates';

export async function generateAISuggestions(
  question: string,
  verdict: VerdictResult,
): Promise<Suggestion[]> {
  try {
    const response = await callLLM({
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 300,
      systemPrompt: `You generate follow-up questions for a decision analysis tool.
Given a question and verdict, generate exactly 4 follow-up questions a person would naturally ask.

Rules:
- Each question should explore a DIFFERENT angle: what-if scenario, deeper risk analysis, comparison, or action step
- Keep questions under 60 characters
- Questions should be specific to this verdict, not generic
- Return ONLY a JSON array of objects: [{"text": "...", "type": "what_if|deep_dive|compare|challenge|action"}]
- No markdown, no backticks, just JSON`,
      userMessage: JSON.stringify({
        question,
        recommendation: verdict.recommendation,
        probability: verdict.probability,
        main_risk: verdict.main_risk,
        next_action: verdict.next_action,
        one_liner: verdict.one_liner,
      }),
    });

    const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((s: any) => s.text && typeof s.text === 'string')
      .slice(0, 4)
      .map((s: any) => ({
        text: s.text.substring(0, 80),
        type: (['what_if', 'deep_dive', 'compare', 'challenge', 'action'].includes(s.type)
          ? s.type
          : 'what_if') as SuggestionType,
      }));
  } catch {
    // Silently fail — local templates are the fallback
    return [];
  }
}
```

---

## Part C — API Route

CREATE `app/api/c/[id]/suggestions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/supabase-client';
import { generateAISuggestions } from '@/lib/suggestions/ai';
import type { VerdictResult } from '@/lib/simulation/events';

/**
 * POST /api/c/[id]/suggestions
 * Generate AI follow-up suggestions (paid tiers only).
 * Called client-side AFTER verdict renders — non-blocking.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, isAuthenticated } = await getUserIdFromRequest(req);
    if (!isAuthenticated) {
      return NextResponse.json({ suggestions: [] });
    }

    // TODO: Check if user is on paid tier
    // For now, generate for all authenticated users
    const body = await req.json();
    const { question, verdict } = body as { question: string; verdict: VerdictResult };

    if (!question || !verdict) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await generateAISuggestions(question, verdict);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
```

---

## Part D — FollowUpSuggestions Component

CREATE `components/chat/FollowUpSuggestions.tsx`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCcw, Lightbulb, GitCompare, ShieldQuestion, ArrowRight, Zap,
} from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { generateLocalSuggestions, type Suggestion, type SuggestionType } from '@/lib/suggestions/templates';
import type { VerdictResult } from '@/lib/simulation/events';

interface FollowUpSuggestionsProps {
  verdict: VerdictResult;
  question: string;
  conversationId: string;
  onSelect: (text: string) => void;
  isPaidTier?: boolean;
  className?: string;
}

const TYPE_ICONS: Record<SuggestionType, any> = {
  what_if: RefreshCcw,
  deep_dive: Lightbulb,
  compare: GitCompare,
  challenge: ShieldQuestion,
  action: ArrowRight,
};

const TYPE_COLORS: Record<SuggestionType, string> = {
  what_if: 'text-accent',
  deep_dive: 'text-category-investment',
  compare: 'text-category-career',
  challenge: 'text-verdict-delay',
  action: 'text-verdict-proceed',
};

export default function FollowUpSuggestions({
  verdict,
  question,
  conversationId,
  onSelect,
  isPaidTier = false,
  className,
}: FollowUpSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Generate local suggestions immediately
  useEffect(() => {
    const local = generateLocalSuggestions(verdict, question);
    setSuggestions(local);

    // If paid tier, fetch AI suggestions to replace
    if (isPaidTier) {
      fetchAISuggestions();
    }
  }, [verdict, question, isPaidTier]);

  const fetchAISuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/c/${conversationId}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, verdict }),
      });
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch {
      // Keep local suggestions
    } finally {
      setLoading(false);
    }
  }, [conversationId, question, verdict]);

  const handleRefresh = () => {
    if (isPaidTier) {
      fetchAISuggestions();
    } else {
      // Shuffle local suggestions
      const local = generateLocalSuggestions(verdict, question);
      setSuggestions([...local].sort(() => Math.random() - 0.5));
    }
  };

  const handleSelect = (suggestion: Suggestion) => {
    onSelect(suggestion.text);
    setDismissed(true);
  };

  if (dismissed || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className={cn('my-3', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Zap size={12} className="text-accent" />
        <span className="text-micro text-txt-tertiary">Explore further</span>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="ml-auto p-1 rounded hover:bg-surface-2 text-txt-disabled hover:text-txt-tertiary transition-colors"
          title="Refresh suggestions"
        >
          <RefreshCcw size={11} className={cn(loading && 'animate-spin')} />
        </button>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, i) => {
            const Icon = TYPE_ICONS[suggestion.type] || Lightbulb;
            const iconColor = TYPE_COLORS[suggestion.type] || 'text-accent';

            return (
              <motion.button
                key={suggestion.text}
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.06 }}
                onClick={() => handleSelect(suggestion)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
                  'border border-border-subtle bg-surface-1',
                  'text-txt-secondary',
                  'hover:border-border-default hover:bg-surface-2/50 hover:text-txt-primary',
                  'active:scale-[0.97]',
                  'transition-all duration-normal',
                )}
              >
                <Icon size={12} className={cn(iconColor, 'shrink-0')} />
                <span className="truncate max-w-[200px] sm:max-w-[280px]">
                  {suggestion.text}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
```

---

## Part E — Integration into MessageRenderer

UPDATE `components/chat/MessageRenderer.tsx`:

Add import:

```typescript
import FollowUpSuggestions from './FollowUpSuggestions';
```

Update the `simulation_verdict` case to include suggestions BELOW the verdict:

```typescript
case 'simulation_verdict': {
  // Find the original question (look backwards for simulation_start)
  const simStartMsg = findPreviousMessage(message, 'simulation_start');
  const originalQuestion = simStartMsg?.content || '';

  return (
    <div key={msg.id}>
      <VerdictCard
        verdict={msg.structured_data}
        simulationId={msg.simulation_id}
        conversationId={conversationId}
        onRefine={onRefine}
        onShare={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}/c/${conversationId}/report`
          );
        }}
        onAgentChat={(agentName) => {
          // PF-18 builds agent chat
        }}
      />
      {isLast && msg.structured_data && (
        <FollowUpSuggestions
          verdict={msg.structured_data}
          question={originalQuestion}
          conversationId={conversationId}
          onSelect={(text) => {
            useChatStore.getState().sendMessage(conversationId, text);
          }}
          isPaidTier={false} // TODO: read from billing store
        />
      )}
    </div>
  );
}
```

**Add helper function** to find the simulation_start message (add outside the component or as a module-level function):

```typescript
// Helper: find previous message of a given type
// This needs access to the messages array — either pass via props or read from store
function findSimulationQuestion(messages: ChatMessage[], verdictMsg: ChatMessage): string {
  // Walk backwards from verdict to find the simulation_start
  const verdictIdx = messages.findIndex((m) => m.id === verdictMsg.id);
  if (verdictIdx < 0) return '';

  for (let i = verdictIdx - 1; i >= 0; i--) {
    if (messages[i].message_type === 'simulation_start') {
      return messages[i].content || '';
    }
  }
  return '';
}
```

Since `MessageRenderer` doesn't have access to the full messages array, the cleanest approach is to read it from the store:

```typescript
// Inside the simulation_verdict case:
import { useChatStore } from '@/lib/store/chat';

// Get question from store
const messages = useChatStore.getState().messages;
const originalQuestion = findSimulationQuestion(messages, msg);
```

---

## Part F — Update Exports

UPDATE `components/chat/index.ts` — add:

```typescript
export { default as FollowUpSuggestions } from './FollowUpSuggestions';
```

---

## Testing

### Test 1 — Local suggestions appear after verdict:
Simulate a verdict for "Should I open a café in Gangnam?" → 4 chips appear 0.5s after verdict:
- "What about a different location?" (what_if, RefreshCcw icon)
- "How serious is the risk of rent increases?" (deep_dive, Lightbulb icon)
- "What's the strongest argument against proceeding?" (challenge, ShieldQuestion icon)
- "What are the top 3 alternatives?" (compare, GitCompare icon)

### Test 2 — Click chip sends message:
Click "What about a different location?" → text sent as user message in conversation → suggestions disappear (dismissed).

### Test 3 — Contextual to question domain:
Question about investment → get budget-related what-ifs ("What if budget was 50% larger?"). Question about relationship → get relationship what-ifs ("What if we tried counseling first?"). Question about career → get career what-ifs ("What if I started it as a side project?").

### Test 4 — Refresh shuffles:
Click refresh button → suggestions regenerate (shuffled for free tier, AI-fetched for paid tier).

### Test 5 — AI suggestions replace local:
For paid tier: local suggestions appear instantly → after ~1s, AI-generated suggestions replace them (smoother, more specific).

### Test 6 — Stagger animation:
4 chips enter with 60ms stagger delay. Scale from 0.95 → 1.0 + fade in.

### Test 7 — Type icons colored:
what_if → accent purple icon. deep_dive → investment indigo. compare → career amber. challenge → delay amber. action → proceed green.

### Test 8 — Only shows on LAST verdict:
If conversation has 2 verdicts → suggestions only show below the most recent one (`isLast` prop).

### Test 9 — Truncation on mobile:
Long suggestion text truncates at 200px on mobile, 280px on desktop.

### Test 10 — API failure graceful:
If `/api/c/[id]/suggestions` fails → keeps showing local suggestions. No error visible to user.

### Test 11 — Delay appearance:
Suggestions appear 0.5s after verdict renders (via `delay: 0.5` in Framer Motion). Gives user time to read the verdict first.

### Test 12 — Zero cost for free tier:
Free tier users → `generateLocalSuggestions` called (pure JS, $0). API never called.

---

## Files Created/Modified

```
CREATED:
  lib/suggestions/templates.ts               — local template generator ($0)
  lib/suggestions/ai.ts                      — AI generator (Haiku, ~$0.003)
  app/api/c/[id]/suggestions/route.ts        — API endpoint
  components/chat/FollowUpSuggestions.tsx     — chip row component

MODIFIED:
  components/chat/MessageRenderer.tsx         — render suggestions below verdict
  components/chat/index.ts                    — add export
```

---

Manda pro Fernando. Próximo é **PF-17** (Refinement Flow) — o "What if...?" end-to-end com RefinementCard. 🐙

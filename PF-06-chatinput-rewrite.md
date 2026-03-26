# PF-06 — ChatInput Rewrite

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion.

**Ref:** Okara (frictionless input, model selector), v0 (command surface, suggestion chips), ChatGPT/Claude (textarea auto-resize, Shift+Enter)

**What exists (confirmed via Chrome DevTools):**
- ChatInput renders at bottom of main area
- Tier pills: Ink, Deep 1t, Kraken 8t (text-based, small)
- Single-line `<input>` element (NOT textarea)
- Suggestion chips above input (5 decision prompts)
- Send button (arrow up icon)
- Placeholder: "What decision are you facing?"

**What's WRONG with current ChatInput:**
```
❌ Uses <input> not <textarea> — can't write multi-line questions
❌ No auto-resize (textarea should grow with content)
❌ Tier pills are plain text, no visual distinction between states
❌ No token cost feedback ("This will use 1 token")
❌ No locked state for tiers user can't afford
❌ No Framer Motion animations
❌ Suggestion chips are outside the input component (coupled to page)
❌ Send button doesn't use Lucide icon
❌ No Shift+Enter for newline vs Enter to send distinction
❌ No character/context indicator
❌ Not connected to Zustand stores
```

**What this prompt builds:**

Complete ChatInput rewrite with:
1. Auto-resizing `<textarea>` (1 line → 6 lines max)
2. Tier selector pills with token costs, lock icons, upgrade nudge
3. Send button with Lucide ArrowUp icon
4. Suggestion chips INSIDE the component (shown when no messages)
5. Token balance compact display
6. Connected to Zustand `useChatStore` + `useBillingStore`
7. Framer Motion entrance animation
8. Keyboard: Enter = send, Shift+Enter = newline

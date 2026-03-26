# OCTUX AI — FRONTEND ROADMAP COMPLETO (PF-01 → PF-35)

## Versão: 2.0 (substitui o roadmap P44-P75 antigo)
## Data: 26 março 2026

---

## ESTADO ATUAL (ponto de partida)

```
BACKEND (DEPLOYADO — P5-P38):
  ✅ Memory: core, temporal, recall, reflect, behavioral, knowledge graph
  ✅ Simulation: 10 agents, domain detection, HITL, heatmap, crowd, adaptive selection
  ✅ Chat: tiers (Ink/Deep/Kraken), refinement, agent chat
  ✅ Auth: Supabase (Google + Magic Link)
  ✅ LLM: callLLM() model-agnostic (Anthropic, OpenAI, NAVER stubs)
  ✅ DB: conversations, conversation_messages, simulations tables
  ✅ APIs: /api/c, /api/c/[id], /api/c/[id]/chat, /api/simulate/stream
  ✅ 30 automated tests

FRONTEND (P-RESET-1 DEPLOYADO):
  ✅ Unified page (/ = product above fold)
  ✅ Sidebar (collapsed 56px, expand on hover)
  ✅ Entity visual (🐙 with gradient, breathing animation)
  ✅ ChatInput (tier pills: Ink, Deep 1t, Kraken 8t)
  ✅ Suggestion chips (5 decision prompts)
  ✅ Wordmark "octux" + "NEVER DECIDE ALONE AGAIN"
  ✅ Dark theme (#0A0A0F bg, #7C3AED accent)

  ❌ Marketing sections below fold (NOT RENDERING — HOTFIX pending)
  ❌ Chat doesn't work end-to-end (sends but doesn't receive/render)
  ❌ Simulation streaming not wired to UI
  ❌ Verdict card not rendering
  ❌ Citations not implemented
  ❌ No billing/auth flow
  ❌ No entity animation states
  ❌ No share/viral system

HOTFIXES GERADOS (pendentes codificação):
  📋 HOTFIX-MARKETING-SCROLL — fix overflow + create marketing components
  📋 HOTFIX-5-BUGS — emoji, error boundary, tier pills
  📋 HOTFIX-2-COST-REALITY — suggestions local, referral, cache
  📋 HOTFIX-3-CRITICAL-TECH — npm, supabase imports, stripe webhook, tailwind
  📋 HOTFIX-PRICING-v2-TOKENS — token billing system ($0/29/99/249)
```

---

## REFERÊNCIAS APLICADAS (de todas as reverse engineering)

```
REF  │ O QUE ROUBAMOS PRO OCTUX                          │ PROMPTS
─────┼────────────────────────────────────────────────────┼────────
Okara    │ Product above fold, marketing below, frictionless   │ PF-01, PF-19
v0       │ Command surface, suggestion chips, editorial cards  │ PF-06, PF-14
Perplexity│ Progressive disclosure, agent streaming, citations │ PF-09→PF-13, PF-15
Linear   │ Sidebar discipline, Cmd+K, shortcuts, opacity      │ PF-03, PF-04, PF-29
ChatGPT  │ Position AGAINST (opinions vs analysis)             │ PF-19
Dify     │ How it works narrative (graph visual)               │ PF-19
OpenBB   │ Boardroom-safe output, structured decisions         │ PF-14, PF-27
MiroFish │ Agent memory, post-sim chat, knowledge graph        │ PF-18 (but for humans, not enterprise)
Palantir │ Decision Object, audit trail                        │ PF-14, PF-15
CrewAI   │ Role-goal-backstory agents, delegation              │ PF-30
```

---

## IDENTIDADE OCTUX (invariáveis — nunca desviar)

```
VISUAL:
  Accent: #7C3AED (purple)
  Background: #0A0A0F (near black)
  Entity: 🐙 octopus com gradient purple→cyan, breathing animation
  Feel: futuristic, strategic, premium, boardroom-safe
  NUNCA: playful, cartoon, neon, clutter, emojis na UI (só no entity)

POSITIONING:
  "Never decide alone again"
  Compete com: pensar sozinho (não com MiroFish/ChatGPT)
  TAM: 8 bilhões de pessoas que tomam decisões sozinhas

PRODUCT:
  10 AI specialists debating YOUR decision
  Self-Agent: YOU enter the debate
  Memory that compounds: learns YOUR decision style
  Citations: every claim traceable to the agent who made it

ARCHITECTURE (confirmada pelo P39):
  Tudo é conversa. Uma tela. O polvo tá sempre ali.
  Chat e simulação no MESMO thread.
  4 estados do polvo: idle → chatting → diving → resting
```

---

## FASES E PROMPTS

### FASE 0 — HOTFIXES (deploy pending)
### FASE 1 — FOUNDATION (PF-01 → PF-03)
### FASE 2 — SHELL QUALITY (PF-04 → PF-05)
### FASE 3 — CHAT END-TO-END (PF-06 → PF-08)
### FASE 4 — SIMULATION STREAMING (PF-09 → PF-13)
### FASE 5 — VERDICT & CITATIONS (PF-14 → PF-15)
### FASE 6 — POST-SIM EXPERIENCE (PF-16 → PF-18)
### FASE 7 — MARKETING POLISH (PF-19)
### FASE 8 — AUTH & BILLING (PF-20 → PF-22)
### FASE 9 — ENTITY ANIMATION (PF-23 → PF-24)
### FASE 10 — SHARE & VIRAL (PF-25 → PF-27)
### FASE 11 — POWER USER (PF-28 → PF-30)
### FASE 12 — POLISH & DEPLOY (PF-31 → PF-33)

TOTAL: 5 HOTFIXes + 33 prompts = 38 entregas

# PROMPT 55 — Landing Page (Stripe Trust Sequence)

## Context for AI

You are working on Octux AI — a Decision Operating System built with Next.js 14 App Router + TypeScript + Tailwind CSS + Claude API + Supabase.

**What exists:**
- P44: Design system (dark mode default, surfaces, accent #7C3AED, entity palette, animations)
- P45: 15 base components (OctButton, OctBadge, OctAvatar, OctCard, CircularProgress, etc.)
- P46-P54: Complete chat interface, simulation UX, citations, verdict system, sidebar, command palette, shortcuts
- Auth: Supabase Auth (Google + Magic Link) — already configured
- Boardroom report page: `/c/[id]/report` (P50) — shows interactive verdict

**Current routing:**
- `/c` — chat interface (requires auth)
- `/c/[id]` — conversation thread
- `/c/[id]/report` — public boardroom page
- `/` — currently redirects to `/c`

P55 completo. Phase 5 — Conversion & Monetization.

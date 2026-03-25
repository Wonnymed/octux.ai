# PROMPT 56 — Pricing & Stripe Integration (Monetization Engine)

## Context for AI

Octux AI — Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + Claude API + Supabase.

P55 landing page with pricing preview. No monetization yet. This prompt adds Stripe integration, tier gating, usage tracking.

## Files to create

1. `lib/billing/tiers.ts` — Tier configuration
2. `lib/billing/usage.ts` — Usage tracking
3. `lib/billing/stripe.ts` — Stripe helpers
4. `app/api/billing/checkout/route.ts` — Checkout Session
5. `app/api/billing/portal/route.ts` — Customer Portal
6. `app/api/webhooks/stripe/route.ts` — Webhook handler
7. `app/pricing/page.tsx` — Full pricing page
8. `lib/middleware/tierGate.ts` — Server-side tier gating
9. `components/billing/UpgradePrompt.tsx` — Client upgrade nudge

P56 completo.

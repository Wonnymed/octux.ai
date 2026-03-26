# PF-07 — Message Rendering Components

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion.

**Ref:** ChatGPT/Claude (message bubbles, markdown rendering), Perplexity (structured responses, inline citations), Linear (polish every detail)

**What this prompt builds:**

The message rendering layer — every component needed to display conversation messages. Each message_type gets its own renderer. The orchestrator (MessageRenderer) reads the type and delegates.

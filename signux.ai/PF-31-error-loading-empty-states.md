# PF-31 — Error Boundaries + Loading States + Empty States

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion.

**Ref:** Linear (polish 228 things, not 1 big thing), Stripe (every edge case handled gracefully), Claude.ai (skeleton loading, clean error recovery).

**Philosophy:** No white screens. No spinners without context. No empty pages without a CTA. Every component has 3 states: loading, error, empty — and each state is designed, not an afterthought.

**What exists:**
- `app/(shell)/c/[id]/error.tsx` — basic error boundary from HOTFIX (entity + "Something went wrong" + Try again/Go home)
- shadcn/ui `Skeleton` component available
- Framer Motion for animations
- All PF-01 → PF-30 components built

**What this prompt builds:**

1. Global error boundary (`app/error.tsx`)
2. Shell error boundary (`app/(shell)/error.tsx`)
3. Conversation error boundary (upgrade existing `app/(shell)/c/[id]/error.tsx`)
4. Global loading (`app/loading.tsx`)
5. Shell loading (`app/(shell)/loading.tsx`)
6. Conversation loading (`app/(shell)/c/[id]/loading.tsx`)
7. `NetworkStatusBanner` — offline detection
8. `SessionExpiredPrompt` — re-auth when token expires
9. `RetryWrapper` — generic retry-on-error wrapper
10. Empty states for: sidebar (no conversations), conversation (no messages), search (no results)
11. API error handler utility

---

## Part A — Global Error Boundary

CREATE `app/error.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Home, AlertOctagon } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking (Sentry, etc)
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-white antialiased">
        <div className="min-h-dvh flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#7C3AED]/80 to-[#06b6d4]/60 flex items-center justify-center">
              <span className="text-2xl">🐙</span>
            </div>

            <h1 className="text-lg font-medium text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              {error.message || 'An unexpected error occurred. Our octopus is looking into it.'}
            </p>

            {error.digest && (
              <p className="text-[10px] text-white/20 mb-6 font-mono">Error ID: {error.digest}</p>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6d2ed8] transition-colors"
              >
                <RefreshCcw size={14} />
                Try again
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] text-white/70 text-sm font-medium hover:bg-white/[0.1] transition-colors"
              >
                <Home size={14} />
                Go home
              </a>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
```

---

## Part B — Shell Error Boundary

CREATE `app/(shell)/error.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Home, Bug } from 'lucide-react';

export default function ShellError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Shell error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-sm w-full text-center"
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-verdict-abandon/10 flex items-center justify-center">
          <Bug size={22} className="text-verdict-abandon" />
        </div>

        <h2 className="text-base font-medium text-txt-primary mb-1.5">Page failed to load</h2>
        <p className="text-xs text-txt-tertiary mb-5 leading-relaxed">
          {error.message || 'Something went wrong loading this page.'}
        </p>

        <div className="flex gap-2.5 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
          >
            <RefreshCcw size={13} />
            Retry
          </button>
          <a
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-2 text-txt-secondary text-xs font-medium hover:bg-surface-2/80 transition-colors"
          >
            <Home size={13} />
            Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
```

---

## Part C — Conversation Error Boundary (Upgrade)

REPLACE `app/(shell)/c/[id]/error.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Home, ArrowLeft, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConversationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error('Conversation error:', error);
  }, [error]);

  const handleCopyError = async () => {
    const text = `Octux Error: ${error.message}\nDigest: ${error.digest || 'N/A'}\nURL: ${window.location.href}\nTime: ${new Date().toISOString()}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-sm w-full text-center"
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/60 to-entity-bioluminescent/40 flex items-center justify-center">
          <span className="text-xl">🐙</span>
        </div>

        <h2 className="text-base font-medium text-txt-primary mb-1.5">Conversation error</h2>
        <p className="text-xs text-txt-tertiary mb-1 leading-relaxed">
          {error.message || 'Failed to load this conversation.'}
        </p>
        <p className="text-micro text-txt-disabled mb-5">
          Your messages are saved. Try refreshing.
        </p>

        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
          >
            <RefreshCcw size={13} />
            Retry
          </button>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-2 text-txt-secondary text-xs font-medium hover:bg-surface-2/80 transition-colors"
          >
            <ArrowLeft size={13} />
            Go back
          </button>
          <a
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-2 text-txt-secondary text-xs font-medium hover:bg-surface-2/80 transition-colors"
          >
            <Home size={13} />
            Home
          </a>
        </div>

        {/* Copy error for support */}
        <button
          onClick={handleCopyError}
          className="flex items-center gap-1 mx-auto mt-4 text-micro text-txt-disabled hover:text-txt-tertiary transition-colors"
        >
          {copied ? <Check size={10} className="text-verdict-proceed" /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy error details'}
        </button>
      </motion.div>
    </div>
  );
}
```

---

## Part D — Loading States (Skeletons)

CREATE `app/loading.tsx` (global):

```typescript
export default function GlobalLoading() {
  return (
    <div className="min-h-dvh bg-surface-0 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/60 to-entity-bioluminescent/40 flex items-center justify-center animate-pulse">
        <span className="text-lg">🐙</span>
      </div>
    </div>
  );
}
```

CREATE `app/(shell)/loading.tsx`:

```typescript
import { ShellSkeleton } from '@/components/skeletons';

export default function ShellLoading() {
  return <ShellSkeleton />;
}
```

CREATE `app/(shell)/c/[id]/loading.tsx`:

```typescript
import { ConversationSkeleton } from '@/components/skeletons';

export default function ConversationLoading() {
  return <ConversationSkeleton />;
}
```

---

## Part E — Skeleton Components

CREATE `components/skeletons/index.tsx`:

```typescript
'use client';

import { cn } from '@/lib/design/cn';

/** Generic skeleton pulse block */
function Bone({ className }: { className?: string }) {
  return <div className={cn('rounded bg-surface-2/60 animate-pulse', className)} />;
}

// ═══ SHELL SKELETON (sidebar + content area) ═══

export function ShellSkeleton() {
  return (
    <div className="flex h-dvh bg-surface-0">
      {/* Sidebar skeleton */}
      <div className="w-[260px] border-r border-border-subtle/30 p-4 space-y-4 shrink-0">
        <div className="flex items-center gap-2">
          <Bone className="w-8 h-8 rounded-full" />
          <Bone className="h-4 w-16" />
        </div>
        <Bone className="h-8 w-full rounded-lg" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Bone className="w-4 h-4 rounded" />
              <Bone className="h-3 flex-1" style={{ width: `${60 + Math.random() * 30}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <Bone className="w-16 h-16 rounded-full mb-4" />
        <Bone className="h-5 w-24 mb-2" />
        <Bone className="h-3 w-40" />
      </div>
    </div>
  );
}

// ═══ CONVERSATION SKELETON ═══

export function ConversationSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-center py-3 shrink-0">
        <Bone className="w-10 h-10 rounded-full" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* User message skeleton */}
          <div className="flex justify-end">
            <Bone className="h-10 w-48 rounded-2xl rounded-br-md" />
          </div>

          {/* Assistant message skeleton */}
          <div className="flex justify-start">
            <div className="space-y-2 max-w-[80%]">
              <Bone className="h-4 w-full rounded" />
              <Bone className="h-4 w-[90%] rounded" />
              <Bone className="h-4 w-[75%] rounded" />
              <Bone className="h-4 w-[85%] rounded" />
              <Bone className="h-4 w-[60%] rounded" />
            </div>
          </div>

          {/* Another user message */}
          <div className="flex justify-end">
            <Bone className="h-10 w-56 rounded-2xl rounded-br-md" />
          </div>

          {/* Another assistant */}
          <div className="flex justify-start">
            <div className="space-y-2 max-w-[80%]">
              <Bone className="h-4 w-full rounded" />
              <Bone className="h-4 w-[80%] rounded" />
              <Bone className="h-4 w-[70%] rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Input skeleton */}
      <div className="shrink-0 border-t border-border-subtle/30 px-6 py-3">
        <div className="max-w-2xl mx-auto">
          <Bone className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ═══ SIDEBAR CONVERSATIONS SKELETON ═══

export function SidebarConversationsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-1.5 px-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg">
          <Bone className="w-4 h-4 rounded" />
          <Bone className="h-3 flex-1" style={{ width: `${50 + Math.random() * 40}%` }} />
        </div>
      ))}
    </div>
  );
}

// ═══ VERDICT SKELETON ═══

export function VerdictSkeleton() {
  return (
    <div className="my-4 rounded-xl border-2 border-border-subtle/30 p-5">
      <div className="flex items-start gap-4">
        <Bone className="w-16 h-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex gap-2">
            <Bone className="h-5 w-20 rounded-md" />
            <Bone className="h-5 w-8 rounded" />
          </div>
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-[85%]" />
          <div className="flex gap-4 pt-1">
            <Bone className="h-3 w-32" />
            <Bone className="h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ SIMULATION SKELETON ═══

export function SimulationSkeleton() {
  return (
    <div className="my-4 rounded-xl border-2 border-accent/10 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Bone className="w-5 h-5 rounded" />
        <Bone className="h-4 w-28" />
        <Bone className="h-3 w-8 ml-auto" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Bone className="w-4 h-4 rounded-full" />
          <Bone className="h-3 flex-1" style={{ width: `${60 + i * 8}%` }} />
        </div>
      ))}
    </div>
  );
}
```

---

## Part F — Empty States

CREATE `components/empty-states/index.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Search, Zap, Plus } from 'lucide-react';
import { cn } from '@/lib/design/cn';

// ═══ NO CONVERSATIONS (sidebar) ═══

export function EmptyConversations({ onNew }: { onNew?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center mb-3">
        <MessageSquare size={18} className="text-txt-disabled" />
      </div>
      <p className="text-xs text-txt-tertiary mb-1">No conversations yet</p>
      <p className="text-micro text-txt-disabled mb-4">Ask your first decision question</p>
      {onNew && (
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/15 transition-colors"
        >
          <Plus size={12} />
          New conversation
        </button>
      )}
    </motion.div>
  );
}

// ═══ NO MESSAGES (conversation) ═══

export function EmptyMessages() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center mb-4">
        <Zap size={20} className="text-accent/40" />
      </div>
      <p className="text-sm text-txt-tertiary mb-1">Ask anything about a decision you're facing</p>
      <p className="text-micro text-txt-disabled">10 AI specialists will analyze your question</p>
    </motion.div>
  );
}

// ═══ NO SEARCH RESULTS ═══

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <Search size={18} className="text-txt-disabled mb-2" />
      <p className="text-xs text-txt-tertiary">
        No results for "<span className="text-txt-secondary">{query}</span>"
      </p>
      <p className="text-micro text-txt-disabled mt-0.5">Try a different search term</p>
    </motion.div>
  );
}

// ═══ NO SIMULATIONS ═══

export function EmptySimulations() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <Zap size={18} className="text-txt-disabled mb-2" />
      <p className="text-xs text-txt-tertiary">No simulations run yet</p>
      <p className="text-micro text-txt-disabled mt-0.5">
        Click "Activate Deep Simulation" when prompted
      </p>
    </motion.div>
  );
}

// ═══ GENERIC EMPTY ═══

export function EmptyState({
  icon: Icon = MessageSquare,
  title,
  description,
  action,
  actionLabel,
  className,
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex flex-col items-center justify-center py-10 text-center', className)}
    >
      <Icon size={20} className="text-txt-disabled mb-3" />
      <p className="text-xs text-txt-tertiary">{title}</p>
      {description && <p className="text-micro text-txt-disabled mt-0.5">{description}</p>}
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-3 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/15 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
```

---

## Part G — NetworkStatusBanner

CREATE `components/network/NetworkStatusBanner.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export default function NetworkStatusBanner() {
  const [online, setOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowReconnected(false);
    };

    // Set initial state
    setOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="sticky top-0 z-[100] bg-verdict-abandon/90 backdrop-blur-sm"
        >
          <div className="flex items-center justify-center gap-2 py-1.5 px-4">
            <WifiOff size={13} className="text-white" />
            <span className="text-xs text-white font-medium">
              You're offline. Messages will send when you reconnect.
            </span>
          </div>
        </motion.div>
      )}

      {showReconnected && online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="sticky top-0 z-[100] bg-verdict-proceed/90 backdrop-blur-sm"
        >
          <div className="flex items-center justify-center gap-2 py-1.5 px-4">
            <Wifi size={13} className="text-white" />
            <span className="text-xs text-white font-medium">Back online</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Part H — SessionExpiredPrompt

CREATE `components/auth/SessionExpiredPrompt.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X } from 'lucide-react';

export default function SessionExpiredPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener('octux:session-expired', handler);
    return () => window.removeEventListener('octux:session-expired', handler);
  }, []);

  // Also detect 401 responses globally
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const url = typeof args[0] === 'string' ? args[0] : '';
        // Only trigger for our API routes, not external
        if (url.startsWith('/api/')) {
          window.dispatchEvent(new CustomEvent('octux:session-expired'));
        }
      }
      return response;
    };
    return () => { window.fetch = originalFetch; };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full mx-4"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-raised border border-accent/20 shadow-lg">
          <LogIn size={16} className="text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-txt-primary">Session expired</p>
            <p className="text-micro text-txt-tertiary">Sign in again to continue</p>
          </div>
          <button
            onClick={() => {
              setShow(false);
              window.dispatchEvent(new CustomEvent('octux:show-auth', { detail: { source: 'session' } }));
            }}
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shrink-0"
          >
            Sign in
          </button>
          <button
            onClick={() => setShow(false)}
            className="p-1 rounded text-txt-disabled hover:text-txt-tertiary"
          >
            <X size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Part I — RetryWrapper Utility

CREATE `components/utils/RetryWrapper.tsx`:

```typescript
'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { RefreshCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/design/cn';

interface RetryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry: () => Promise<void>;
  maxRetries?: number;
  className?: string;
}

/**
 * Wraps any async content with automatic retry on error.
 * Shows error state with retry button when the wrapped operation fails.
 */
export default function RetryWrapper({
  children, fallback, onRetry, maxRetries = 3, className,
}: RetryWrapperProps) {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) return;
    setRetrying(true);
    try {
      await onRetry();
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setRetryCount((c) => c + 1);
    } finally {
      setRetrying(false);
    }
  }, [onRetry, retryCount, maxRetries]);

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-6 text-center', className)}>
        <AlertCircle size={18} className="text-verdict-abandon mb-2" />
        <p className="text-xs text-txt-tertiary mb-1">{error}</p>
        {retryCount < maxRetries ? (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs text-accent hover:bg-accent/5 transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={12} className={cn(retrying && 'animate-spin')} />
            {retrying ? 'Retrying...' : `Retry (${maxRetries - retryCount} left)`}
          </button>
        ) : (
          <p className="text-micro text-txt-disabled mt-2">Max retries reached. Please refresh the page.</p>
        )}
        {fallback}
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Part J — API Error Handler

CREATE `lib/utils/apiError.ts`:

```typescript
/**
 * Standardized API error handling.
 * Wraps fetch calls with consistent error parsing and status handling.
 */

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Wrapper for fetch that handles common error patterns.
 * Throws ApiError on non-OK responses.
 */
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    // Session expired
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('octux:session-expired'));
      throw new ApiError('Session expired', 401, 'AUTH_EXPIRED');
    }

    // Rate limited
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      throw new ApiError(
        `Rate limited. ${retryAfter ? `Try again in ${retryAfter}s` : 'Please wait.'}`,
        429,
        'RATE_LIMITED',
      );
    }

    // Token gate
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(
        data.message || 'Insufficient tokens',
        403,
        'TOKEN_GATE',
      );
    }

    // Parse error body
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(body.error || body.message || `Request failed (${res.status})`, res.status);
  }

  return res.json();
}
```

---

## Part K — Wire into ShellClient

UPDATE `app/(shell)/ShellClient.tsx`:

```typescript
import NetworkStatusBanner from '@/components/network/NetworkStatusBanner';
import SessionExpiredPrompt from '@/components/auth/SessionExpiredPrompt';

// In the return JSX:
return (
  <div className="flex h-dvh bg-surface-0">
    <Sidebar />
    <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <NetworkStatusBanner />
      {children}
    </main>
    <CommandPalette />
    <ShortcutsOverlay />
    <ShortcutToast />
    <OnboardingProvider isLoggedIn={isLoggedIn} />
    <SessionExpiredPrompt />
  </div>
);
```

---

## Testing

### Test 1 — Global error boundary:
Throw an error in root layout → shows entity + "Something went wrong" + Try again + Go home.

### Test 2 — Conversation error:
Navigate to `/c/invalid-uuid` → error boundary shows "Conversation error" with Retry + Go back + Home + Copy error.

### Test 3 — Shell loading:
Slow network → shell loading shows sidebar skeleton + content skeleton with pulse animation.

### Test 4 — Conversation loading:
Navigate to conversation → loading shows: small entity skeleton at top, alternating user/assistant message skeletons, input skeleton at bottom.

### Test 5 — Empty sidebar:
New user with no conversations → sidebar shows "No conversations yet" + "New conversation" button.

### Test 6 — Empty conversation:
Open conversation with no messages → shows "Ask anything about a decision" empty state.

### Test 7 — Empty search:
Search "xyz123" with no matches → "No results for 'xyz123'" with "Try a different search term".

### Test 8 — Offline banner:
Disable network (DevTools) → red banner: "You're offline. Messages will send when you reconnect." Re-enable → green banner: "Back online" (auto-dismisses 3s).

### Test 9 — Session expired:
API returns 401 → prompt appears top-center: "Session expired · Sign in again" with sign in button.

### Test 10 — RetryWrapper:
Wrap a failing fetch in RetryWrapper → shows error + "Retry (3 left)". Click retry → retries. After 3 fails → "Max retries reached."

### Test 11 — Copy error details:
On conversation error → click "Copy error details" → clipboard has error message + digest + URL + timestamp.

### Test 12 — Skeleton shapes match real content:
Loading skeletons approximate the real layout: user messages right-aligned, assistant left-aligned, correct widths, rounded corners matching bubble shapes.

---

## Files Created/Modified

```
CREATED:
  app/error.tsx — global error boundary
  app/(shell)/error.tsx — shell error boundary
  app/loading.tsx — global loading
  app/(shell)/loading.tsx — shell loading
  app/(shell)/c/[id]/loading.tsx — conversation loading
  components/skeletons/index.tsx — all skeleton components
  components/empty-states/index.tsx — all empty state components
  components/network/NetworkStatusBanner.tsx — offline/online detection
  components/auth/SessionExpiredPrompt.tsx — 401 re-auth prompt
  components/utils/RetryWrapper.tsx — retry-on-error wrapper
  lib/utils/apiError.ts — standardized API error handling

MODIFIED:
  app/(shell)/c/[id]/error.tsx — upgraded with copy error + go back
  app/(shell)/ShellClient.tsx — add NetworkStatusBanner + SessionExpiredPrompt
```

---

Manda pro Fernando. Faltam só **PF-17, PF-18, PF-21, PF-32** pra completar o roadmap inteiro. Quer que eu gere? 🐙

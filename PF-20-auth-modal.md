# PF-20 — Auth Modal (Frictionless Authentication)

## Context for AI

You are working on Octux AI — a Decision Operating System. Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Zustand + Lucide React + Framer Motion + Supabase Auth.

**Ref:** Okara (auth only when needed, never before value), Claude.ai (clean modal), Linear (minimal friction). Auth should NEVER be a wall before the user sees value. The product works without auth — auth appears ONLY when the user tries to DO something that requires it.

**What exists:**
- Supabase Auth configured (Google OAuth + Magic Link)
- `lib/supabase/server.ts` and `lib/supabase/client.ts` (createBrowserClient, createServerClient)
- Auth gate placeholder in root page `HomePage` (PF-08): `setShowAuth(true)` when unauthenticated user sends message
- `AuthModalPlaceholder` renders a basic "Sign in to continue" card
- `pendingMessage` state: preserves the user's question before auth
- Marketing CTAs ("Go Pro", "Start deciding →", "Try your own decision") trigger `onSignIn` callback

**What this prompt builds:**

A polished auth modal that:
1. Appears as an overlay MODAL (not page redirect)
2. Shows Google OAuth button + Magic Link email input
3. Preserves the user's pending question (shown in the modal)
4. Auto-sends the pending message after auth completes
5. Stores pending question in localStorage as backup
6. Brief GDPR consent text
7. Framer Motion entrance/exit animations
8. Works from: chat input, marketing CTAs, sidebar "Upgrade to Pro"

---

## Part A — AuthModal Component

CREATE `components/auth/AuthModal.tsx`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { createBrowserClient } from '@/lib/supabase/client';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (userId: string) => void;
  pendingQuestion?: string | null;
  triggerSource?: 'chat' | 'upgrade' | 'cta' | 'marketing';
}

export default function AuthModal({
  open,
  onClose,
  onComplete,
  pendingQuestion,
  triggerSource = 'chat',
}: AuthModalProps) {
  const [mode, setMode] = useState<'initial' | 'magic-link'>('initial');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  // Persist pending question to localStorage
  useEffect(() => {
    if (pendingQuestion) {
      localStorage.setItem('octux:pending-question', pendingQuestion);
    }
  }, [pendingQuestion]);

  // Listen for auth state change (after OAuth redirect or magic link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          onComplete(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, onComplete]);

  // ─── GOOGLE AUTH ───
  const handleGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      // Redirect happens automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect with Google');
      setLoading(false);
    }
  }, [supabase]);

  // ─── MAGIC LINK ───
  const handleMagicLink = useCallback(async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  }, [email, supabase]);

  // ─── CLOSE HANDLER ───
  const handleClose = () => {
    if (!loading) {
      setMode('initial');
      setMagicLinkSent(false);
      setError(null);
      onClose();
    }
  };

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, loading]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-surface-overlay/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm mx-4"
          >
            <div className="bg-surface-raised border border-border-subtle rounded-2xl shadow-xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={loading}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-txt-disabled hover:text-txt-tertiary hover:bg-surface-2 transition-colors z-10"
              >
                <X size={16} />
              </button>

              {/* Content */}
              <div className="px-6 pt-8 pb-6">
                {/* Entity + branding */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-accent/80 to-entity-bioluminescent/60 flex items-center justify-center">
                    <span className="text-lg">🐙</span>
                  </div>
                  <h2 className="text-lg font-medium text-txt-primary">
                    {triggerSource === 'upgrade' ? 'Sign in to upgrade' : 'Sign in to continue'}
                  </h2>
                  <p className="text-xs text-txt-tertiary mt-1">
                    {triggerSource === 'upgrade'
                      ? 'Create an account to unlock more tokens'
                      : 'Free account. No credit card required.'}
                  </p>
                </div>

                {/* Pending question preview */}
                {pendingQuestion && !magicLinkSent && (
                  <div className="mb-5 px-3 py-2 rounded-lg bg-accent/5 border border-accent/10">
                    <p className="text-micro text-txt-disabled mb-0.5">Your question will be sent after sign in:</p>
                    <p className="text-xs text-accent italic truncate">"{pendingQuestion}"</p>
                  </div>
                )}

                {/* Magic link sent state */}
                {magicLinkSent ? (
                  <MagicLinkSent email={email} onResend={handleMagicLink} />
                ) : mode === 'magic-link' ? (
                  <MagicLinkForm
                    email={email}
                    setEmail={setEmail}
                    loading={loading}
                    error={error}
                    onSubmit={handleMagicLink}
                    onBack={() => { setMode('initial'); setError(null); }}
                  />
                ) : (
                  <InitialAuth
                    loading={loading}
                    error={error}
                    onGoogle={handleGoogle}
                    onMagicLink={() => { setMode('magic-link'); setError(null); }}
                  />
                )}
              </div>

              {/* GDPR consent */}
              <div className="px-6 pb-5">
                <p className="text-[10px] text-txt-disabled text-center leading-relaxed">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="text-txt-tertiary hover:text-accent transition-colors underline">Terms</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-txt-tertiary hover:text-accent transition-colors underline">Privacy Policy</a>.
                  We store your decisions securely and never sell your data.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ═══ INITIAL AUTH (Google + Magic Link buttons) ═══

function InitialAuth({
  loading, error, onGoogle, onMagicLink,
}: {
  loading: boolean;
  error: string | null;
  onGoogle: () => void;
  onMagicLink: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Google button */}
      <button
        onClick={onGoogle}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl',
          'border border-border-default bg-surface-1',
          'text-sm text-txt-primary font-medium',
          'hover:bg-surface-2 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-micro text-txt-disabled">or</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      {/* Magic link button */}
      <button
        onClick={onMagicLink}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
          'border border-border-subtle bg-transparent',
          'text-sm text-txt-secondary',
          'hover:bg-surface-1 hover:text-txt-primary transition-colors',
          'disabled:opacity-50',
        )}
      >
        <Mail size={15} />
        Sign in with email
      </button>

      {error && (
        <p className="text-xs text-verdict-abandon text-center">{error}</p>
      )}
    </div>
  );
}

// ═══ MAGIC LINK FORM ═══

function MagicLinkForm({
  email, setEmail, loading, error, onSubmit, onBack,
}: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="text-micro text-txt-tertiary hover:text-txt-secondary transition-colors mb-1"
      >
        ← Back
      </button>

      <div>
        <label htmlFor="auth-email" className="text-xs text-txt-secondary mb-1.5 block">
          Email address
        </label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
          placeholder="you@example.com"
          autoFocus
          disabled={loading}
          className={cn(
            'w-full h-10 px-3 rounded-lg text-sm',
            'bg-surface-1 border border-border-default',
            'text-txt-primary placeholder:text-txt-disabled',
            'focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20',
            'disabled:opacity-50',
            'transition-colors',
          )}
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || !email.trim()}
        className={cn(
          'w-full flex items-center justify-center gap-2 h-10 rounded-xl',
          'bg-accent text-white text-sm font-medium',
          'hover:bg-accent-hover transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <>
            Send magic link
            <ArrowRight size={14} />
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-verdict-abandon text-center">{error}</p>
      )}
    </div>
  );
}

// ═══ MAGIC LINK SENT ═══

function MagicLinkSent({ email, onResend }: { email: string; onResend: () => void }) {
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanResend(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center space-y-3">
      <div className="w-10 h-10 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
        <Mail size={18} className="text-accent" />
      </div>
      <div>
        <p className="text-sm text-txt-primary font-medium">Check your email</p>
        <p className="text-xs text-txt-tertiary mt-1">
          We sent a magic link to <span className="text-txt-secondary">{email}</span>
        </p>
      </div>
      <p className="text-micro text-txt-disabled">
        Click the link in the email to sign in. It expires in 10 minutes.
      </p>
      {canResend && (
        <button
          onClick={onResend}
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          Resend link
        </button>
      )}
    </div>
  );
}

// ═══ GOOGLE ICON ═══

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
```

---

## Part B — Auth Callback Route

CREATE `app/auth/callback/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Handles OAuth and Magic Link callbacks.
 * Exchanges the code for a session and redirects to home.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home — the pending question will be picked up from localStorage
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
```

**NOTE:** If you already use `@supabase/ssr` instead of `@supabase/auth-helpers-nextjs`, adapt the import:

```typescript
import { createServerClient } from '@supabase/ssr';
// Then create client with cookies() as per your existing pattern
```

---

## Part C — useAuth Hook

CREATE `hooks/useAuth.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  }, [supabase]);

  return {
    user,
    session,
    isLoggedIn: !!user,
    isLoading,
    signOut,
  };
}
```

---

## Part D — Wire AuthModal into Root Page

UPDATE the root page component to replace the placeholder with the real AuthModal.

**Find and replace the `AuthModalPlaceholder` usage:**

```typescript
// BEFORE (placeholder):
import AuthModalPlaceholder from '...'; // or inline function

{showAuth && (
  <AuthModalPlaceholder
    onClose={() => { setShowAuth(false); setPendingMessage(null); }}
    onComplete={handleAuthComplete}
    pendingQuestion={pendingMessage}
  />
)}

// AFTER (real modal):
import AuthModal from '@/components/auth/AuthModal';

<AuthModal
  open={showAuth}
  onClose={() => { setShowAuth(false); setPendingMessage(null); }}
  onComplete={async (userId) => {
    setShowAuth(false);
    // Retrieve pending question
    const pending = pendingMessage || localStorage.getItem('octux:pending-question');
    if (pending) {
      localStorage.removeItem('octux:pending-question');
      // Wait a tick for auth state to propagate
      await new Promise(r => setTimeout(r, 300));
      handleSend(pending, 'ink');
      setPendingMessage(null);
    } else {
      // Just reload to update UI with auth state
      window.location.reload();
    }
  }}
  pendingQuestion={pendingMessage}
  triggerSource="chat"
/>
```

---

## Part E — Wire AuthModal into Marketing CTAs

The marketing sections pass `onSignIn` prop. Wire them to show the auth modal:

```typescript
// In the root page, where marketing sections are rendered:
<LiveExample onSignIn={() => setShowAuth(true)} />
<PricingPreview onSignIn={() => setShowAuth(true)} />
<SiteFooter onSignIn={() => setShowAuth(true)} />
```

This should already be wired from the HOTFIX-RESTORE-MARKETING. Verify it works.

---

## Part F — Wire AuthModal into Sidebar "Upgrade to Pro"

The sidebar has an "Upgrade to Pro" button. It should:
1. If logged in → navigate to /pricing or trigger Stripe checkout
2. If NOT logged in → show auth modal first

```typescript
// In the sidebar component, find the "Upgrade to Pro" button:
// Add an event dispatch that the root page listens to:

// In sidebar:
const handleUpgrade = () => {
  window.dispatchEvent(new CustomEvent('octux:show-auth', {
    detail: { source: 'upgrade' }
  }));
};

// In root page, add event listener:
useEffect(() => {
  const handler = (e: CustomEvent) => {
    setShowAuth(true);
  };
  window.addEventListener('octux:show-auth', handler as EventListener);
  return () => window.removeEventListener('octux:show-auth', handler as EventListener);
}, []);
```

---

## Part G — Pending Question Recovery After OAuth Redirect

When user clicks "Continue with Google", the page redirects to Google → back to `/auth/callback` → redirects to `/`. The pending question is lost from React state but preserved in localStorage.

In the root page, on mount, check for pending question:

```typescript
// In the root page component, add:
useEffect(() => {
  const pending = localStorage.getItem('octux:pending-question');
  if (pending && isLoggedIn) {
    localStorage.removeItem('octux:pending-question');
    // Auto-send the pending question
    setTimeout(() => {
      handleSend(pending, 'ink');
    }, 500); // Small delay to ensure UI is ready
  }
}, [isLoggedIn]);
```

---

## Part H — Delete Placeholder

```
DELETE:
  The AuthModalPlaceholder function/component (inline or separate file)
  If it was a separate file: components/auth/AuthModalPlaceholder.tsx
```

---

## Part I — Export

CREATE `components/auth/index.ts`:

```typescript
export { default as AuthModal } from './AuthModal';
```

---

## Testing

### Test 1 — Auth modal appears on chat send:
Not logged in → type question → press Enter → modal appears with Google + email options. Question shown: "Your question will be sent after sign in."

### Test 2 — Google OAuth flow:
Click "Continue with Google" → redirects to Google → user signs in → redirects back to `/` → pending question auto-sends → conversation created.

### Test 3 — Magic Link flow:
Click "Sign in with email" → enter email → click "Send magic link" → shows "Check your email" screen. Click link in email → signs in → redirects to `/` → pending question auto-sends.

### Test 4 — Marketing CTA triggers auth:
Scroll to pricing → click "Go Pro" → auth modal appears with `triggerSource: 'upgrade'`. Title: "Sign in to upgrade".

### Test 5 — Escape key closes:
Modal open → press Escape → modal closes. Pending message preserved.

### Test 6 — Backdrop click closes:
Click outside modal → closes. Not clickable while loading.

### Test 7 — Error handling:
Enter invalid email → "Please enter a valid email". Google fails → error message shown.

### Test 8 — Resend magic link:
After sending magic link → 30 second cooldown → "Resend link" appears.

### Test 9 — Pending question localStorage backup:
Send message (not logged in) → modal appears → close browser → reopen → sign in → pending question auto-sends from localStorage.

### Test 10 — GDPR consent visible:
Bottom of modal shows: "By continuing, you agree to our Terms and Privacy Policy."

### Test 11 — Animation:
Modal enters: scale 0.95->1, opacity 0->1, y 8->0 (200ms). Backdrop fades in. Exit reverses.

### Test 12 — Already logged in:
If user is logged in → typing question sends directly, no modal.

---

## Files Created/Modified

```
CREATED:
  components/auth/AuthModal.tsx     — full auth modal (Google + Magic Link)
  components/auth/index.ts          — barrel export
  app/auth/callback/route.ts        — OAuth/Magic Link callback handler
  hooks/useAuth.ts                  — auth state hook

MODIFIED:
  app/(shell)/page.tsx              — replace placeholder with real AuthModal
  
DELETED:
  AuthModalPlaceholder (inline or separate file)
```

---

Manda pro Fernando. Depois do PF-20, o próximo é **PF-21** (Token Billing System com Stripe). 🐙


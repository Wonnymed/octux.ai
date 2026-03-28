'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/lib/store/app';
import HomeComposer from '@/components/chat/HomeComposer';
import AuthModal from '@/components/auth/AuthModal';
import DashboardHome from '@/components/dashboard/DashboardHome';
// Marketing sections (below the fold) — logged-out only
import TrustStrip from '@/components/landing/TrustStrip';
import HowItWorks from '@/components/landing/HowItWorks';
import LiveExample from '@/components/landing/LiveExample';
import WhyNotChatGPT from '@/components/landing/WhyNotChatGPT';
import PricingPreview from '@/components/landing/PricingPreview';
import SiteFooter from '@/components/landing/LandingFooter';
import { pendingFirstMessageKey } from '@/lib/chat/firstMessageBootstrap';

export default function HomePage() {
  const { isAuthenticated, isLoading, checkGuestLimit } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const router = useRouter();
  const addConversation = useAppStore((s) => s.addConversation);

  const handleSend = useCallback(
    async (message: string) => {
      if (!message.trim() || loading) return;

      if (!isAuthenticated) {
        try {
          localStorage.setItem('octux_pending_question', message.substring(0, 200));
        } catch {}
        if (!checkGuestLimit()) return;
        setShowAuth(true);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/c', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstMessage: message }),
        });
        const data = await res.json();
        const id = data.id || data.conversation?.id;
        if (!id) throw new Error('No conversation created');

        addConversation({
          id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          domain: 'general',
          has_simulation: false,
          latest_verdict: null,
          latest_verdict_probability: null,
          is_pinned: false,
          message_count: 1,
          simulation_count: 0,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

        try {
          sessionStorage.setItem(pendingFirstMessageKey(id), message);
        } catch {
          /* private mode / quota */
        }

        router.push(`/c/${id}`);
      } catch (err) {
        console.error('Failed to create conversation:', err);
      } finally {
        setLoading(false);
      }
    },
    [loading, isAuthenticated, checkGuestLimit, addConversation, router],
  );

  // Recover pending question after auth
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    const pending = localStorage.getItem('octux_pending_question');
    if (pending) {
      localStorage.removeItem('octux_pending_question');
      void handleSend(pending);
    }
  }, [isAuthenticated, isLoading, handleSend]);

  useEffect(() => {
    if (isAuthenticated) return;
    const onScroll = () => {
      setShowScrollCue(window.scrollY < 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setShowAuth(false);
    router.refresh();
  };

  // ─── Logged-in: dark simulation dashboard (shell only; canvas = placeholder) ───
  if (isAuthenticated && !isLoading) {
    return (
      <DashboardHome
        onSubmit={(msg) => handleSend(msg)}
        loading={loading}
      />
    );
  }

  // ─── Loading / logged-out: marketing landing (light theme) ───
  return (
    <>
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-x-hidden px-4 pb-10 pt-16 sm:px-8 sm:pt-20">
        <div className="relative z-10 mx-auto w-full max-w-[min(100%,780px)] text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-10 flex flex-col items-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent/80 to-entity-bioluminescent/60 shadow-accent-ring">
              <span className="text-2xl">🐙</span>
            </div>
            <h1 className="mt-4 text-[34px] font-semibold tracking-[-0.02em] text-txt-primary">
              OCTUX AI
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <HomeComposer onSend={handleSend} loading={loading} />
          </motion.div>
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-txt-tertiary"
          animate={{
            opacity: showScrollCue ? 1 : 0,
            y: showScrollCue ? [0, 6, 0] : 6,
          }}
          transition={{
            opacity: { duration: 0.2, ease: 'easeOut' },
            y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-1/80">
            <ArrowDown size={18} />
          </div>
        </motion.div>
      </div>

      <TrustStrip />
      <HowItWorks />
      <LiveExample onSignIn={() => setShowAuth(true)} />
      <WhyNotChatGPT />
      <PricingPreview onSignIn={() => setShowAuth(true)} />
      <SiteFooter onSignIn={() => setShowAuth(true)} />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}

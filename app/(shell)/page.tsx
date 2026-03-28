'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/lib/store/app';
import AuthModal from '@/components/auth/AuthModal';
import DashboardHome from '@/components/dashboard/DashboardHome';
import HeroSection from '@/components/landing/HeroSection';
import SimulationPreviewBand from '@/components/landing/SimulationPreviewBand';
import SimulationModes from '@/components/landing/SimulationModes';
import TrustStrip from '@/components/landing/TrustStrip';
import HowItWorks from '@/components/landing/HowItWorks';
import LiveExample from '@/components/landing/LiveExample';
import WhyNotChatGPT from '@/components/landing/WhyNotChatGPT';
import PricingPreview from '@/components/landing/PricingPreview';
import SiteFooter from '@/components/landing/LandingFooter';
import { pendingFirstMessageKey, pendingSimulationKey } from '@/lib/chat/firstMessageBootstrap';
import { dashboardModeToChargeType, useDashboardUiStore } from '@/lib/store/dashboard-ui';
import { useBillingStore } from '@/lib/store/billing';
import { frameQuestionForMode } from '@/lib/simulation/mode-framing';

export default function HomePage() {
  const { isAuthenticated, isLoading, checkGuestLimit } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
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

  const handleAuthSuccess = () => {
    setShowAuth(false);
    router.refresh();
  };

  const handleDashboardRun = useCallback(async () => {
    const { activeMode, activeTier, inputA, inputB } = useDashboardUiStore.getState();
    if (activeMode === 'compare' && (!inputA.trim() || !inputB.trim())) return;

    const chargeType = dashboardModeToChargeType(activeMode, activeTier);
    if (!useBillingStore.getState().canAffordMode(chargeType)) return;

    const framed = frameQuestionForMode(activeMode, inputA, inputB);
    const titleSeed =
      activeMode === 'compare'
        ? `${inputA.trim().slice(0, 24)} vs ${inputB.trim().slice(0, 24)}`
        : inputA.trim().slice(0, 80);

    setLoading(true);
    try {
      const res = await fetch('/api/c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage: titleSeed }),
      });
      const data = await res.json();
      const id = data.id || data.conversation?.id;
      if (!id) throw new Error('No conversation created');

      const displayTitle =
        titleSeed.length > 50 ? `${titleSeed.slice(0, 47)}...` : titleSeed;

      addConversation({
        id,
        title: displayTitle,
        domain: 'general',
        has_simulation: false,
        latest_verdict: null,
        latest_verdict_probability: null,
        is_pinned: false,
        message_count: 0,
        simulation_count: 0,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      try {
        sessionStorage.setItem(
          pendingSimulationKey(id),
          JSON.stringify({ question: framed, simMode: chargeType }),
        );
      } catch {
        /* private mode */
      }

      void useAppStore.getState().fetchConversations({ silent: true });
      router.push(`/c/${id}`);
    } catch (err) {
      console.error('Failed to start simulation:', err);
    } finally {
      setLoading(false);
    }
  }, [addConversation, router]);

  // ─── Logged-in: dark simulation dashboard ───
  if (isAuthenticated && !isLoading) {
    return <DashboardHome onRunDashboard={handleDashboardRun} loading={loading} />;
  }

  // ─── Loading / logged-out: marketing landing (light theme) ───
  return (
    <>
      <div className="min-h-screen overflow-x-hidden bg-surface-0 text-txt-primary">
        <HeroSection onSubmit={handleSend} loading={loading} />
        <SimulationPreviewBand />
        <TrustStrip />
        <SimulationModes />
        <LiveExample onSignIn={() => setShowAuth(true)} />
        <HowItWorks />
        <WhyNotChatGPT />
        <PricingPreview onSignIn={() => setShowAuth(true)} />
        <SiteFooter onSignIn={() => setShowAuth(true)} />
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}

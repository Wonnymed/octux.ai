'use client';

import { useState } from 'react';
import HeroSection from './HeroSection';
import SimulationPreviewBand from './SimulationPreviewBand';
import SimulationModes from './SimulationModes';
import TrustStrip from './TrustStrip';
import HowItWorks from './HowItWorks';
import LiveExample from './LiveExample';
import WhyNotChatGPT from './WhyNotChatGPT';
import PricingPreview from './PricingPreview';
import LandingFooter from './LandingFooter';
import AuthModal from '@/components/auth/AuthModal';

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  const handleHeroSubmit = (message: string) => {
    try {
      localStorage.setItem('octux_pending_question', message.substring(0, 200));
    } catch {
      /* quota / private mode */
    }
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-surface-0 text-txt-primary overflow-x-hidden">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-surface-0/80 backdrop-blur-md border-b border-border-subtle/30">
        <span className="text-sm font-light tracking-[0.15em] text-txt-secondary lowercase">octux</span>
        <button
          type="button"
          onClick={() => setShowAuth(true)}
          className="rounded-md px-2 py-1 text-xs text-txt-tertiary transition-colors duration-normal ease-out hover:text-txt-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
        >
          Sign in
        </button>
      </header>

      <HeroSection onSubmit={handleHeroSubmit} />

      <div className="landing-marketing-stack">
        <SimulationPreviewBand />
        <TrustStrip />
        <SimulationModes />
        <LiveExample onSignIn={() => setShowAuth(true)} />
        <HowItWorks />
        <WhyNotChatGPT />
        <PricingPreview onSignIn={() => setShowAuth(true)} />
        <LandingFooter onSignIn={() => setShowAuth(true)} />
      </div>

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={() => setShowAuth(false)}
      />
    </div>
  );
}

'use client';

import { OctButton } from '@/components/octux';

interface LandingFooterProps {
  onSignIn: () => void;
}

export default function LandingFooter({ onSignIn }: LandingFooterProps) {
  return (
    <footer className="py-16 px-6 border-t border-border-subtle/30 relative overflow-hidden">
      {/* Subtle entity bg */}
      <div className="absolute inset-0 oct-entity-bg opacity-10 pointer-events-none" />

      <div className="relative max-w-landing mx-auto">
        {/* Final CTA */}
        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl font-medium text-txt-primary mb-3">
            Your next decision doesn&apos;t have to be a guess
          </h2>
          <p className="text-sm text-txt-tertiary mb-6">
            10 AI specialists. Real-time debate. Traceable verdicts.
          </p>
          <OctButton variant="default" size="lg" onClick={onSignIn}>
            Start deciding &rarr;
          </OctButton>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-txt-disabled">
          <span className="text-sm font-light tracking-[0.15em] text-txt-tertiary lowercase">octux</span>
          <a href="#" className="hover:text-txt-tertiary transition-colors">About</a>
          <a href="#" className="hover:text-txt-tertiary transition-colors">Privacy</a>
          <a href="#" className="hover:text-txt-tertiary transition-colors">Terms</a>
          <a href="#" className="hover:text-txt-tertiary transition-colors">Contact</a>
        </div>

        <p className="text-center text-micro text-txt-disabled mt-6">
          &copy; 2026 Octux AI. Never decide alone again.
        </p>
      </div>
    </footer>
  );
}

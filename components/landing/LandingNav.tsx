'use client';

import Link from 'next/link';
import SukgoLogo from '@/components/brand/SukgoLogo';

/**
 * Top bar for logged-out desktop shell: full-width landing, no sidebar (FIX G).
 */
export default function LandingNav() {
  return (
    <header
      className="sticky top-0 z-40 w-full px-6 py-4 sm:px-8"
      style={{
        background: 'linear-gradient(to bottom, rgba(13,13,12,0.92) 0%, rgba(13,13,12,0.65) 70%, transparent 100%)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center text-white/90 transition-opacity hover:opacity-90">
          <SukgoLogo variant="dark" size="lg" showWordmark />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('sukgo:show-auth', { detail: { mode: 'login' } }))
            }
            className="px-3 py-2 text-[13px] font-medium text-white/75 transition-colors hover:text-white sm:px-4"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('sukgo:show-auth', { detail: { mode: 'signup' } }))
            }
            className="rounded-xl bg-[#c9a96e] px-4 py-2 text-[13px] font-semibold text-[#0a0a0f] shadow-[0_0_24px_rgba(201,169,110,0.12)] transition-colors hover:bg-[#b8994f] sm:px-5"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}

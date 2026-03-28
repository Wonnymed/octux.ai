'use client';

import { DARK_THEME } from '@/lib/dashboard/theme';

export default function CanvasPlaceholder() {
  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-6"
      style={{
        backgroundColor: DARK_THEME.bg_primary,
        backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 45%, ${DARK_THEME.accent}12 0%, transparent 55%)`,
      }}
    >
      <p className="max-w-md text-center text-[14px] leading-relaxed" style={{ color: DARK_THEME.text_tertiary }}>
        Enter a decision above to start your simulation
      </p>
    </div>
  );
}

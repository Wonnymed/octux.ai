'use client';

import type { DashboardMode } from '@/lib/store/dashboard-ui';

export type CanvasEmptyVisualMode = 'simulate' | 'compare' | 'stress_test' | 'premortem';

const MODE_HINTS: Record<
  CanvasEmptyVisualMode,
  { icon: string; title: string; desc: string }
> = {
  simulate: {
    icon: '◇',
    title: 'Simulation canvas',
    desc: 'Your specialist panel and debate will appear here',
  },
  compare: {
    icon: '⇄',
    title: 'Comparison arena',
    desc: 'Two teams will debate your options here',
  },
  stress_test: {
    icon: '⚠',
    title: 'Vulnerability map',
    desc: 'Nine specialists will stress-test your plan from every angle',
  },
  premortem: {
    icon: '◆',
    title: 'Failure timeline',
    desc: 'The story of how your plan could fail will unfold here',
  },
};

function mapDashboardMode(mode: DashboardMode): CanvasEmptyVisualMode {
  if (mode === 'stress') return 'stress_test';
  return mode;
}

interface CanvasEmptyStateProps {
  mode: DashboardMode;
  /** Simulation running but no completed specialist rows yet */
  waiting?: boolean;
}

export function CanvasEmptyState({ mode, waiting }: CanvasEmptyStateProps) {
  const visual = mapDashboardMode(mode);
  const hint = MODE_HINTS[visual];
  const desc = waiting
    ? 'Agents will appear as they finish…'
    : hint.desc;

  return (
    <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center select-none">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a96e]/15 bg-[#c9a96e]/[0.03]">
        <span className="text-[24px] text-[#c9a96e]/30" aria-hidden>
          {hint.icon}
        </span>
      </div>

      <p className="text-[14px] font-medium text-[#8a8a82]">{hint.title}</p>
      <p className="mt-1 max-w-[280px] text-center text-[12px] leading-relaxed text-[#5a5a55]">
        {desc}
      </p>

      <div className="mt-6 flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 w-1 animate-empty-pulse rounded-full bg-[#c9a96e]/20"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}

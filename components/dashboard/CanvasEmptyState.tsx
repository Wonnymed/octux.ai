'use client';

import type { ComponentType } from 'react';
import type { DashboardMode } from '@/lib/store/dashboard-ui';
import { SimulatePreview } from '@/components/dashboard/canvas-previews/SimulatePreview';
import { ComparePreview } from '@/components/dashboard/canvas-previews/ComparePreview';
import { StressPreview } from '@/components/dashboard/canvas-previews/StressPreview';
import { PremortemPreview } from '@/components/dashboard/canvas-previews/PremortemPreview';

type PreviewMode = 'simulate' | 'compare' | 'stress_test' | 'premortem';

function mapDashboardMode(mode: DashboardMode): PreviewMode {
  if (mode === 'stress') return 'stress_test';
  return mode;
}

const PREVIEW_MAP: Record<PreviewMode, ComponentType> = {
  simulate: SimulatePreview,
  compare: ComparePreview,
  stress_test: StressPreview,
  premortem: PremortemPreview,
};

interface CanvasEmptyStateProps {
  mode: DashboardMode;
  /** Simulation running but no completed specialist rows yet */
  waiting?: boolean;
}

export function CanvasEmptyState({ mode, waiting }: CanvasEmptyStateProps) {
  const visual = mapDashboardMode(mode);
  const Preview = PREVIEW_MAP[visual] ?? SimulatePreview;

  return (
    <div className="relative flex min-h-[280px] flex-1 flex-col select-none">
      <div
        className={`relative flex min-h-[260px] flex-1 flex-col ${waiting ? 'opacity-[0.85]' : ''}`}
      >
        <Preview />
      </div>

      {waiting ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
          <p className="rounded-lg border border-white/[0.08] bg-[#111118]/90 px-3 py-2 text-center text-[12px] text-white/70 shadow-sm backdrop-blur-sm">
            Agents will appear as they finish…
          </p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[3] w-[90%] max-w-md -translate-x-1/2 text-center">
        <p className="text-[11px] text-white/50">
          {waiting ? 'Live simulation in progress' : 'Enter a question above to begin'}
        </p>
      </div>
    </div>
  );
}

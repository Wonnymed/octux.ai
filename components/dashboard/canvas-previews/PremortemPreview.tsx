'use client';

import { useState } from 'react';

const TIMELINE_POINTS = [
  { label: 'Launch', month: 'M1', tone: 'ok' as const },
  { label: 'Growth', month: 'M3', tone: 'ok' as const },
  { label: 'Plateau', month: 'M6', tone: 'ponr' as const },
  { label: 'Decline', month: 'M9', tone: 'bad' as const },
  { label: 'Failed', month: 'M12', tone: 'fail' as const },
];

export function PremortemPreview() {
  const [tip, setTip] = useState<string | null>(null);

  return (
    <div className="relative flex h-full min-h-[280px] w-full flex-col items-center justify-center px-4 sm:px-8">
      <p className="pointer-events-none absolute left-3 top-2 z-[3] rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
        ● Demo · Failure autopsy · PONR at Month 6
      </p>

      <div className="mt-10 flex w-full max-w-[540px] items-center">
        {TIMELINE_POINTS.map((point, i) => (
          <div key={point.month} className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              onClick={() =>
                setTip(
                  point.tone === 'ponr'
                    ? 'Month 6: Point of no return — customer acquisition cost exceeded LTV. The pivot to delivery failed to generate volume.'
                    : `${point.month}: ${point.label} — specialist consensus shifts as runway shortens.`,
                )
              }
              className="group flex w-full flex-col items-center opacity-100"
            >
              {point.tone === 'ponr' ? (
                <div
                  className="flex h-4 w-4 rotate-45 border-2 shadow-[0_0_14px_rgba(251,191,36,0.4)]"
                  style={{
                    borderColor: '#fbbf24',
                    background: 'rgba(251,191,36,0.15)',
                  }}
                  aria-label="Point of no return"
                />
              ) : (
                <div
                  className={`h-3.5 w-3.5 rounded-full border-2 ${
                    point.tone === 'fail'
                      ? 'border-[#f87171] bg-[#f87171]/30'
                      : point.tone === 'bad'
                        ? 'border-[#f87171]/80 bg-[#f87171]/15'
                        : 'border-[#4ade80]/80 bg-[#4ade80]/20'
                  }`}
                />
              )}
              <span className="mt-2 text-[10px] font-semibold text-white/90">{point.month}</span>
              <span className="text-[9px] text-white/60 group-hover:text-white/90">{point.label}</span>
            </button>
            {i < TIMELINE_POINTS.length - 1 ? (
              <div
                className="mx-0.5 h-px min-w-[6px] flex-1 sm:mx-1"
                style={{
                  background: `linear-gradient(to right, rgba(148,163,184,0.5), rgba(248,113,113,${0.25 + i * 0.08}))`,
                }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {tip ? (
        <div className="absolute bottom-8 left-1/2 z-[4] w-[min(94%,340px)] -translate-x-1/2 rounded-xl border border-white/15 bg-[#111118]/95 px-3 py-2.5 text-left shadow-lg backdrop-blur-sm">
          <p className="text-[11px] leading-snug text-white/90">{tip}</p>
          <button type="button" className="mt-2 text-[10px] text-white/50" onClick={() => setTip(null)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}

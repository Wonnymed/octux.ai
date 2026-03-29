'use client';

import { useState } from 'react';
import { R16 } from '@/lib/design/r16-colors';

const BLUE = R16.agent.sonnet;
const GREEN = R16.agent.haiku;

export function ComparePreview() {
  const [tip, setTip] = useState<string | null>(null);

  return (
    <div className="relative flex h-full min-h-[300px] w-full flex-col px-1">
      <p className="pointer-events-none absolute left-3 top-2 z-[3] rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
        ● Demo · Expert debate · 5 vs 5
      </p>

      <div className="relative mt-8 flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 opacity-100 sm:gap-2.5">
          <div className="mb-1 text-[11px] font-medium text-white/90">Option A: Shopify</div>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={`a-${i}`}
              type="button"
              onClick={() =>
                setTip(
                  `Option A — Dimension ${i}\nTime to launch: faster\nVendor lock-in: medium\nCustomization: theme-limited`,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border-2 shadow-sm transition-transform hover:scale-105"
              style={{
                borderColor: BLUE,
                backgroundColor: R16.agent.sonnetBg,
                boxShadow: `0 0 12px ${R16.agent.sonnetGlow}`,
              }}
            >
              <span className="text-[10px] font-semibold" style={{ color: BLUE }}>
                {i}
              </span>
            </button>
          ))}
        </div>

        <div
          className="w-px shrink-0 bg-gradient-to-b from-transparent via-white/30 to-transparent"
          aria-hidden
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-2 opacity-100 sm:gap-2.5">
          <div className="mb-1 text-[11px] font-medium text-white/90">Option B: Custom site</div>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={`b-${i}`}
              type="button"
              onClick={() =>
                setTip(
                  `Option B — Dimension ${i}\nControl: full\nUpfront cost: higher\nMaintenance: your team`,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border-2 shadow-sm transition-transform hover:scale-105"
              style={{
                borderColor: GREEN,
                backgroundColor: R16.agent.haikuBg,
                boxShadow: `0 0 12px ${R16.agent.haikuGlow}`,
              }}
            >
              <span className="text-[10px] font-semibold" style={{ color: GREEN }}>
                {i}
              </span>
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 text-[15px] font-bold text-white">
          VS
        </div>
      </div>

      <div className="relative z-[2] mt-3 flex gap-3 px-4 pb-2">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[10px] text-white/70">
            <span>A</span>
            <span className="font-semibold text-[#60a5fa]">62%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[62%] rounded-full bg-[#60a5fa]" />
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[10px] text-white/70">
            <span>B</span>
            <span className="font-semibold text-[#34d399]">38%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[38%] rounded-full bg-[#34d399]" />
          </div>
        </div>
      </div>

      {tip ? (
        <div className="absolute bottom-2 left-1/2 z-[4] w-[min(94%,300px)] -translate-x-1/2 rounded-lg border border-white/15 bg-[#111118]/95 px-3 py-2 text-[11px] text-white/90 shadow-lg backdrop-blur-sm">
          <p className="whitespace-pre-wrap">{tip}</p>
          <button type="button" className="mt-1 text-[10px] text-white/50" onClick={() => setTip(null)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}

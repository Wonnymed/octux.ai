'use client';

import { useState } from 'react';
import { R16 } from '@/lib/design/r16-colors';

const RISK_CATEGORIES = [
  'Financial',
  'Market',
  'Operational',
  'Competitive',
  'Regulatory',
  'Timing',
  'Team',
  'Execution',
  'Black swan',
] as const;

const VB = 380;
const CX = VB / 2;
const CY = VB / 2;
const R_OUT = 132;

function outerPos(i: number, n: number) {
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(angle) * R_OUT, y: CY + Math.sin(angle) * R_OUT };
}

export function StressPreview() {
  const n = RISK_CATEGORIES.length;
  const [tip, setTip] = useState<string | null>(null);

  return (
    <div className="relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden px-1">
      <p className="pointer-events-none absolute left-3 top-2 z-[4] rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
        ● Demo · Vulnerability audit · 4 critical found
      </p>

      <svg
        className="pointer-events-none absolute inset-0 z-[0] h-full w-full max-h-[400px] max-w-[400px] opacity-100"
        viewBox={`0 0 ${VB} ${VB}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {RISK_CATEGORIES.map((_, i) => {
          const p = outerPos(i, n);
          const critical = i < 4;
          return (
            <line
              key={`ln-${i}`}
              x1={p.x}
              y1={p.y}
              x2={CX}
              y2={CY}
              stroke={critical ? R16.verdict.abandon : 'rgba(248,113,113,0.25)'}
              strokeWidth={critical ? 1.2 : 0.6}
              strokeDasharray={critical ? '4 3' : '2 4'}
              opacity={0.9}
            />
          );
        })}
      </svg>

      <div className="relative z-[3] flex w-full max-w-[200px] flex-col items-center gap-2">
        <div
          className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-2xl border-2 shadow-[0_0_28px_rgba(52,211,153,0.25)]"
          style={{
            borderColor: R16.agent.haiku,
            background: 'rgba(52,211,153,0.1)',
          }}
        >
          <div className="text-[11px] font-semibold text-[#34d399]">Your plan</div>
          <div className="mt-2 h-2 w-[70%] overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[67%] rounded-full bg-[#34d399]" />
          </div>
          <div className="mt-1 text-[10px] text-white/80">67% shield</div>
        </div>
      </div>

      {RISK_CATEGORIES.map((cat, i) => {
        const { x, y } = outerPos(i, n);
        return (
          <div
            key={cat}
            className="absolute z-[2]"
            style={{
              left: `calc(50% + ${x - CX}px)`,
              top: `calc(50% + ${y - CY}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <button
              type="button"
              onClick={() =>
                setTip(
                  `${cat} Risk — ${i < 4 ? 'CRITICAL' : 'WATCH'}\n${
                    cat === 'Financial'
                      ? 'Break-even requires 340 customers/day. Seoul avg is 180.'
                      : 'Stress scenario exceeds tolerance in base case.'
                  }`,
                )
              }
              className="flex flex-col items-center opacity-100 transition-transform hover:scale-105"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg border-2"
                style={{
                  borderColor: R16.verdict.abandon,
                  background: 'rgba(248,113,113,0.12)',
                  boxShadow: '0 0 12px rgba(248,113,113,0.2)',
                }}
              >
                <span className="text-[11px]">⚔</span>
              </div>
              <span className="mt-0.5 max-w-[68px] whitespace-normal text-center text-[8px] font-medium leading-tight text-white/80">
                {cat}
              </span>
            </button>
          </div>
        );
      })}

      {tip ? (
        <div className="absolute bottom-10 left-1/2 z-[5] w-[min(92%,300px)] -translate-x-1/2 rounded-xl border border-white/15 bg-[#111118]/95 px-3 py-2.5 text-left shadow-xl backdrop-blur-sm">
          <p className="whitespace-pre-wrap text-[11px] leading-snug text-white/90">{tip}</p>
          <button
            type="button"
            className="mt-2 text-[10px] text-white/50"
            onClick={() => setTip(null)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}

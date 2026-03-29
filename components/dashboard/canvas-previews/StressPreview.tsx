'use client';

import { CANVAS } from '@/lib/canvas/palette';

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

const VB = 360;
const CX = VB / 2;
const CY = VB / 2;
const R_OUT = 132;

function outerPos(i: number, n: number) {
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(angle) * R_OUT, y: CY + Math.sin(angle) * R_OUT };
}

export function StressPreview() {
  const n = RISK_CATEGORIES.length;

  return (
    <div className="relative flex h-full min-h-[280px] w-full items-center justify-center overflow-hidden">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full max-h-[360px] max-w-[360px] opacity-[0.1]"
        viewBox={`0 0 ${VB} ${VB}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {RISK_CATEGORIES.map((_, i) => {
          const p = outerPos(i, n);
          return (
            <line
              key={`ln-${i}`}
              x1={p.x}
              y1={p.y}
              x2={CX}
              y2={CY}
              stroke={CANVAS.gold}
              strokeWidth={0.5}
              strokeDasharray="3 3"
            />
          );
        })}
      </svg>

      <div className="relative z-[2] flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-[#c9a96e]/15 bg-[#c9a96e]/[0.03]">
        <div className="text-center leading-tight">
          <div className="text-[11px] text-[#c9a96e]/35">Your</div>
          <div className="text-[11px] text-[#c9a96e]/35">plan</div>
        </div>
      </div>

      {RISK_CATEGORIES.map((cat, i) => {
        const { x, y } = outerPos(i, n);
        return (
          <div
            key={cat}
            className="absolute z-[1] flex flex-col items-center opacity-[0.22]"
            style={{
              left: `calc(50% + ${x - CX}px)`,
              top: `calc(50% + ${y - CY}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3a3a36] bg-[#1a1a18]">
              <span className="text-[8px] text-[#5a5a55]">⚔</span>
            </div>
            <span className="mt-0.5 max-w-[64px] whitespace-normal text-center text-[7px] leading-tight text-[#5a5a55]/55">
              {cat}
            </span>
          </div>
        );
      })}
    </div>
  );
}

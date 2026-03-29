'use client';

import { CANVAS } from '@/lib/canvas/palette';

const DEMO_SPECIALISTS = [
  { name: 'Market analyst' },
  { name: 'Finance expert' },
  { name: 'Operations' },
  { name: 'Legal advisor' },
  { name: 'Consumer insight' },
  { name: 'Competitor' },
  { name: 'Tech specialist' },
  { name: 'Industry veteran' },
  { name: 'You', isOperator: true },
] as const;

const VB = 360;
const CX = VB / 2;
const CY = VB / 2;
const R = 118;

function nodeCenter(i: number, n: number) {
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(angle) * R, y: CY + Math.sin(angle) * R };
}

export function SimulatePreview() {
  const n = DEMO_SPECIALISTS.length;

  return (
    <div className="relative flex h-full min-h-[280px] w-full items-center justify-center overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full max-h-[340px] max-w-[340px] opacity-[0.12]"
        viewBox={`0 0 ${VB} ${VB}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {DEMO_SPECIALISTS.map((_, i) => {
          const a = nodeCenter(i, n);
          const b = nodeCenter((i + 1) % n, n);
          return (
            <line
              key={`e-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={CANVAS.gold}
              strokeWidth={0.6}
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute left-1/2 top-[42%] z-[1] -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-[11px] text-[#8a8a82]">Your question</div>
        <div className="text-[10px] text-[#5a5a55]">appears here</div>
      </div>

      {DEMO_SPECIALISTS.map((spec, i) => {
        const { x, y } = nodeCenter(i, n);
        return (
          <div
            key={spec.name}
            className="absolute z-[2]"
            style={{
              left: `calc(50% + ${x - CX}px)`,
              top: `calc(50% + ${y - CY}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="flex flex-col items-center animate-node-float"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                spec.isOperator
                  ? 'border-[#c9a96e]/30 bg-[#c9a96e]/[0.06]'
                  : 'border-[#3a3a36] bg-[#1a1a18]'
              }`}
            >
              <span
                className={`text-[10px] ${
                  spec.isOperator ? 'text-[#c9a96e]/60' : 'text-[#5a5a55]'
                }`}
              >
                {spec.isOperator ? '★' : i + 1}
              </span>
            </div>
            <span className="mt-1 max-w-[72px] whitespace-normal text-center text-[8px] leading-tight text-[#5a5a55]/60">
              {spec.name}
            </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

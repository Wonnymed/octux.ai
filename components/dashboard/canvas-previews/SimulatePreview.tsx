'use client';

import { useState, useCallback } from 'react';
import { R16 } from '@/lib/design/r16-colors';

const VB = 380;
const CX = VB / 2;
const CY = VB / 2;
const R_RING = 118;
const R_PARTICLE = 158;

type RingNode = {
  readonly name: string;
  readonly role: 'specialist' | 'operator';
  readonly tooltip: string;
};

const RING: readonly RingNode[] = [
  {
    name: 'Market analyst',
    role: 'specialist',
    tooltip:
      'Kim Jihye — Market Analyst\nPosition: PROCEED (8.2/10)\n“Gangnam foot traffic supports ₩15M+ monthly revenue.”',
  },
  {
    name: 'Finance',
    role: 'specialist',
    tooltip:
      'Park Minsoo — Finance\nPosition: PROCEED (7.4/10)\n“Unit economics clear at 180 covers/day.”',
  },
  {
    name: 'Operations',
    role: 'specialist',
    tooltip: 'Lee Sora — Operations\nPosition: DELAY (6.1/10)\n“Staffing model needs one more FTE peak.”',
  },
  {
    name: 'Legal',
    role: 'specialist',
    tooltip: 'Choi Han — Legal\nPosition: PROCEED (7.9/10)\n“Lease terms are standard for the district.”',
  },
  {
    name: 'Consumer',
    role: 'specialist',
    tooltip: 'Jung Ara — Consumer insight\nPosition: PROCEED (8.0/10)\n“Local demand for specialty coffee is up YoY.”',
  },
  {
    name: 'Competitor',
    role: 'specialist',
    tooltip: 'Kim Ray — Competitor\nPosition: DELAY (5.8/10)\n“Three chains entered; differentiation is critical.”',
  },
  {
    name: 'Tech',
    role: 'specialist',
    tooltip: 'Oh Jin — Tech\nPosition: PROCEED (7.2/10)\n“POS + loyalty stack is off-the-shelf.”',
  },
  {
    name: 'Industry',
    role: 'specialist',
    tooltip: 'Yoon Tae — Industry veteran\nPosition: PROCEED (7.6/10)\n“Margins align with Seoul indie café benchmarks.”',
  },
  { name: 'You', role: 'operator', tooltip: 'Your position — Operator\nYou set constraints and break ties.' },
];

function ringPos(i: number, n: number) {
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(angle) * R_RING, y: CY + Math.sin(angle) * R_RING };
}

function particlePos(i: number, n: number) {
  const angle = (i / n) * Math.PI * 2 + 0.4;
  return { x: CX + Math.cos(angle) * R_PARTICLE, y: CY + Math.sin(angle) * R_PARTICLE };
}

export function SimulatePreview() {
  const n = RING.length;
  const [tip, setTip] = useState<string | null>(null);

  const onNodeClick = useCallback((t: string) => {
    setTip((prev) => (prev === t ? null : t));
  }, []);

  return (
    <div className="relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden px-1">
      <p className="pointer-events-none absolute left-3 top-2 z-[4] rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
        ● Demo · 10 specialists · 72 voices
      </p>

      <svg
        className="absolute inset-0 z-[0] h-full w-full max-h-[400px] max-w-[400px] opacity-100"
        viewBox={`0 0 ${VB} ${VB}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {RING.map((_, i) => {
          const a = ringPos(i, n);
          const b = ringPos((i + 1) % n, n);
          const agree = i % 2 === 0;
          return (
            <line
              key={`e-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={agree ? R16.verdict.proceed : R16.verdict.abandon}
              strokeWidth={1.2}
              opacity={0.85}
            />
          );
        })}
        {RING.map((_, i) => {
          const p = ringPos(i, n);
          return (
            <line
              key={`c-${i}`}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={0.7}
            />
          );
        })}
        {Array.from({ length: 48 }).map((_, i) => {
          const p = particlePos(i, 48);
          return (
            <circle
              key={`p-${i}`}
              cx={p.x}
              cy={p.y}
              r={1.4 + (i % 3) * 0.4}
              fill={R16.agent.haiku}
              opacity={0.75 + (i % 5) * 0.05}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          );
        })}
      </svg>

      <button
        type="button"
        className="absolute left-1/2 top-[46%] z-[3] -translate-x-1/2 -translate-y-1/2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        onClick={() => onNodeClick('Chief — Decision chair\nOrchestrates debate.\nConsensus leaning PROCEED.')}
      >
        <div
          className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-2xl border-2 shadow-[0_0_24px_rgba(167,139,250,0.35)]"
          style={{
            borderColor: R16.agent.opus,
            background: R16.agent.opusBg,
          }}
        >
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#a78bfa]">Chief</span>
          <span className="text-[18px] font-bold leading-none text-white">72%</span>
        </div>
        <span className="mt-1 block text-[9px] font-medium text-white/80">PROCEED</span>
      </button>

      {RING.map((spec, i) => {
        const { x, y } = ringPos(i, n);
        const isOp = spec.role === 'operator';
        const border = isOp ? R16.agent.operator : R16.agent.sonnet;
        const bg = isOp ? 'rgba(255,255,255,0.08)' : R16.agent.sonnetBg;
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
            <button
              type="button"
              onClick={() => onNodeClick(spec.tooltip)}
              className="group flex flex-col items-center rounded-lg p-0.5 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 shadow-sm transition-shadow group-hover:shadow-[0_0_16px_rgba(96,165,250,0.35)]"
                style={{ borderColor: border, backgroundColor: bg }}
              >
                <span
                  className={`text-[10px] font-semibold ${isOp ? 'text-white' : 'text-[#60a5fa]'}`}
                >
                  {isOp ? '★' : i + 1}
                </span>
              </div>
              <span className="mt-1 max-w-[76px] whitespace-normal text-center text-[8px] font-medium leading-tight text-white/70 group-hover:text-white">
                {spec.name}
              </span>
            </button>
          </div>
        );
      })}

      {tip ? (
        <div className="absolute bottom-10 left-1/2 z-[5] w-[min(92%,320px)] -translate-x-1/2 rounded-xl border border-white/15 bg-[#111118]/95 px-3 py-2.5 text-left shadow-xl backdrop-blur-sm">
          <p className="whitespace-pre-wrap text-[11px] leading-snug text-white/90">{tip}</p>
          <button
            type="button"
            className="mt-2 text-[10px] text-white/50 underline-offset-2 hover:text-white/80"
            onClick={() => setTip(null)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}

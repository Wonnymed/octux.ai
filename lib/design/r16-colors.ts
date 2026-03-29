/**
 * R16 — Dark canvas + vivid white UI + colorful agents (Bloomberg × mission control).
 * Use for Tailwind arbitrary values and canvas; semantic CSS vars remain in globals.css.
 */

export const R16 = {
  bg: {
    primary: '#0a0a0f',
    sidebar: '#0d0d14',
    surface: '#111118',
    hover: '#1a1a24',
  },
  white: {
    full: '#ffffff',
    a90: 'rgba(255,255,255,0.9)',
    a60: 'rgba(255,255,255,0.6)',
    a40: 'rgba(255,255,255,0.4)',
    a20: 'rgba(255,255,255,0.2)',
    a08: 'rgba(255,255,255,0.08)',
    a04: 'rgba(255,255,255,0.04)',
  },
  agent: {
    opus: '#a78bfa',
    opusGlow: 'rgba(167,139,250,0.15)',
    opusBg: 'rgba(167,139,250,0.08)',
    sonnet: '#60a5fa',
    sonnetGlow: 'rgba(96,165,250,0.15)',
    sonnetBg: 'rgba(96,165,250,0.08)',
    haiku: '#34d399',
    haikuGlow: 'rgba(52,211,153,0.15)',
    haikuBg: 'rgba(52,211,153,0.08)',
    operator: '#ffffff',
  },
  verdict: {
    proceed: '#4ade80',
    delay: '#fbbf24',
    abandon: '#f87171',
    neutral: '#94a3b8',
  },
  mode: {
    simulate: '#e8593c',
    compare: '#60a5fa',
    stress: '#f87171',
    premortem: '#fbbf24',
  },
  cta: {
    bg: '#ffffff',
    text: '#0a0a0f',
    hover: '#e5e5e5',
  },
} as const;

export type DashboardModeKey = 'simulate' | 'compare' | 'stress' | 'premortem';

export const MODE_ACCENTS: Record<
  DashboardModeKey,
  { color: string; bg: string; border: string }
> = {
  simulate: {
    color: R16.mode.simulate,
    bg: 'rgba(232,89,60,0.1)',
    border: 'rgba(232,89,60,0.2)',
  },
  compare: {
    color: R16.mode.compare,
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.2)',
  },
  stress: {
    color: R16.mode.stress,
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.2)',
  },
  premortem: {
    color: R16.mode.premortem,
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.2)',
  },
};

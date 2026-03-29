/**
 * Design Token Exports — TypeScript access to design system values.
 * Use for: Framer Motion, dynamic styles, agent color lookups.
 * NEVER for static styling — use Tailwind classes instead.
 */

import { getAgentMonoGradient, AGENT_PALETTE, CANVAS } from '@/lib/canvas/palette';

export { AGENT_PALETTE, CANVAS, getAgentMonoGradient };

export const transitions = {
  fast: { duration: 0.1, ease: 'easeOut' },
  normal: { duration: 0.15, ease: 'easeOut' },
  slow: { duration: 0.25, ease: 'easeOut' },
  entity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  takeover: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  spring: { type: 'spring' as const, stiffness: 400, damping: 25 },
  springGentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
} as const;

export const stagger = {
  fast: { staggerChildren: 0.03 },
  normal: { staggerChildren: 0.05 },
  slow: { staggerChildren: 0.08 },
  agents: { staggerChildren: 0.12 },
} as const;

export const verdictColors = {
  proceed: { solid: '#4ade80', muted: 'rgba(74, 222, 128, 0.14)' },
  delay: { solid: '#fbbf24', muted: 'rgba(251, 191, 36, 0.14)' },
  abandon: { solid: '#f87171', muted: 'rgba(248, 113, 113, 0.14)' },
} as const;
export type VerdictType = keyof typeof verdictColors;

export const verdictLabels: Record<VerdictType, string> = {
  proceed: 'PROCEED',
  delay: 'DELAY',
  abandon: 'ABANDON',
};

export const gradeColors: Record<string, string> = {
  'A+': '#a78bfa',
  'A': '#a78bfa',
  'A-': '#a78bfa',
  'B+': '#c0c0b8',
  'B': '#c0c0b8',
  'B-': '#c0c0b8',
  'C+': '#8a8a82',
  'C': '#8a8a82',
  'C-': '#8a8a82',
  'D+': '#5a5a55',
  'D': '#5a5a55',
  'D-': '#5a5a55',
  'F': '#f87171',
};

/** Neutral palette — category is ignored for hue. */
export const categoryColors = {
  investment: '#8a8a82',
  relationships: '#8a8a82',
  career: '#8a8a82',
  business: '#8a8a82',
  life: '#8a8a82',
} as const;
export type CategoryType = keyof typeof categoryColors;

/** Grayscale fills for legacy callers; prefer `getAgentMonoGradient` for avatars. */
export const agentPalettes: Record<CategoryType, string[]> = {
  investment: ['#3a3a36', '#424240', '#4a4a48', '#525250', '#5a5a58', '#626260', '#6a6a68', '#727270', '#7a7a78'],
  relationships: ['#3a3a36', '#424240', '#4a4a48', '#525250', '#5a5a58', '#626260', '#6a6a68', '#727270', '#7a7a78'],
  career: ['#3a3a36', '#424240', '#4a4a48', '#525250', '#5a5a58', '#626260', '#6a6a68', '#727270', '#7a7a78'],
  business: ['#3a3a36', '#424240', '#4a4a48', '#525250', '#5a5a58', '#626260', '#6a6a68', '#727270', '#7a7a78'],
  life: ['#3a3a36', '#424240', '#4a4a48', '#525250', '#5a5a58', '#626260', '#6a6a68', '#727270', '#7a7a78'],
};

export function getAgentColor(category: CategoryType, index: number): string {
  const palette = agentPalettes[category] || agentPalettes.life;
  return palette[index % palette.length];
}

/**
 * Command palette / category dots — neutral gray or blue tint by slot.
 * Optional `slot` alternates accent vs neutral for visual rhythm.
 */
export function getCategoryColor(category: string, slot = 0): string {
  void category;
  return slot % 2 === 0 ? '#8a8a82' : '#60a5fa';
}

export const entityStates = {
  dormant: { scale: 1, opacity: 0.6, glow: 'rgba(255, 255, 255, 0.06)', breatheDuration: 4 },
  active: { scale: 1.05, opacity: 0.8, glow: 'rgba(96, 165, 250, 0.2)', breatheDuration: 2 },
  engaged: { scale: 1.5, opacity: 1, glow: 'rgba(167, 139, 250, 0.35)', breatheDuration: 1.5 },
  maximum: { scale: 2, opacity: 1, glow: 'rgba(167, 139, 250, 0.45)', breatheDuration: 0.8 },
} as const;
export type EntityState = keyof typeof entityStates;

export const tierConfig = {
  free: { label: 'Free', color: 'rgba(255,255,255,0.40)', badgeClass: 'oct-badge-free' },
  pro: { label: 'Pro', color: '#a78bfa', badgeClass: 'oct-badge-pro' },
  max: { label: 'Max', color: '#34d399', badgeClass: 'oct-badge-max' },
  kraken: { label: 'Kraken', color: '#60a5fa', badgeClass: 'oct-badge-kraken' },
} as const;

export const layout = {
  sidebarCollapsed: 56, sidebarExpanded: 260, chatMaxWidth: 768, headerHeight: 48,
  agentCardMinHeight: 120, verdictCardMinHeight: 200,
} as const;

export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;

// ═══ CONFIDENCE HELPERS ═══

export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 75) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 75) return '#f5f5f0';
  if (confidence >= 50) return '#c0c0b8';
  return '#8a8a82';
}

/** @deprecated Prefer `getAgentMonoGradient(agentId, index)` for chair/operator/specialist distinction. */
export const AGENT_GRADIENTS: readonly (readonly [string, string])[] = Array.from({ length: 10 }, (_, i) => {
  const g = getAgentMonoGradient('specialist', i);
  return [g[0], g[1]] as const;
});

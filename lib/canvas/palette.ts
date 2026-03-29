/**
 * Canvas + agent colors — R16: vivid tiers (Opus / Sonnet / Haiku) + verdict palette.
 */
import { R16 } from '@/lib/design/r16-colors';

export const CANVAS = {
  /** @deprecated use tier colors */
  gold: R16.agent.sonnet,
  goldRgb: '96, 165, 250',
  bright: '#ffffff',
  dim: 'rgba(255,255,255,0.4)',
  darkLine: 'rgba(255,255,255,0.08)',
  surface: '#111118',
  bg: '#0a0a0f',
  track: '#1a1a24',
  glow: R16.agent.sonnetGlow,
  glowStrong: 'rgba(96, 165, 250, 0.22)',
  positive: R16.verdict.proceed,
  negative: R16.verdict.abandon,
  opus: R16.agent.opus,
  sonnet: R16.agent.sonnet,
  haiku: R16.agent.haiku,
} as const;

export type AgentNodeStyle = {
  border: string;
  bg: string;
  text: string;
  dot: string;
};

export const AGENT_PALETTE = {
  operator: {
    border: 'rgba(255,255,255,0.35)',
    bg: 'rgba(255,255,255,0.08)',
    text: R16.agent.operator,
    dot: R16.agent.operator,
  } satisfies AgentNodeStyle,

  chief: {
    border: 'rgba(167,139,250,0.55)',
    bg: R16.agent.opusBg,
    text: R16.agent.opus,
    dot: R16.agent.opus,
  } satisfies AgentNodeStyle,

  specialist(index: number): AgentNodeStyle {
    void index;
    return {
      border: 'rgba(96,165,250,0.45)',
      bg: R16.agent.sonnetBg,
      text: R16.agent.sonnet,
      dot: R16.agent.sonnet,
    };
  },

  teamA(index: number): AgentNodeStyle {
    const alpha = Math.max(0.25, 0.75 - index * 0.1);
    return {
      border: `rgba(96,165,250,${alpha * 0.35})`,
      bg: 'rgba(96,165,250,0.06)',
      text: `rgba(96,165,250,${alpha})`,
      dot: `rgba(96,165,250,${alpha})`,
    };
  },

  teamB(index: number): AgentNodeStyle {
    const alpha = Math.max(0.25, 0.75 - index * 0.1);
    return {
      border: `rgba(52,211,153,${alpha * 0.35})`,
      bg: 'rgba(52,211,153,0.06)',
      text: `rgba(52,211,153,${alpha})`,
      dot: `rgba(52,211,153,${alpha})`,
    };
  },
} as const;

/** Tier-based fills for canvas nodes */
export function getAgentMonoGradient(agentId: string, index: number): readonly [string, string] {
  if (agentId === 'decision_chair') {
    return ['rgba(167,139,250,0.45)', 'rgba(167,139,250,0.12)'];
  }
  if (agentId.startsWith('self_')) {
    return ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.1)'];
  }
  const t = Math.max(0.15, 0.42 - (index % 9) * 0.03);
  const t2 = Math.max(0.06, t * 0.45);
  return [`rgba(96,165,250,${t})`, `rgba(96,165,250,${t2})`];
}

import type { OperatorProfile } from '@/lib/operator/types';

/** Modes the Chief understands (aligned with billing sim modes). */
export type ChiefSimulationMode = 'simulate' | 'compare' | 'stress_test' | 'premortem';

export type ChiefTier = 'specialist' | 'swarm';

export interface SpecialistPlan {
  id: string;
  name: string;
  role: string;
  expertise: string;
  bias: string;
  personality: string;
  /** Sample sentence showing how they talk */
  speaking_style: string;
  task: string;
  team?: 'A' | 'B';
}

export interface OperatorAgentPlan {
  id: string;
  name: string;
  role: string;
  perspective: string;
  constraints: string;
  speaking_style: string;
  task?: string;
}

export interface CrowdSegment {
  /** Segment label / demographic description */
  segment: string;
  count: number;
  behavior: string;
  income_level?: string;
  context: string;
  sample_voice: string;
}

export interface SpecialistChiefDesign {
  kind: 'specialist';
  specialists: SpecialistPlan[];
  operator: OperatorAgentPlan | null;
}

export interface SwarmChiefDesign {
  kind: 'swarm';
  segments: CrowdSegment[];
  /** Compare swarm: optional split */
  segments_a?: CrowdSegment[];
  segments_b?: CrowdSegment[];
}

export type SimulationDesign = SpecialistChiefDesign | SwarmChiefDesign;

export type { OperatorProfile };

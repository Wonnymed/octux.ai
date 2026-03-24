/* ═══════════════════════════════════════
   Octux AI — Simulation Types
   ═══════════════════════════════════════ */

export type SimulationPhase =
  | "planning"
  | "opening"
  | "quick_takes"
  | "adversarial"
  | "convergence"
  | "verdict";

export type Position = "proceed" | "proceed_with_conditions" | "delay" | "abandon";

export type Citation = {
  id: number;
  agent_id?: string;
  agent_name: string;
  round?: number;
  claim: string;
  confidence: number;
};

export type DecisionObject = {
  recommendation: Position;
  probability: number;
  main_risk: string;
  leverage_point: string;
  next_action: string;
  grade: string;
  grade_score: number;
  citations: Citation[];
};

export type AgentReport = {
  agent_id: string;
  agent_name: string;
  position: "proceed" | "delay" | "abandon";
  confidence: number;
  key_argument: string;
  evidence?: string[];
  risks_identified?: string[];
  recommendation?: string;
  changed_mind?: boolean;
  change_reason?: string;
};

export type SimulationPlanTask = {
  description: string;
  agent?: string;
  assigned_agent?: string;
};

export type SimulationPlan = {
  tasks: SimulationPlanTask[];
  estimated_rounds?: number;
  estimated_duration_seconds?: number;
};

export type ConsensusState = {
  proceed: number;
  delay: number;
  abandon: number;
  avg_confidence: number;
};

/* ═══ SSE Event Types ═══ */

export type SimulationSSE =
  | { event: "phase_start"; data: { phase: SimulationPhase; status: string } }
  | { event: "round_start"; data: { round: number; title: string; description: string; total_rounds: number } }
  | { event: "round_complete"; data: { round: number } }
  | { event: "plan_complete"; data: SimulationPlan }
  | { event: "agent_complete"; data: AgentReport }
  | { event: "consensus_update"; data: ConsensusState }
  | { event: "verdict_artifact"; data: DecisionObject }
  | { event: "followup_suggestions"; data: string[] }
  | { event: "crowd_personas"; data: any[] }
  | { event: "field_scan"; data: any }
  | { event: "audit_complete"; data: any }
  | { event: "citations_enriched"; data: any[] }
  | { event: "agent_scores"; data: any[] }
  | { event: "verdict_critique"; data: any }
  | { event: "ledger_update"; data: any }
  | { event: "stall_replan"; data: any }
  | { event: "delegation"; data: any }
  | { event: "counter_factual"; data: any }
  | { event: "blind_spots"; data: any }
  | { event: "evaluation"; data: any }
  | { event: "state_summary"; data: any }
  | { event: "error"; data: { message: string } }
  | { event: "complete"; data: { simulation_id: string } };

/* ═══ Request / Response ═══ */

export type SimulationRequest = {
  question: string;
  engine: string;
  userId?: string;
  tier?: string;
};

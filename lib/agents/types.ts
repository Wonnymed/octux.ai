import type {
  CompareVerdictData,
  PremortemFailureAnalysis,
  StressVerdictData,
} from '@/lib/simulation/mode-verdict';

export type AgentId =
  | 'decision_chair'
  | 'chief_operator'
  | 'base_rate_archivist'
  | 'demand_signal_analyst'
  | 'unit_economics_auditor'
  | 'regulatory_gatekeeper'
  | 'competitive_intel'
  | 'execution_operator'
  | 'capital_allocator'
  | 'scenario_planner'
  | 'intervention_optimizer'
  | 'customer_reality';

export type AgentConfig = {
  id: AgentId;
  name: string;
  role: string;
  icon: string;
  color: string;
  goal: string;
  backstory: string;
  constraints: string[];
  sop: string[];
  systemPrompt: string;
};

export type AgentReport = {
  agent_id: AgentId;
  agent_name: string;
  position: 'proceed' | 'delay' | 'abandon';
  confidence: number;
  key_argument: string;
  evidence: string[];
  risks_identified: string[];
  recommendation: string;
};

export type SimulationPlan = {
  tasks: { description: string; assigned_agent: AgentId }[];
  estimated_rounds: number;
};

export type DecisionObject = {
  recommendation: 'proceed' | 'proceed_with_conditions' | 'delay' | 'abandon';
  probability: number;
  main_risk: string;
  leverage_point: string;
  next_action: string;
  grade: string;
  grade_score: number;
  citations: Citation[];
  /** User-facing headline (compare / stress / premortem / standard). */
  one_liner?: string;
  compare_data?: CompareVerdictData;
  stress_data?: StressVerdictData;
  failure_analysis?: PremortemFailureAnalysis;
  /** Mode-specific extras (risk matrix, action plan, god view, sources). */
  risk_matrix?: unknown;
  action_plan?: unknown;
  god_view?: unknown;
  sources?: unknown;
};

export type Citation = {
  id: number;
  agent_id: AgentId;
  agent_name: string;
  claim: string;
  confidence: number;
};

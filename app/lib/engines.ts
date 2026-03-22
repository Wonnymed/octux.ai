import type { Mode } from "./types";

/** Signux accent gold — used for Home, brand elements, NOT engines */
export const SIGNUX_GOLD = "#C8A84E";

export const ENGINES = {
  simulate: {
    id: "simulate",
    name: "Simulate",
    subtitle: "Pressure-test a decision before you commit.",
    question: "Should I do this?",
    cta: "Run Simulation",
    placeholder: "Describe the decision you want to pressure-test...",
    icon: "Zap",
    color: "#3B82F6",
    chips: ["10 expert agents", "10 structured rounds", "Success probability", "Key disagreement", "Best next action"],
    intro: {
      features: ["10 specialist agents", "10 adversarial rounds", "Decision-ready output"],
      micro: "100 perspectives. Under 60 seconds.",
    },
  },
  build: {
    id: "build",
    name: "Build",
    subtitle: "Turn an idea into an executable plan.",
    question: "How do I build this?",
    cta: "Build Plan",
    placeholder: "Describe what you want to build, launch, or execute...",
    icon: "Hammer",
    color: "#10B981",
    chips: ["Execution roadmap", "30/60/90-day plan", "Bottleneck detection", "Resource sequencing", "Fastest path to proof"],
    intro: {
      features: ["30/60/90-day roadmap", "Bottleneck detection", "Fastest path to proof"],
      micro: "From idea to action. One conversation.",
    },
  },
  grow: {
    id: "grow",
    name: "Grow",
    subtitle: "Find the fastest path to better revenue.",
    question: "How do I grow this?",
    cta: "Find Growth Levers",
    placeholder: "Describe the business, current traction, and growth challenge...",
    icon: "TrendingUp",
    color: "#8B5CF6",
    chips: ["Growth levers", "Revenue bottlenecks", "Channel prioritization", "Pricing opportunities", "Experiment roadmap"],
    intro: {
      features: ["Ranked growth levers", "Channel prioritization", "Experiment roadmap"],
      micro: "Know exactly what to test first.",
    },
  },
  hire: {
    id: "hire",
    name: "Hire",
    subtitle: "Decide who to hire, and when.",
    question: "Should I hire this person or role now?",
    cta: "Evaluate Hire",
    placeholder: "Paste the role, candidate, or hiring decision you want to assess...",
    icon: "UserCheck",
    color: "#F59E0B",
    chips: ["Candidate-role fit", "Red flag detection", "Timing of hire", "ROI of the role", "Interview focus points"],
    intro: {
      features: ["Candidate-role fit score", "Red flag detection", "Interview focus points"],
      micro: "Bad hires cost $50K\u2013$500K. Evaluate first.",
    },
  },
  protect: {
    id: "protect",
    name: "Protect",
    subtitle: "Find what could break the business next.",
    question: "What could kill this?",
    cta: "Scan Risks",
    placeholder: "Describe the business, decision, or operation you want to stress-test...",
    icon: "Shield",
    color: "#EF4444",
    chips: ["Threat scan", "Downside mapping", "Compliance exposure", "Fragility detection", "Mitigation actions"],
    intro: {
      features: ["Threat scan", "Risk matrix", "Mitigation actions"],
      micro: "See threats before they hit.",
    },
  },
  compete: {
    id: "compete",
    name: "Compete",
    subtitle: "See how rivals move, and where you can win.",
    question: "How do I beat this market?",
    cta: "Map Competitors",
    placeholder: "Describe your market, competitors, and the position you want to win...",
    icon: "Swords",
    color: "#F97316",
    chips: ["Competitor mapping", "Response simulation", "Weakness detection", "Positioning gaps", "Counter-move strategy"],
    intro: {
      features: ["Competitor mapping", "Response simulation", "Positioning gaps"],
      micro: "Simulate their next move.",
    },
  },
} as const;

export type EngineId = keyof typeof ENGINES;
export type EngineConfig = (typeof ENGINES)[EngineId];

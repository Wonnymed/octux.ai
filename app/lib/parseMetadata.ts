export interface SukgoVerification {
  confidence: number;
  checked: string[];
  caveats: string[];
}

export interface SukgoWorklogStep {
  action: string;
  detail: string;
}

export interface SukgoWorklog {
  steps: SukgoWorklogStep[];
  sources_count: number;
  domains_used: number;
  reasoning_steps: number;
}

export type BlindSpot = { domain: string; question: string; why: string };

export interface SukgoVoteDisenter {
  role: string;
  vote: string;
  reason: string;
}

export interface SukgoVote {
  go: number;
  caution: number;
  stop: number;
  total: number;
  result: string;
  confidence_avg: number;
  dissenters: SukgoVoteDisenter[];
}

export type SukgoSentiment = {
  signal: "bullish" | "bearish" | "neutral" | "mixed";
  confidence: number;
  reason: string;
};

export type SukgoSource = {
  title: string;
  url?: string;
  type: "web" | "kb" | "framework" | "data";
  relevance: string;
};

export type SukgoFollowup = {
  question: string;
  why: string;
};

export type SukgoTimelineEvent = {
  period: string;
  event: string;
  impact: string;
  probability?: number;
};

export type SukgoCompetitive = {
  competitor: string;
  threat_level: string;
  signals: string[];
  recommended_actions: string[];
};

export type SukgoKnowledgeGraph = {
  nodes: Array<{ id: string; label: string; weight: number }>;
  edges: Array<{ from: string; to: string; label: string }>;
};

export type SukgoFinancials = {
  data_points: Array<{ metric: string; value: string; source: string; confidence: string }>;
  recommended_sources: string[];
};

export type SukgoParallel = {
  universes: Array<{ id: string; name: string; probability: number; revenue: string; outcome: string }>;
};

export type SukgoMarket = {
  country: string;
  risk_level: string;
  ease_of_entry: number;
  market_size: string;
};

export type SukgoInvestment = {
  verdict: string;
  confidence: number;
  roi_expected: string;
  risk_score: number;
  payback_months: number;
};

export interface SukgoMetadata {
  domains: string[];
  domainCount: number;
  blindspots: BlindSpot[];
  depth: number;
  verification: SukgoVerification | null;
  worklog: SukgoWorklog | null;
  vote: SukgoVote | null;
  sentiment: SukgoSentiment | null;
  sources: SukgoSource[];
  followups: SukgoFollowup[];
  timeline: SukgoTimelineEvent[];
  competitive: SukgoCompetitive | null;
  workflow: string[];
  knowledgeGraph: SukgoKnowledgeGraph | null;
  financials: SukgoFinancials | null;
  parallel: SukgoParallel | null;
  market: SukgoMarket | null;
  investment: SukgoInvestment | null;
}

export function parseSukgoMetadata(content: string): { cleanContent: string; metadata: SukgoMetadata } {
  let clean = content;

  // Parse domains
  const domainMatch = clean.match(/<!--\s*sukgo_domains:\s*(.+?)\s*-->/);
  const domains = domainMatch ? domainMatch[1].split(",").map(d => d.trim()).filter(Boolean) : [];
  clean = clean.replace(/<!--\s*sukgo_domains:\s*.+?\s*-->/g, "");

  // Parse domain count
  const countMatch = clean.match(/<!--\s*sukgo_domain_count:\s*(\d+)\s*-->/);
  const domainCount = countMatch ? parseInt(countMatch[1], 10) : domains.length;
  clean = clean.replace(/<!--\s*sukgo_domain_count:\s*\d+\s*-->/g, "");

  // Parse blindspots
  const blindspotMatch = clean.match(/<!--\s*sukgo_blindspots:\s*(\[[\s\S]*?\])\s*-->/);
  let blindspots: BlindSpot[] = [];
  try { if (blindspotMatch) blindspots = JSON.parse(blindspotMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_blindspots:\s*\[[\s\S]*?\]\s*-->/g, "");

  // Parse depth
  const depthMatch = clean.match(/<!--\s*sukgo_depth:\s*(\d+)\s*-->/);
  const depth = depthMatch ? parseInt(depthMatch[1], 10) : 0;
  clean = clean.replace(/<!--\s*sukgo_depth:\s*\d+\s*-->/g, "");

  // Parse verification
  const verifyMatch = clean.match(/<!--\s*sukgo_verification:\s*(\{[\s\S]*?\})\s*-->/);
  let verification: SukgoVerification | null = null;
  try { if (verifyMatch) verification = JSON.parse(verifyMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_verification:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse worklog
  const worklogMatch = clean.match(/<!--\s*sukgo_worklog:\s*(\{[\s\S]*?\})\s*-->/);
  let worklog: SukgoWorklog | null = null;
  try { if (worklogMatch) worklog = JSON.parse(worklogMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_worklog:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse vote
  const voteMatch = clean.match(/<!--\s*sukgo_vote:\s*(\{[\s\S]*?\})\s*-->/);
  let vote: SukgoVote | null = null;
  try { if (voteMatch) vote = JSON.parse(voteMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_vote:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse sentiment
  const sentimentMatch = clean.match(/<!--\s*sukgo_sentiment:\s*(\{[\s\S]*?\})\s*-->/);
  let sentiment: SukgoSentiment | null = null;
  try { if (sentimentMatch) sentiment = JSON.parse(sentimentMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_sentiment:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse sources
  const sourcesMatch = clean.match(/<!--\s*sukgo_sources:\s*(\[[\s\S]*?\])\s*-->/);
  let sources: SukgoSource[] = [];
  try { if (sourcesMatch) sources = JSON.parse(sourcesMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_sources:\s*\[[\s\S]*?\]\s*-->/g, "");

  // Parse followups
  const followupsMatch = clean.match(/<!--\s*sukgo_followups:\s*(\[[\s\S]*?\])\s*-->/);
  let followups: SukgoFollowup[] = [];
  try { if (followupsMatch) followups = JSON.parse(followupsMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_followups:\s*\[[\s\S]*?\]\s*-->/g, "");

  // Parse timeline
  const timelineMatch = clean.match(/<!--\s*sukgo_timeline:\s*(\[[\s\S]*?\])\s*-->/);
  let timeline: SukgoTimelineEvent[] = [];
  try { if (timelineMatch) timeline = JSON.parse(timelineMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_timeline:\s*\[[\s\S]*?\]\s*-->/g, "");

  // Parse competitive intel
  const competitiveMatch = clean.match(/<!--\s*sukgo_competitive:\s*(\{[\s\S]*?\})\s*-->/);
  let competitive: SukgoCompetitive | null = null;
  try { if (competitiveMatch) competitive = JSON.parse(competitiveMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_competitive:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse workflow
  const workflowMatch = clean.match(/<!--\s*sukgo_workflow:\s*(\[[\s\S]*?\])\s*-->/);
  let workflow: string[] = [];
  try { if (workflowMatch) workflow = JSON.parse(workflowMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_workflow:\s*\[[\s\S]*?\]\s*-->/g, "");

  // Parse knowledge graph
  const kgMatch = clean.match(/<!--\s*sukgo_knowledge_graph:\s*(\{[\s\S]*?\})\s*-->/);
  let knowledgeGraph: SukgoKnowledgeGraph | null = null;
  try { if (kgMatch) knowledgeGraph = JSON.parse(kgMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_knowledge_graph:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse financials
  const financialsMatch = clean.match(/<!--\s*sukgo_financials:\s*(\{[\s\S]*?\})\s*-->/);
  let financials: SukgoFinancials | null = null;
  try { if (financialsMatch) financials = JSON.parse(financialsMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_financials:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse parallel futures
  const parallelMatch = clean.match(/<!--\s*sukgo_parallel:\s*(\{[\s\S]*?\})\s*-->/);
  let parallel: SukgoParallel | null = null;
  try { if (parallelMatch) parallel = JSON.parse(parallelMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_parallel:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse market (Global Ops)
  const marketMatch = clean.match(/<!--\s*sukgo_market:\s*(\{[\s\S]*?\})\s*-->/);
  let market: SukgoMarket | null = null;
  try { if (marketMatch) market = JSON.parse(marketMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_market:\s*\{[\s\S]*?\}\s*-->/g, "");

  // Parse investment (Invest)
  const investmentMatch = clean.match(/<!--\s*sukgo_investment:\s*(\{[\s\S]*?\})\s*-->/);
  let investment: SukgoInvestment | null = null;
  try { if (investmentMatch) investment = JSON.parse(investmentMatch[1]); } catch {}
  clean = clean.replace(/<!--\s*sukgo_investment:\s*\{[\s\S]*?\}\s*-->/g, "");

  return {
    cleanContent: clean.trim(),
    metadata: { domains, domainCount, blindspots, depth, verification, worklog, vote, sentiment, sources, followups, timeline, competitive, workflow, knowledgeGraph, financials, parallel, market, investment },
  };
}

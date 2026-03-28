/**
 * Business Simulation Engine — 30 specialist agents (3 categories × 10 agents).
 * Per simulation: up to 10 agents selected from relevant categories (see library.suggestAgentsForDomain).
 */

export type AgentDomain = 'investment' | 'career' | 'business';

/** Okara-style muted category dots (light; dark uses CSS vars where applicable) */
export const DOMAIN_COLORS: Record<AgentDomain, string> = {
  career: '#6b8b7a',
  business: '#7a8b9b',
  investment: '#8b8068',
};

export const DOMAIN_LABELS: Record<AgentDomain, string> = {
  investment: 'Investment',
  career: 'Career',
  business: 'Business',
};

export type CatalogAgent = {
  id: string;
  name: string;
  role: string;
  description: string;
  domain: AgentDomain;
  defaultFor: AgentDomain[];
};

export const AGENT_CATALOG: CatalogAgent[] = [
  // ═══ INVESTMENT (10) ═══
  {
    id: 'numbers_first',
    name: 'Numbers First',
    role: 'Hard financial data before opinions',
    description:
      'Ground every investment thesis in hard financial data before anyone gets excited or scared.',
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'chart_reader',
    name: 'Chart Reader',
    role: 'Price action and timing, not hype',
    description:
      'Determine if the TIMING is right. A great investment at the wrong price is a bad investment.',
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'risk_destroyer',
    name: 'Risk Destroyer',
    role: 'Worst case before the first dollar',
    description:
      'Ensure the investor knows the WORST CASE before committing a single dollar.',
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'crowd_pulse',
    name: 'Crowd Pulse',
    role: 'Sentiment as signal or trap',
    description:
      'Determine if the current sentiment creates opportunity or danger. When everyone is euphoric, be cautious. When everyone is terrified, pay attention.',
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'big_picture',
    name: 'Big Picture',
    role: 'Macro cycle and global backdrop',
    description:
      'Context this specific investment within the global economic cycle. Interest rates, inflation, geopolitics — the backdrop matters more than the stock.',
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'tax_smart',
    name: 'Tax Smart',
    role: 'After-tax reality, not headline returns',
    description:
      'Ensure the investor considers the tax consequences BEFORE investing, not after. The difference between smart and dumb tax timing can be 20-30% of returns.',
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'crypto_native',
    name: 'Crypto Native',
    role: 'On-chain truth vs narrative',
    description:
      'Separate real crypto value from hype by analyzing on-chain fundamentals that cannot be faked. Most people buy narratives. This agent buys data.',
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'honest_mirror',
    name: 'Honest Mirror',
    role: 'Bias and psychology of the investor',
    description:
      "Hold up a mirror to the investor's cognitive biases. Most investment losses are psychological failures, not analytical failures.",
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'income_builder',
    name: 'Income Builder',
    role: 'Dividends, yield, sustainable income',
    description:
      'Evaluate whether this investment generates reliable, growing income — and whether that income is SUSTAINABLE, not just high on paper.',
    domain: 'investment',
    defaultFor: ['investment'],
  },
  {
    id: 'portfolio_doctor',
    name: 'Portfolio Doctor',
    role: 'Fit with the whole portfolio',
    description:
      'Prevent the #1 amateur mistake: evaluating each investment alone instead of asking "how does this fit with everything else I own?"',
    domain: 'investment',
    defaultFor: ['investment'],
  },

  // ═══ CAREER (10) ═══
  {
    id: 'offer_decoder',
    name: 'Offer Decoder',
    role: 'Read the real offer, not the brochure',
    description:
      'Ensure the user sees the REAL offer, not the marketing version. Companies sell jobs like products — your job is to read the ingredients list.',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'career_trajectory',
    name: 'Career Trajectory',
    role: 'This job as a chapter, not an event',
    description:
      'Ensure the user sees the JOB as a chapter in a CAREER, not an isolated event. Every role either opens doors or closes them.',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'negotiation_coach',
    name: 'Negotiation Coach',
    role: 'Scripts and leverage, not hope',
    description:
      'Turn "I don\'t know how to negotiate" into a specific script the user can follow. Most people leave $10-50K on the table because nobody taught them how to ask.',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'regret_minimizer',
    name: 'Regret Minimizer',
    role: 'Regret of inaction vs failure',
    description:
      'Shift the user from "what is the safe choice?" to "what will I regret not trying?" Most career regrets are about inaction, not failure.',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'leap_calculator',
    name: 'Leap Calculator',
    role: 'Runway and survivable leaps',
    description:
      'Turn the emotional "should I take the leap?" into a calculated risk with specific numbers. Courage is easier when you know you can survive the fall.',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'side_quest_advisor',
    name: 'Side Quest Advisor',
    role: 'Test without betting everything',
    description:
      'Help the 80% of people who should NOT quit yet find the path that lets them test their idea without betting everything.',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'market_rate_check',
    name: 'Market Rate Check',
    role: 'Data-backed comp, not vibes',
    description:
      'Ensure the user never accepts below market or negotiates without data. Most people leave 10-30% on the table because they don\'t know their number.',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'boss_dynamics',
    name: 'Boss Dynamics',
    role: 'The manager relationship',
    description:
      'Help the user evaluate the ONE factor that predicts job satisfaction better than anything else: the direct manager.',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'culture_detector',
    name: 'Culture Detector',
    role: 'Toxic culture before you sign',
    description:
      'Save the user from the #1 reason people quit: toxic culture disguised as "fast-paced, passionate team."',
    domain: 'career',
    defaultFor: ['career'],
  },
  {
    id: 'burnout_detector',
    name: 'Burnout Detector',
    role: 'Rest vs resignation',
    description:
      'Prevent the user from making a permanent decision (quitting) based on a temporary state (burnout). The fix might be rest, not resignation.',
    domain: 'career',
    defaultFor: ['career'],
  },

  // ═══ BUSINESS (10) ═══
  {
    id: 'timing_oracle',
    name: 'Timing Oracle',
    role: 'Right idea vs right now',
    description:
      'Answer the question every founder ignores: not "is this a good idea?" but "is this a good idea RIGHT NOW?"',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'customer_whisperer',
    name: 'Customer Whisperer',
    role: 'Wallets beat surveys',
    description:
      'Separate "people say they want this" from "people will pay money for this." The graveyard of startups is full of products people loved in surveys.',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'competitive_assassin',
    name: 'Competitive Assassin',
    role: 'No such thing as no competition',
    description:
      'Destroy the illusion that "we have no competition." Everyone has competition — even if it is apathy and the status quo.',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'reality_check',
    name: 'Reality Check',
    role: 'Base rates and historical truth',
    description:
      'Ground every business thesis in base rates and historical data. Optimism is not a strategy — 90% of startups fail, and yours needs a reason to be different.',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'execution_realist',
    name: 'Execution Realist',
    role: 'Plans that can actually ship',
    description:
      'Close the gap between "great idea" and "actually done." Most plans die in execution — not because the idea was bad, but because the plan was fantasy.',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'unit_economics_hawk',
    name: 'Unit Economics Hawk',
    role: 'Profit per customer before scale',
    description:
      'Verify that every customer interaction is profitable BEFORE scaling. Growing an unprofitable business faster just means losing money faster.',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'regulatory_shield',
    name: 'Regulatory Shield',
    role: 'Legal and compliance before build',
    description:
      'Prevent the nightmare of building something you are not allowed to operate. Regulatory surprises have killed more startups than bad products.',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'funding_strategist',
    name: 'Funding Strategist',
    role: 'When and how much to raise',
    description:
      'Prevent the two most common funding mistakes: raising too early (giving away the company) and raising too late (running out of money).',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'risk_scenario_builder',
    name: 'Risk Scenario Builder',
    role: 'Scenarios, odds, early warnings',
    description:
      'Replace "I hope it works" with "here are 3 specific scenarios, their probabilities, and the early warning signs for each."',
    domain: 'business',
    defaultFor: ['business'],
  },
  {
    id: 'first_90_days',
    name: 'First 90 Days',
    role: 'From decision to weekly actions',
    description:
      'Close the gap between "deciding" and "doing." A decision without a week-by-week plan is just a wish.',
    domain: 'business',
    defaultFor: ['business'],
  },
];

export const CATALOG_AGENT_COUNT = AGENT_CATALOG.length;

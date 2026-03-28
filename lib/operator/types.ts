export type OperatorType = 'business_owner' | 'aspiring' | 'career' | 'investor';

export interface OperatorProfile {
  // Identity (always)
  name: string;
  age: number | null;
  location: string;
  nationality: string;
  languages: string[];

  /** Persisted: user moved risk slider at least once (required for reward if still at 5). */
  _riskTouched?: boolean;
  /** Persisted: user moved decision-speed slider at least once. */
  _speedTouched?: boolean;

  // Branching
  operatorType: OperatorType | null;

  // Branch A: Business Owner
  businessOwner?: {
    companyName: string;
    industry: string;
    businessStage: string;
    teamSize: string;
    role: string;
    annualRevenue: string;
    monthlyBurn: number | null;
    availableCapital: string;
    fundingStatus: string;
    profitable: string;
    currentFocus: string;
    topChallenges: string[];
    constraints: string;
  };

  // Branch B: Aspiring Entrepreneur
  aspiring?: {
    businessIdea: string;
    industry: string;
    stage: string;
    coFounders: string;
    availableCapital: string;
    currentEmployment: string;
    monthlyIncome: string;
    runwayMonths: string;
    relevantExperience: string;
    biggestFear: string;
    helpNeeded: string[];
  };

  // Branch C: Career
  career?: {
    currentRole: string;
    company: string;
    industry: string;
    yearsInRole: number | null;
    yearsExperience: number | null;
    seniority: string;
    situation: string;
    salaryRange: string;
    locationFlexibility: string;
    priorities: string[];
    decisionContext: string;
  };

  // Branch D: Investor
  investor?: {
    investorType: string;
    investmentFocus: string;
    checkSize: string;
    portfolioSize: string;
    currentEvaluation: string;
    riskAppetite: number;
    timeHorizon: string;
  };

  // Decision style (always)
  riskTolerance: number;
  decisionSpeed: number;
  priority: string;

  // Goals (always)
  sixMonthGoal: string;
  oneYearGoal: string;
  threeYearGoal: string;
  domainExpertise: string[];
}

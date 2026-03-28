import type { OperatorProfile, OperatorType } from './types';

export function emptyBusinessOwner(): NonNullable<OperatorProfile['businessOwner']> {
  return {
    companyName: '',
    industry: '',
    businessStage: '',
    teamSize: '',
    role: '',
    annualRevenue: '',
    monthlyBurn: null,
    availableCapital: '',
    fundingStatus: '',
    profitable: '',
    currentFocus: '',
    topChallenges: ['', '', ''],
    constraints: '',
  };
}

export function emptyAspiring(): NonNullable<OperatorProfile['aspiring']> {
  return {
    businessIdea: '',
    industry: '',
    stage: '',
    coFounders: '',
    availableCapital: '',
    currentEmployment: '',
    monthlyIncome: '',
    runwayMonths: '',
    relevantExperience: '',
    biggestFear: '',
    helpNeeded: [],
  };
}

export function defaultCareerPriorities(): string[] {
  return [
    'Compensation / money',
    'Work-life balance',
    'Growth opportunity',
    'Company mission/culture',
    'Location',
    'Job security',
  ];
}

export function emptyCareer(): NonNullable<OperatorProfile['career']> {
  return {
    currentRole: '',
    company: '',
    industry: '',
    yearsInRole: null,
    yearsExperience: null,
    seniority: '',
    situation: '',
    salaryRange: '',
    locationFlexibility: '',
    priorities: defaultCareerPriorities(),
    decisionContext: '',
  };
}

export function emptyInvestor(): NonNullable<OperatorProfile['investor']> {
  return {
    investorType: '',
    investmentFocus: '',
    checkSize: '',
    portfolioSize: '',
    currentEvaluation: '',
    riskAppetite: 5,
    timeHorizon: '',
  };
}

export function emptyOperatorProfile(): OperatorProfile {
  return {
    name: '',
    age: null,
    location: '',
    nationality: '',
    languages: [],
    _riskTouched: false,
    _speedTouched: false,
    operatorType: null,
    riskTolerance: 5,
    decisionSpeed: 5,
    priority: '',
    sixMonthGoal: '',
    oneYearGoal: '',
    threeYearGoal: '',
    domainExpertise: [],
  };
}

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/** Merge partial JSON from DB into a full OperatorProfile. */
export function normalizeOperatorProfile(raw: unknown): OperatorProfile {
  const base = emptyOperatorProfile();
  if (!isObj(raw)) return base;

  const mergeStr = (v: unknown) => (typeof v === 'string' ? v : '');
  const mergeNum = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;
  const mergeStrArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

  base.name = mergeStr(raw.name);
  base.age = mergeNum(raw.age);
  base.location = mergeStr(raw.location);
  base.nationality = mergeStr(raw.nationality);
  base.languages = mergeStrArr(raw.languages);
  base._riskTouched = raw._riskTouched === true;
  base._speedTouched = raw._speedTouched === true;

  const ot = raw.operatorType;
  const validTypes: OperatorType[] = ['business_owner', 'aspiring', 'career', 'investor'];
  base.operatorType = validTypes.includes(ot as OperatorType) ? (ot as OperatorType) : null;

  base.riskTolerance = typeof raw.riskTolerance === 'number' ? Math.min(10, Math.max(1, raw.riskTolerance)) : 5;
  base.decisionSpeed = typeof raw.decisionSpeed === 'number' ? Math.min(10, Math.max(1, raw.decisionSpeed)) : 5;
  base.priority = mergeStr(raw.priority);
  base.sixMonthGoal = mergeStr(raw.sixMonthGoal);
  base.oneYearGoal = mergeStr(raw.oneYearGoal);
  base.threeYearGoal = mergeStr(raw.threeYearGoal);
  base.domainExpertise = mergeStrArr(raw.domainExpertise);

  if (isObj(raw.businessOwner)) {
    const bo = emptyBusinessOwner();
    const s = raw.businessOwner;
    bo.companyName = mergeStr(s.companyName);
    bo.industry = mergeStr(s.industry);
    bo.businessStage = mergeStr(s.businessStage);
    bo.teamSize = mergeStr(s.teamSize);
    bo.role = mergeStr(s.role);
    bo.annualRevenue = mergeStr(s.annualRevenue);
    bo.monthlyBurn = mergeNum(s.monthlyBurn);
    bo.availableCapital = mergeStr(s.availableCapital);
    bo.fundingStatus = mergeStr(s.fundingStatus);
    bo.profitable = mergeStr(s.profitable);
    bo.currentFocus = mergeStr(s.currentFocus);
    bo.constraints = mergeStr(s.constraints);
    const tc = s.topChallenges;
    if (Array.isArray(tc)) {
      bo.topChallenges = [0, 1, 2].map((i) => (typeof tc[i] === 'string' ? tc[i] : ''));
    }
    base.businessOwner = bo;
  }

  if (isObj(raw.aspiring)) {
    const a = emptyAspiring();
    const s = raw.aspiring;
    a.businessIdea = mergeStr(s.businessIdea);
    a.industry = mergeStr(s.industry);
    a.stage = mergeStr(s.stage);
    a.coFounders = mergeStr(s.coFounders);
    a.availableCapital = mergeStr(s.availableCapital);
    a.currentEmployment = mergeStr(s.currentEmployment);
    a.monthlyIncome = mergeStr(s.monthlyIncome);
    a.runwayMonths = mergeStr(s.runwayMonths);
    a.relevantExperience = mergeStr(s.relevantExperience);
    a.biggestFear = mergeStr(s.biggestFear);
    a.helpNeeded = mergeStrArr(s.helpNeeded);
    base.aspiring = a;
  }

  if (isObj(raw.career)) {
    const c = emptyCareer();
    const s = raw.career;
    c.currentRole = mergeStr(s.currentRole);
    c.company = mergeStr(s.company);
    c.industry = mergeStr(s.industry);
    c.yearsInRole = mergeNum(s.yearsInRole);
    c.yearsExperience = mergeNum(s.yearsExperience);
    c.seniority = mergeStr(s.seniority);
    c.situation = mergeStr(s.situation);
    c.salaryRange = mergeStr(s.salaryRange);
    c.locationFlexibility = mergeStr(s.locationFlexibility);
    c.decisionContext = mergeStr(s.decisionContext);
    const pr = s.priorities;
    if (Array.isArray(pr) && pr.length > 0 && pr.every((x) => typeof x === 'string')) {
      c.priorities = pr as string[];
    }
    base.career = c;
  }

  if (isObj(raw.investor)) {
    const inv = emptyInvestor();
    const s = raw.investor;
    inv.investorType = mergeStr(s.investorType);
    inv.investmentFocus = mergeStr(s.investmentFocus);
    inv.checkSize = mergeStr(s.checkSize);
    inv.portfolioSize = mergeStr(s.portfolioSize);
    inv.currentEvaluation = mergeStr(s.currentEvaluation);
    inv.riskAppetite =
      typeof s.riskAppetite === 'number' ? Math.min(10, Math.max(1, s.riskAppetite)) : 5;
    inv.timeHorizon = mergeStr(s.timeHorizon);
    base.investor = inv;
  }

  return base;
}

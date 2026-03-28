import type { OperatorProfile } from './types';

function filledStr(s: string | undefined | null): boolean {
  return typeof s === 'string' && s.trim().length > 0;
}

function filledNum(n: number | null | undefined): boolean {
  return typeof n === 'number' && Number.isFinite(n);
}

function filledArr(a: string[] | undefined): boolean {
  return Array.isArray(a) && a.some((x) => typeof x === 'string' && x.trim().length > 0);
}

/** Returns [filled, total] for the current profile shape. */
export function calculateCompleteness(profile: OperatorProfile): { filled: number; total: number; percent: number } {
  let filled = 0;
  let total = 0;

  const count = (ok: boolean) => {
    total += 1;
    if (ok) filled += 1;
  };

  // Identity — 5
  count(filledStr(profile.name));
  count(filledNum(profile.age));
  count(filledStr(profile.location));
  count(filledStr(profile.nationality));
  count(filledArr(profile.languages));

  // Branch type
  count(profile.operatorType !== null);

  // Branch-specific
  if (profile.operatorType === 'business_owner') {
    const bo = profile.businessOwner;
    count(filledStr(bo?.companyName));
    count(filledStr(bo?.industry));
    count(filledStr(bo?.businessStage));
    count(filledStr(bo?.teamSize));
    count(filledStr(bo?.role));
    count(filledStr(bo?.annualRevenue));
    count(filledNum(bo?.monthlyBurn));
    count(filledStr(bo?.availableCapital));
    count(filledStr(bo?.fundingStatus));
    count(filledStr(bo?.profitable));
    count(filledStr(bo?.currentFocus));
    count(filledStr(bo?.topChallenges?.[0]));
    count(filledStr(bo?.topChallenges?.[1]));
    count(filledStr(bo?.topChallenges?.[2]));
    count(filledStr(bo?.constraints));
  } else if (profile.operatorType === 'aspiring') {
    const a = profile.aspiring;
    count(filledStr(a?.businessIdea));
    count(filledStr(a?.industry));
    count(filledStr(a?.stage));
    count(filledStr(a?.coFounders));
    count(filledStr(a?.availableCapital));
    count(filledStr(a?.currentEmployment));
    count(filledStr(a?.monthlyIncome));
    count(filledStr(a?.runwayMonths));
    count(filledStr(a?.relevantExperience));
    count(filledStr(a?.biggestFear));
    count(filledArr(a?.helpNeeded));
  } else if (profile.operatorType === 'career') {
    const c = profile.career;
    count(filledStr(c?.currentRole));
    count(filledStr(c?.company));
    count(filledStr(c?.industry));
    count(filledNum(c?.yearsInRole));
    count(filledNum(c?.yearsExperience));
    count(filledStr(c?.seniority));
    count(filledStr(c?.situation));
    count(filledStr(c?.salaryRange));
    count(filledStr(c?.locationFlexibility));
    count((c?.priorities?.length ?? 0) > 0);
    count(filledStr(c?.decisionContext));
  } else if (profile.operatorType === 'investor') {
    const inv = profile.investor;
    count(filledStr(inv?.investorType));
    count(filledStr(inv?.investmentFocus));
    count(filledStr(inv?.checkSize));
    count(filledStr(inv?.portfolioSize));
    count(filledStr(inv?.currentEvaluation));
    count(typeof inv?.riskAppetite === 'number');
    count(filledStr(inv?.timeHorizon));
  }

  // Decision style — 3
  count(typeof profile.riskTolerance === 'number');
  count(typeof profile.decisionSpeed === 'number');
  count(filledStr(profile.priority));

  // Goals — 4
  count(filledStr(profile.sixMonthGoal));
  count(filledStr(profile.oneYearGoal));
  count(filledStr(profile.threeYearGoal));
  count(filledArr(profile.domainExpertise));

  const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
  return { filled, total, percent };
}

/** Filled / total for the active branch block only (for UI section label). */
export function branchFieldProgress(profile: OperatorProfile): { f: number; t: number } {
  let filled = 0;
  let total = 0;
  const count = (ok: boolean) => {
    total += 1;
    if (ok) filled += 1;
  };

  if (profile.operatorType === 'business_owner') {
    const bo = profile.businessOwner;
    count(filledStr(bo?.companyName));
    count(filledStr(bo?.industry));
    count(filledStr(bo?.businessStage));
    count(filledStr(bo?.teamSize));
    count(filledStr(bo?.role));
    count(filledStr(bo?.annualRevenue));
    count(filledNum(bo?.monthlyBurn));
    count(filledStr(bo?.availableCapital));
    count(filledStr(bo?.fundingStatus));
    count(filledStr(bo?.profitable));
    count(filledStr(bo?.currentFocus));
    count(filledStr(bo?.topChallenges?.[0]));
    count(filledStr(bo?.topChallenges?.[1]));
    count(filledStr(bo?.topChallenges?.[2]));
    count(filledStr(bo?.constraints));
  } else if (profile.operatorType === 'aspiring') {
    const a = profile.aspiring;
    count(filledStr(a?.businessIdea));
    count(filledStr(a?.industry));
    count(filledStr(a?.stage));
    count(filledStr(a?.coFounders));
    count(filledStr(a?.availableCapital));
    count(filledStr(a?.currentEmployment));
    count(filledStr(a?.monthlyIncome));
    count(filledStr(a?.runwayMonths));
    count(filledStr(a?.relevantExperience));
    count(filledStr(a?.biggestFear));
    count(filledArr(a?.helpNeeded));
  } else if (profile.operatorType === 'career') {
    const c = profile.career;
    count(filledStr(c?.currentRole));
    count(filledStr(c?.company));
    count(filledStr(c?.industry));
    count(filledNum(c?.yearsInRole));
    count(filledNum(c?.yearsExperience));
    count(filledStr(c?.seniority));
    count(filledStr(c?.situation));
    count(filledStr(c?.salaryRange));
    count(filledStr(c?.locationFlexibility));
    count((c?.priorities?.length ?? 0) > 0);
    count(filledStr(c?.decisionContext));
  } else if (profile.operatorType === 'investor') {
    const inv = profile.investor;
    count(filledStr(inv?.investorType));
    count(filledStr(inv?.investmentFocus));
    count(filledStr(inv?.checkSize));
    count(filledStr(inv?.portfolioSize));
    count(filledStr(inv?.currentEvaluation));
    count(typeof inv?.riskAppetite === 'number');
    count(filledStr(inv?.timeHorizon));
  }

  return { f: filled, t: total };
}

export function decisionStyleProgress(profile: OperatorProfile): { f: number; t: number } {
  let f = 0;
  const t = 3;
  if (typeof profile.riskTolerance === 'number') f++;
  if (typeof profile.decisionSpeed === 'number') f++;
  if (filledStr(profile.priority)) f++;
  return { f, t };
}

export function goalsProgress(profile: OperatorProfile): { f: number; t: number } {
  let f = 0;
  const t = 4;
  if (filledStr(profile.sixMonthGoal)) f++;
  if (filledStr(profile.oneYearGoal)) f++;
  if (filledStr(profile.threeYearGoal)) f++;
  if (filledArr(profile.domainExpertise)) f++;
  return { f, t };
}

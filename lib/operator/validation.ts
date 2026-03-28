import type { OperatorProfile, OperatorType } from './types';

export interface ValidationResult {
  complete: boolean;
  missingFields: string[];
  filledRequired: number;
  totalRequired: number;
}

const TWO_WORDS = /\S+\s+\S+/;

export function getTotalRequiredForBranch(type: OperatorType | null): number {
  const base = 4 + 1 + 2 + 2; // identity(4) + branch card(1) + sliders(2) + goals(2)
  switch (type) {
    case 'business_owner':
      return base + 8;
    case 'aspiring':
      return base + 7;
    case 'career':
      return base + 7;
    case 'investor':
      return base + 5;
    default:
      return base;
  }
}

/**
 * Server/client: required fields for the 1-token Operator completion reward.
 * Uses `_riskTouched` / `_speedTouched` so default slider position 5 still fails until user moves each once.
 */
export function validateRequiredFields(profile: OperatorProfile | null | undefined): ValidationResult {
  const missing: string[] = [];
  const p = profile;

  if (!p?.name?.trim() || !TWO_WORDS.test(p.name.trim())) {
    missing.push('Full name (first and last)');
  }
  if (p?.age == null || typeof p.age !== 'number' || p.age < 16 || p.age > 100) {
    missing.push('Age (16–100)');
  }
  if (!p?.location?.trim()) missing.push('Location');
  if (!p?.nationality?.trim()) missing.push('Nationality');

  if (!p?.operatorType) {
    missing.push('Profile type selection');
  }

  switch (p?.operatorType) {
    case 'business_owner': {
      const bo = p.businessOwner;
      if (!bo?.companyName?.trim()) missing.push('Company name');
      if (!bo?.industry?.trim()) missing.push('Industry');
      if (!bo?.businessStage?.trim()) missing.push('Business stage');
      if (!bo?.teamSize?.trim()) missing.push('Team size');
      if (!bo?.annualRevenue?.trim()) missing.push('Annual revenue');
      if (!bo?.availableCapital?.trim()) missing.push('Available capital');
      if (!bo?.currentFocus || bo.currentFocus.trim().length < 50) {
        missing.push('Current focus (min 50 characters)');
      }
      if (!bo?.topChallenges?.some((c) => typeof c === 'string' && c.trim().length > 0)) {
        missing.push('At least one business challenge');
      }
      break;
    }
    case 'aspiring': {
      const asp = p.aspiring;
      if (!asp?.businessIdea || asp.businessIdea.trim().length < 50) {
        missing.push('Business idea (min 50 characters)');
      }
      if (!asp?.industry?.trim()) missing.push('Industry');
      if (!asp?.stage?.trim()) missing.push('How far along');
      if (!asp?.availableCapital?.trim()) missing.push('Available capital');
      if (!asp?.currentEmployment?.trim()) missing.push('Current employment');
      if (!asp?.relevantExperience?.trim()) missing.push('Relevant experience');
      if (!asp?.biggestFear || asp.biggestFear.trim().length < 30) {
        missing.push('Biggest fear (min 30 characters)');
      }
      break;
    }
    case 'career': {
      const car = p.career;
      if (!car?.currentRole?.trim()) missing.push('Current role');
      if (!car?.company?.trim()) missing.push('Company');
      if (!car?.industry?.trim()) missing.push('Industry');
      if (
        car?.yearsExperience == null ||
        typeof car.yearsExperience !== 'number' ||
        !Number.isFinite(car.yearsExperience) ||
        car.yearsExperience < 0
      ) {
        missing.push('Years of experience');
      }
      if (!car?.seniority?.trim()) missing.push('Seniority');
      if (!car?.situation?.trim()) missing.push('Career situation');
      if (!car?.decisionContext || car.decisionContext.trim().length < 50) {
        missing.push('Decision context (min 50 characters)');
      }
      break;
    }
    case 'investor': {
      const inv = p.investor;
      if (!inv?.investorType?.trim()) missing.push('Investor type');
      if (!inv?.investmentFocus?.trim()) missing.push('Investment focus');
      if (!inv?.checkSize?.trim()) missing.push('Check size');
      if (!inv?.currentEvaluation || inv.currentEvaluation.trim().length < 50) {
        missing.push('Current evaluation (min 50 characters)');
      }
      if (inv?.riskAppetite == null || typeof inv.riskAppetite !== 'number') {
        missing.push('Risk appetite');
      }
      break;
    }
    default:
      break;
  }

  if (p?.riskTolerance === 5 && !p?._riskTouched) {
    missing.push('Risk tolerance (adjust slider)');
  }
  if (p?.decisionSpeed === 5 && !p?._speedTouched) {
    missing.push('Decision speed (adjust slider)');
  }

  if (!p?.sixMonthGoal || p.sixMonthGoal.trim().length < 20) {
    missing.push('6-month goal (min 20 characters)');
  }
  if (!p?.oneYearGoal || p.oneYearGoal.trim().length < 20) {
    missing.push('1-year goal (min 20 characters)');
  }

  const totalRequired = getTotalRequiredForBranch(p?.operatorType ?? null);
  const filledRequired = Math.max(0, totalRequired - missing.length);

  return {
    complete: missing.length === 0,
    missingFields: missing,
    filledRequired,
    totalRequired,
  };
}

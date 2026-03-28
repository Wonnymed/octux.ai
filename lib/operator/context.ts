import type { OperatorProfile, OperatorType } from './types';

export function getTypeLabel(t: OperatorType): string {
  switch (t) {
    case 'business_owner':
      return 'Business owner';
    case 'aspiring':
      return 'Aspiring entrepreneur';
    case 'career':
      return 'Career professional';
    case 'investor':
      return 'Investor / analyst';
    default:
      return 'Unknown';
  }
}

export function formatOperatorContext(profile: OperatorProfile | null | undefined): string {
  if (!profile || !profile.operatorType) return '';

  let context = `
== DECISION MAKER PROFILE ==
Name: ${profile.name}, ${profile.age ?? '?'} years old
Location: ${profile.location}
Type: ${getTypeLabel(profile.operatorType)}
`;

  switch (profile.operatorType) {
    case 'business_owner': {
      const bo = profile.businessOwner;
      context += `
Company: ${bo?.companyName ?? ''} (${bo?.industry ?? ''})
Stage: ${bo?.businessStage ?? ''}, Team: ${bo?.teamSize ?? ''}
Revenue: ${bo?.annualRevenue ?? ''}, Capital: ${bo?.availableCapital ?? ''}
Funding: ${bo?.fundingStatus ?? ''}, Profitable: ${bo?.profitable ?? ''}
Current focus: ${bo?.currentFocus ?? ''}
Challenges: ${bo?.topChallenges?.filter(Boolean).join('; ') ?? ''}
Constraints: ${bo?.constraints ?? ''}`;
      break;
    }
    case 'aspiring': {
      const asp = profile.aspiring;
      context += `
Idea: ${asp?.businessIdea ?? ''}
Stage: ${asp?.stage ?? ''}, Industry: ${asp?.industry ?? ''}
Capital: ${asp?.availableCapital ?? ''}
Employment: ${asp?.currentEmployment ?? ''}
Experience: ${asp?.relevantExperience ?? ''}
Runway: ${asp?.runwayMonths ?? ''}
Biggest concern: ${asp?.biggestFear ?? ''}
Needs help with: ${asp?.helpNeeded?.join(', ') ?? ''}`;
      break;
    }
    case 'career': {
      const car = profile.career;
      context += `
Role: ${car?.currentRole ?? ''} at ${car?.company ?? ''}
Seniority: ${car?.seniority ?? ''}, ${car?.yearsExperience ?? '?'} years exp
Situation: ${car?.situation ?? ''}
Salary range: ${car?.salaryRange ?? ''}
Location: ${car?.locationFlexibility ?? ''}
Priorities: ${car?.priorities?.join(' > ') ?? ''}
Context: ${car?.decisionContext ?? ''}`;
      break;
    }
    case 'investor': {
      const inv = profile.investor;
      context += `
Type: ${inv?.investorType ?? ''}
Focus: ${inv?.investmentFocus ?? ''}
Check size: ${inv?.checkSize ?? ''}, Portfolio: ${inv?.portfolioSize ?? ''}
Risk: ${inv?.riskAppetite ?? '?'}/10
Time horizon: ${inv?.timeHorizon ?? ''}
Evaluating: ${inv?.currentEvaluation ?? ''}`;
      break;
    }
    default:
      break;
  }

  context += `

Decision style: Risk ${profile.riskTolerance}/10, Speed ${profile.decisionSpeed}/10
Priority: ${profile.priority}
Goals: 6mo → ${profile.sixMonthGoal} | 1yr → ${profile.oneYearGoal} | 3yr → ${profile.threeYearGoal}
Expertise: ${profile.domainExpertise?.join(', ') ?? ''}
== END PROFILE ==

IMPORTANT: Tailor ALL analysis to this specific person's situation,
resources, experience level, and constraints. Generic advice is
NOT acceptable.`;

  return context.trim();
}

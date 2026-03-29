/**
 * Structured operator / decision-maker profile for Chief design + context injection.
 * Fields are optional — populated from settings / onboarding when available.
 */
export type OperatorProfile = {
  name?: string;
  location?: string;
  operatorType?: string;
  industry?: string;
  businessStage?: string;
  currentFocus?: string;
  businessIdea?: string;
  stage?: string;
  availableCapital?: string;
  investorType?: string;
  checkSize?: string;
  currentRole?: string;
  decisionContext?: string;
  goal?: string;
  riskTolerance?: number;
  decisionSpeed?: number;
};

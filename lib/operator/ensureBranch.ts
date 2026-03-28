import {
  emptyAspiring,
  emptyBusinessOwner,
  emptyCareer,
  emptyInvestor,
} from './defaults';
import type { OperatorProfile, OperatorType } from './types';

export function ensureBranchData(profile: OperatorProfile, type: OperatorType | null): OperatorProfile {
  const p = { ...profile, operatorType: type };
  if (type === 'business_owner') {
    p.businessOwner = p.businessOwner ?? emptyBusinessOwner();
  }
  if (type === 'aspiring') {
    p.aspiring = p.aspiring ?? emptyAspiring();
  }
  if (type === 'career') {
    p.career = p.career ?? emptyCareer();
  }
  if (type === 'investor') {
    p.investor = p.investor ?? emptyInvestor();
  }
  return p;
}

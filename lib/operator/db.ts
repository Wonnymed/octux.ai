import { supabase } from '@/lib/memory/supabase';
import { calculateCompleteness } from './completeness';
import { normalizeOperatorProfile } from './defaults';
import type { OperatorProfile } from './types';

export type OperatorRow = {
  profile: OperatorProfile;
  operatorType: string | null;
  completeness: number;
};

export async function fetchOperatorProfileForUser(userId: string): Promise<OperatorRow | null> {
  if (!supabase || !userId || userId.startsWith('anon_')) return null;

  const { data, error } = await supabase
    .from('operator_profiles')
    .select('profile, operator_type, completeness')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[operator] load failed:', error.message);
    return null;
  }
  if (!data) return null;

  const profile = normalizeOperatorProfile(data.profile);
  const { percent } = calculateCompleteness(profile);
  const stored = typeof data.completeness === 'number' ? data.completeness : percent;

  return {
    profile,
    operatorType: typeof data.operator_type === 'string' ? data.operator_type : profile.operatorType,
    completeness: Math.max(0, Math.min(100, stored)),
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/supabase-server';
import { supabase } from '@/lib/memory/supabase';

export async function GET(req: NextRequest) {
  const { userId } = await getUserIdFromRequest(req);

  if (!supabase) {
    return NextResponse.json({ sims: [] });
  }

  const { data: sims } = await supabase
    .from('simulations')
    .select('id, question, verdict, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(8);

  const formatted = (sims || []).map(s => {
    const v = s.verdict as Record<string, unknown> | null;
    return {
      id: s.id,
      question: s.question,
      verdict_recommendation: (v?.recommendation as string) || 'unknown',
      verdict_probability: (v?.probability as number) || 0,
      created_at: s.created_at,
    };
  });

  return NextResponse.json({ sims: formatted });
}

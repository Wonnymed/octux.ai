import { NextRequest, NextResponse } from 'next/server';
import { createAuthServerClient } from '@/lib/auth/supabase-server';
import { calculateCompleteness } from '@/lib/operator/completeness';
import { emptyOperatorProfile, normalizeOperatorProfile } from '@/lib/operator/defaults';

export async function GET() {
  try {
    const supabase = await createAuthServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('operator_profiles')
      .select('profile, operator_type, completeness, updated_at, reward_claimed, reward_claimed_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('operator GET:', error);
      return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
    }

    if (!data) {
      const profile = emptyOperatorProfile();
      return NextResponse.json({
        profile,
        operatorType: null,
        completeness: 0,
        computedCompleteness: 0,
        updatedAt: null,
        rewardClaimed: false,
        rewardClaimedAt: null,
      });
    }

    const profile = normalizeOperatorProfile(data.profile);
    const { percent } = calculateCompleteness(profile);

    return NextResponse.json({
      profile,
      operatorType: data?.operator_type ?? profile.operatorType,
      completeness: typeof data?.completeness === 'number' ? data.completeness : percent,
      computedCompleteness: percent,
      updatedAt: data?.updated_at ?? null,
      rewardClaimed: Boolean(data.reward_claimed),
      rewardClaimedAt: data.reward_claimed_at ?? null,
    });
  } catch (e) {
    console.error('operator GET:', e);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createAuthServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const raw = body?.profile as unknown;
    const profile = normalizeOperatorProfile(raw);
    const { percent } = calculateCompleteness(profile);

    const row = {
      user_id: user.id,
      profile: profile as unknown as Record<string, unknown>,
      operator_type: profile.operatorType,
      completeness: percent,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('operator_profiles').upsert(row, { onConflict: 'user_id' });

    if (error) {
      console.error('operator PUT:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, completeness: percent });
  } catch (e) {
    console.error('operator PUT:', e);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createAuthServerClient } from '@/lib/auth/supabase-server';
import { ensureUserSubscription } from '@/lib/billing/usage';
import { normalizeOperatorProfile } from '@/lib/operator/defaults';
import { validateRequiredFields } from '@/lib/operator/validation';
import { createClient } from '@supabase/supabase-js';

function serviceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST() {
  try {
    const auth = await createAuthServerClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = serviceSupabase();
    if (!supabase) {
      console.error('claim-reward: missing service role');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    await ensureUserSubscription(user.id);

    const { data: row, error: readErr } = await supabase
      .from('operator_profiles')
      .select('profile, reward_claimed')
      .eq('user_id', user.id)
      .maybeSingle();

    if (readErr) {
      console.error('claim-reward read:', readErr);
      return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
    }

    if (!row) {
      return NextResponse.json(
        { error: 'Profile incomplete', missingFields: ['Save your profile first'] },
        { status: 400 },
      );
    }

    if (row.reward_claimed) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
    }

    const profile = normalizeOperatorProfile(row.profile);
    const validation = validateRequiredFields(profile);

    if (!validation.complete) {
      return NextResponse.json(
        {
          error: 'Profile incomplete',
          missingFields: validation.missingFields,
        },
        { status: 400 },
      );
    }

    const { data: marked, error: markErr } = await supabase
      .from('operator_profiles')
      .update({
        reward_claimed: true,
        reward_claimed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('reward_claimed', false)
      .select('user_id');

    if (markErr) {
      console.error('claim-reward mark:', markErr);
      return NextResponse.json({ error: 'Could not claim reward' }, { status: 500 });
    }

    if (!marked?.length) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
    }

    const { data: sub, error: subErr } = await supabase
      .from('user_subscriptions')
      .select('bonus_tokens')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subErr || !sub) {
      console.error('claim-reward subscription:', subErr);
      return NextResponse.json({ error: 'Subscription not found' }, { status: 500 });
    }

    const bonus = typeof sub.bonus_tokens === 'number' ? sub.bonus_tokens : 0;
    const { error: bonusErr } = await supabase
      .from('user_subscriptions')
      .update({ bonus_tokens: bonus + 1 })
      .eq('user_id', user.id);

    if (bonusErr) {
      console.error('claim-reward bonus:', bonusErr);
      return NextResponse.json({ error: 'Could not add bonus token' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tokensAdded: 1 });
  } catch (e) {
    console.error('claim-reward:', e);
    return NextResponse.json({ error: 'Claim failed' }, { status: 500 });
  }
}

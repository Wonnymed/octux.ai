import { NextResponse } from 'next/server';
import { checkSimulationStart, checkFeatureAccess } from '@/lib/billing/usage';
import type { SimulationChargeType } from '@/lib/billing/token-costs';
import type { TierLimits } from '@/lib/billing/tiers';

export async function gateSimulation(
  userId: string,
  simMode: SimulationChargeType,
): Promise<NextResponse | null> {
  const result = await checkSimulationStart(userId, simMode);

  if (result.allowed) return null;

  return NextResponse.json(
    {
      error: 'forbidden',
      message: result.reason,
      tokensUsed: result.tokensUsed,
      tokensTotal: result.tokensTotal,
      upgradeRequired: result.upgradeRequired,
    },
    { status: 403 },
  );
}

export async function gateFeature(
  userId: string,
  feature: keyof TierLimits,
): Promise<NextResponse | null> {
  const result = await checkFeatureAccess(userId, feature);

  if (result.allowed) return null;

  return NextResponse.json(
    {
      error: 'upgrade_required',
      message: result.reason,
      upgradeRequired: result.upgradeRequired,
    },
    { status: 403 },
  );
}

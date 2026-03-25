import { NextResponse } from 'next/server';
import { checkUsage, type ActionType } from '@/lib/billing/usage';

export async function tierGate(userId: string, action: ActionType): Promise<NextResponse | null> {
  const result = await checkUsage(userId, action);

  if (result.allowed) return null;

  return NextResponse.json({
    error: 'upgrade_required',
    message: result.reason,
    currentUsage: result.currentUsage,
    limit: result.limit,
    upgradeRequired: result.upgradeRequired,
  }, { status: 403 });
}

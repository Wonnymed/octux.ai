import { NextRequest, NextResponse } from 'next/server';
import { recordOutcome, getCalibrationData } from '@/lib/memory/outcomes';

async function getUserId(req: NextRequest): Promise<string> {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || 'anonymous';
  const ua = req.headers.get('user-agent') || 'unknown';
  const fp = `${ip}-${ua}`.substring(0, 100);

  const encoder = new TextEncoder();
  const data = encoder.encode(fp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 36);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  const body = await req.json();

  if (!body.experienceId || !body.outcome) {
    return NextResponse.json({ error: 'Missing experienceId or outcome' }, { status: 400 });
  }

  const validOutcomes = ['success', 'failure', 'partial', 'cancelled'];
  if (!validOutcomes.includes(body.outcome)) {
    return NextResponse.json({ error: 'Invalid outcome. Must be: success, failure, partial, or cancelled' }, { status: 400 });
  }

  try {
    const result = await recordOutcome(userId, {
      experienceId: body.experienceId,
      outcome: body.outcome,
      notes: body.notes ? String(body.notes).substring(0, 1000) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('Outcome API error:', err);
    return NextResponse.json({ error: 'Failed to record outcome' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);

  try {
    const data = await getCalibrationData(userId);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Calibration API error:', err);
    return NextResponse.json({ error: 'Failed to get calibration data' }, { status: 500 });
  }
}

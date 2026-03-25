import { NextRequest, NextResponse } from 'next/server';
import { getOptimizationReport } from '@/lib/memory/multi-optimizer';

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || 'anonymous';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const fingerprint = `${ip}-${userAgent}`.substring(0, 100);

  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const userId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 36);

  try {
    const report = await getOptimizationReport(userId);
    return NextResponse.json(report);
  } catch (err) {
    console.error('Optimization report error:', err);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

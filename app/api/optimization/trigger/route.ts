import { NextRequest, NextResponse } from 'next/server';
import { optimizeAllAgents } from '@/lib/memory/multi-optimizer';

export async function POST(req: NextRequest) {
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
    const results = await optimizeAllAgents(userId, true);
    return NextResponse.json({
      promoted: results.filter(r => r.action === 'promoted').map(r => r.agentId),
      skipped: results.filter(r => r.action === 'skipped').map(r => r.agentId),
      failed: results.filter(r => r.action === 'failed').map(r => r.agentId),
      results,
    });
  } catch (err) {
    console.error('Manual optimization error:', err);
    return NextResponse.json({ error: 'Failed to run optimization' }, { status: 500 });
  }
}

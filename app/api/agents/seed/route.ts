import { NextResponse } from 'next/server';
import { seedAgentLibrary } from '@/lib/agents/seed';

export async function POST() {
  try {
    const result = await seedAgentLibrary();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Seed failed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableAgents } from '@/lib/agent-chat/chat';

export async function GET(req: NextRequest) {
  const simulationId = req.nextUrl.searchParams.get('simulationId');

  if (!simulationId) {
    return NextResponse.json({ error: 'Missing simulationId' }, { status: 400 });
  }

  const agents = await getAvailableAgents(simulationId);
  return NextResponse.json({ agents });
}

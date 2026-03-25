import { NextRequest, NextResponse } from 'next/server';
import { createCustomAgent, getUserCustomAgents, buildSelfAgent } from '@/lib/agents/library';
import { getUserIdFromRequest } from '@/lib/auth/supabase-server';
import { loadMemoryForSimulation } from '@/lib/memory/core-memory';
import { getOrCreateProfile } from '@/lib/memory/behavioral';

export async function GET(req: NextRequest) {
  const { userId } = await getUserIdFromRequest(req);
  const agents = await getUserCustomAgents(userId);
  return NextResponse.json({ agents });
}

export async function POST(req: NextRequest) {
  const { userId } = await getUserIdFromRequest(req);
  const body = await req.json();

  if (body.action === 'create_self') {
    const memory = await loadMemoryForSimulation(userId, '');
    const behavioral = await getOrCreateProfile(userId);
    const selfAgent = await buildSelfAgent(userId, memory.coreMemory, behavioral);
    return NextResponse.json({ agent: selfAgent });
  }

  if (body.action === 'create') {
    const { name, role, goal, backstory, constraints, icon } = body;
    if (!name || !role || !goal || !backstory) {
      return NextResponse.json({ error: 'name, role, goal, backstory required' }, { status: 400 });
    }

    const agentId = await createCustomAgent(userId, { name, role, goal, backstory, constraints, icon });
    return NextResponse.json({ agentId });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

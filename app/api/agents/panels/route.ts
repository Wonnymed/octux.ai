import { NextRequest, NextResponse } from 'next/server';
import { savePanel, getUserPanels, getPublicPanels } from '@/lib/agents/library';
import { getUserIdFromRequest } from '@/lib/auth/supabase-server';

export async function GET(req: NextRequest) {
  const { userId } = await getUserIdFromRequest(req);
  const { searchParams } = new URL(req.url);

  if (searchParams.get('public') === 'true') {
    const panels = await getPublicPanels();
    return NextResponse.json({ panels });
  }

  const panels = await getUserPanels(userId);
  return NextResponse.json({ panels });
}

export async function POST(req: NextRequest) {
  const { userId } = await getUserIdFromRequest(req);
  const { name, agentIds, categoryId } = await req.json();

  if (!name || !agentIds || agentIds.length === 0) {
    return NextResponse.json({ error: 'name and agentIds required' }, { status: 400 });
  }

  const id = await savePanel(userId, name, agentIds, categoryId);
  return NextResponse.json({ id });
}

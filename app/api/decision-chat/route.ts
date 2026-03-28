import { NextRequest, NextResponse } from 'next/server';
import { chatWithMemory } from '@/lib/chat/chat';
import { getUserDecisionContextFromMetadata, getUserIdFromRequest } from '@/lib/auth/supabase-server';

export async function POST(req: NextRequest) {
  const { userId, isAuthenticated } = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { message, history = [] } = body;

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  try {
    const settingsDecisionContext = isAuthenticated ? await getUserDecisionContextFromMetadata() : '';
    const result = await chatWithMemory(userId, message, history, 'default', {
      settingsDecisionContext,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('DECISION-CHAT API error:', err);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}

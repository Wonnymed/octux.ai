import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations, createConversation } from '@/lib/conversation/manager';
import { getUserIdFromRequest } from '@/lib/auth/supabase-server';

// GET — list user's conversations (for sidebar)
export async function GET(req: NextRequest) {
  const { userId } = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ conversations: [] });

  const conversations = await getUserConversations(userId, 30);
  return NextResponse.json({ conversations });
}

// POST — create new conversation
export async function POST(req: NextRequest) {
  const { userId } = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { firstMessage } = await req.json().catch(() => ({ firstMessage: undefined }));
  const id = await createConversation(userId, firstMessage);
  return NextResponse.json({ id });
}

import { NextRequest, NextResponse } from 'next/server';
import { chatWithAgent, type AgentChatMessage } from '@/lib/agent-chat/chat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { simulationId, agentId, message, history } = body;

    if (!simulationId || !agentId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: simulationId, agentId, message' },
        { status: 400 }
      );
    }

    // Generate anonymous userId (same pattern as simulate/stream/route.ts)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'anonymous';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const fingerprint = `${ip}-${userAgent}`.substring(0, 100);

    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const userId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 36);

    // Validate history format
    const chatHistory: AgentChatMessage[] = Array.isArray(history)
      ? history.slice(-10).map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').substring(0, 2000),
        }))
      : [];

    const response = await chatWithAgent({
      simulationId,
      agentId,
      userId,
      message: String(message).substring(0, 2000),
      history: chatHistory,
    });

    return NextResponse.json(response);

  } catch (err) {
    console.error('AGENT CHAT API error:', err);
    return NextResponse.json(
      { error: 'Failed to process agent chat request' },
      { status: 500 }
    );
  }
}

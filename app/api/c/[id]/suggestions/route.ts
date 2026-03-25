import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/supabase-server';
import { generateSuggestions, type SuggestionInput, type SuggestionContext } from '@/lib/suggestions/generate';
import { supabase } from '@/lib/memory/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = await req.json();
    const context: SuggestionContext = body.context || 'post_chat';

    // Fetch conversation for context
    let convTitle = '';
    let recentMessages: { role: string; content: string }[] = [];

    if (supabase) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('title, messages')
        .eq('id', conversationId)
        .single();

      if (conv) {
        convTitle = conv.title || '';
        const messages = conv.messages || [];
        recentMessages = messages
          .filter((m: any) => m.role === 'user' || m.role === 'assistant')
          .slice(-4)
          .map((m: any) => ({ role: m.role, content: m.content || '' }));
      }
    }

    const input: SuggestionInput = {
      context,
      conversationTitle: convTitle,
    };

    if (context === 'post_verdict' && body.verdict) {
      input.verdict = body.verdict;
    } else if (context === 'post_chat') {
      input.recentMessages = recentMessages;
    } else if (context === 'post_agent_chat') {
      input.agentName = body.agentName;
      input.agentCategory = body.agentCategory;
      input.agentLastResponse = body.agentLastResponse;
    }

    const suggestions = await generateSuggestions(input);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestion generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}

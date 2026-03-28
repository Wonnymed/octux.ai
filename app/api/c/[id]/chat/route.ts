/**
 * Unified chat endpoint for a conversation.
 * Handles: text messages, simulation triggers, refinements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { addMessage, getConversationMessages } from '@/lib/conversation/manager';
import { chatWithMemory } from '@/lib/chat/chat';
import { refineSimulation } from '@/lib/chat/refine';
import { getUserDecisionContextFromMetadata, getUserIdFromRequest } from '@/lib/auth/supabase-server';
import {
  checkSimulationStart,
  ensureUserSubscription,
  getTokenBalance,
} from '@/lib/billing/usage';
import { parseSimulationChargeType, getTokenCost } from '@/lib/billing/token-costs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, isAuthenticated } = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: conversationId } = await params;
  const body = await req.json();
  const { message, action, simulationId, modification } = body;

  // ═══ ACTION: CHAT MESSAGE ═══
  if (!action || action === 'chat') {
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    await addMessage(conversationId, userId, {
      message_type: 'text',
      role: 'user',
      content: message,
      model_tier: 'default',
    });

    const recentMsgs = await getConversationMessages(conversationId, 20);
    const history = recentMsgs
      .filter((m) => m.message_type === 'text' && m.content)
      .slice(-10)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content! }));

    const settingsDecisionContext = isAuthenticated ? await getUserDecisionContextFromMetadata() : '';

    const result = await chatWithMemory(userId, message, history, 'default', {
      settingsDecisionContext,
    });

    const msgType = result.suggestSimulation ? 'decision_card' : 'text';
    await addMessage(conversationId, userId, {
      message_type: msgType,
      role: 'assistant',
      content: result.response,
      model_tier: result.tier,
      structured_data: result.suggestSimulation
        ? {
            suggest_simulation: true,
            simulation_prompt: result.simulationPrompt,
            related_simulations: result.relatedSimulations,
            disclaimer: result.disclaimer,
          }
        : result.disclaimer
          ? { disclaimer: result.disclaimer }
          : undefined,
    });

    return NextResponse.json(result);
  }

  // ═══ ACTION: TRIGGER SIMULATION ═══
  if (action === 'simulate') {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Sign in required to run simulations.' },
        { status: 401 },
      );
    }

    const question = message || body.question;
    if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 });

    await ensureUserSubscription(userId);

    const simMode = parseSimulationChargeType(body.simMode);
    const gate = await checkSimulationStart(userId, simMode);
    if (!gate.allowed) {
      return NextResponse.json(
        {
          error: 'forbidden',
          message: gate.reason,
          upgradeRequired: gate.upgradeRequired,
          tokensUsed: gate.tokensUsed,
          tokensTotal: gate.tokensTotal,
        },
        { status: 403 },
      );
    }

    const balance = await getTokenBalance(userId);
    const tokenCost = getTokenCost(simMode);

    const agentIds: string[] | undefined = body.agentIds;
    const includeSelf: boolean | undefined = body.includeSelf;
    const joker: Record<string, unknown> | null | undefined = body.joker;
    const agentOverrides: Record<string, unknown> | undefined = body.agentOverrides;
    let panelTier: "swarm" | "specialist" | undefined =
      body.panelTier === "swarm" || body.panelTier === "specialist" ? body.panelTier : undefined;
    if (simMode === "stress_test" || simMode === "premortem") {
      panelTier = "specialist";
    }

    await addMessage(conversationId, userId, {
      message_type: 'simulation_start',
      role: 'system',
      content: question,
      structured_data: {
        simMode,
        tokenCost,
        tokensRemaining: balance.tokensRemaining,
        question,
        agentIds,
        includeSelf,
        joker,
        agentOverrides,
      },
    });

    const streamBody = {
      question,
      engine: 'simulate',
      conversationId,
      simMode,
      joker: joker ?? null,
      agentOverrides: agentOverrides ?? {},
      agentIds,
      includeSelf,
      panelTier,
    };

    return NextResponse.json({
      action: 'simulate',
      question,
      conversationId,
      simMode,
      tokenCost,
      tokensRemaining: balance.tokensRemaining,
      streamBody,
    });
  }

  // ═══ ACTION: REFINE SIMULATION ═══
  if (action === 'refine') {
    if (!simulationId || !modification) {
      return NextResponse.json({ error: 'simulationId and modification required' }, { status: 400 });
    }

    const result = await refineSimulation({
      simulationId,
      modification,
      userId,
      tier: 'default',
    });
    if (!result) return NextResponse.json({ error: 'Refinement failed' }, { status: 500 });

    await addMessage(conversationId, userId, {
      message_type: 'refinement',
      role: 'assistant',
      structured_data: result,
      model_tier: 'default',
      simulation_id: simulationId,
    });

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

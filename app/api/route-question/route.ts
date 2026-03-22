import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MODELS } from "../../lib/models";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const maxDuration = 15;

const SYSTEM_PROMPT = `You are Signux's question router. Given a user's business question, classify it into exactly ONE primary engine.

THE 6 ENGINES:
- simulate: "Should I do this?" — yes/no decisions, tradeoffs, strategic judgment calls, comparing options, go/no-go, risk vs reward, evaluating a bet
- build: "How do I build this?" — execution plans, launching products, turning ideas into action, project roadmaps, MVPs, implementation steps
- grow: "How do I grow this?" — revenue, pricing, CAC/LTV, channels, traction, retention, monetization, unit economics, growth strategy
- hire: "Who should I hire?" — candidates, roles, team building, hiring timing, org structure, talent gaps, compensation
- protect: "What could go wrong?" — risk analysis, downside scenarios, compliance, legal, fragility, churn prevention, threat detection
- compete: "How do I win?" — competitors, moat, positioning, market response, differentiation, competitive strategy

RULES:
1. Pick the SINGLE best engine based on the core intent of the question
2. Assign confidence: "high" (clearly one engine), "medium" (likely one but could be another), "low" (ambiguous or too vague)
3. If confidence is low, provide a short clarification question (max 15 words)
4. If there's a reasonable secondary engine, name it
5. Provide a one-sentence reasoning (max 20 words)

Return ONLY valid JSON:
{
  "engine": "simulate" | "build" | "grow" | "hire" | "protect" | "compete",
  "confidence": "high" | "medium" | "low",
  "reasoning": "short explanation of why this engine",
  "alternate": "second-best engine or null",
  "clarification": "question to ask if low confidence, or null"
}`;

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return NextResponse.json(
        { error: "Question too short", clarification: "This needs a little more context." },
        { status: 400 },
      );
    }

    const response = await client.messages.create({
      model: MODELS.fast,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: question.trim() }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ engine: "simulate", confidence: "medium", reasoning: "Could not parse routing", alternate: null, clarification: null });
    }

    const result = JSON.parse(jsonMatch[0]);
    const validEngines = ["simulate", "build", "grow", "hire", "protect", "compete"];
    if (!validEngines.includes(result.engine)) {
      result.engine = "simulate";
      result.confidence = "medium";
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Route question error:", error);
    return NextResponse.json(
      { engine: "simulate", confidence: "low", reasoning: "Routing unavailable", alternate: null, clarification: "Could you describe the decision in more detail?" },
      { status: 200 },
    );
  }
}

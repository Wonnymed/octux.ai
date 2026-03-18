import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { message, response } = await req.json();
  try {
    const result = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 30,
      system: "Generate a concise 3-6 word title for this conversation. Return ONLY the title, nothing else. No quotes, no punctuation at the end.",
      messages: [{ role: "user", content: `User said: ${message?.slice(0, 200)}\nAI replied about: ${response?.slice(0, 100)}` }],
    });
    const title = (result.content[0] as { type: string; text: string }).text?.trim() || "";
    return NextResponse.json({ title });
  } catch {
    return NextResponse.json({ title: message?.slice(0, 50) || "New conversation" });
  }
}

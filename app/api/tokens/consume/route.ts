import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/usage";
import { consumeTokens, ACTION_COSTS } from "../../../lib/tokens";

export async function POST(req: NextRequest) {
  const userId = await getUserFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Sign in to use this feature" }, { status: 401 });
  }

  const { action, metadata } = await req.json();
  if (!action || !(action in ACTION_COSTS)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const result = await consumeTokens(userId, action, metadata);
  if (!result.success) {
    return NextResponse.json(
      { error: "Insufficient tokens", remaining: result.remaining, cost: ACTION_COSTS[action] },
      { status: 403 },
    );
  }

  return NextResponse.json({ success: true, remaining: result.remaining, cost: ACTION_COSTS[action] });
}

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/usage";
import { getTokenStatus, getGuestTokenStatus, PLAN_TOKENS, PLAN_FEATURES, ACTION_COSTS } from "../../lib/tokens";

export async function GET(req: NextRequest) {
  const userId = await getUserFromRequest(req);

  if (!userId) {
    // Return guest defaults (actual tracking is client-side)
    return NextResponse.json({
      ...getGuestTokenStatus(),
      costs: ACTION_COSTS,
    });
  }

  const status = await getTokenStatus(userId);
  return NextResponse.json({ ...status, costs: ACTION_COSTS });
}

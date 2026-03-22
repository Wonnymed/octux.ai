import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { TIER_LIMITS, type Tier } from "./plans";

/**
 * Extract user ID from Supabase auth cookies in API routes.
 */
export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get user's current tier from user_subscriptions table.
 */
export async function getUserTier(userId: string): Promise<Tier> {
  const { createServerClient: createSC } = await import("../lib/supabase");
  const supabase = createSC();
  const { data } = await supabase
    .from("user_subscriptions")
    .select("tier, status, current_period_end")
    .eq("user_id", userId)
    .single();

  if (!data) return "free";

  // Founding members have lifetime access
  if (data.tier === "founding") return "founding";

  // Check if subscription is active and not expired
  if (data.status === "active" && data.current_period_end) {
    if (new Date(data.current_period_end) > new Date()) {
      return data.tier as Tier;
    }
  }

  // Active status without period end (e.g. founding)
  if (data.status === "active") return data.tier as Tier;

  return "free";
}

/**
 * Get usage for today (chat) or this month (simulate/research/protect/hire).
 */
export async function getUsage(userId: string): Promise<{
  chat_today: number;
  simulations_month: number;
  researches_month: number;
  protect_month: number;
  hire_month: number;
}> {
  const { createServerClient: createSC } = await import("../lib/supabase");
  const supabase = createSC();
  const today = new Date().toISOString().split("T")[0];

  // Today's usage
  const { data: todayData } = await supabase
    .from("usage_tracking")
    .select("chat_messages, simulations, researches, globalops, invest")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  // Monthly total
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split("T")[0];

  const { data: monthData } = await supabase
    .from("usage_tracking")
    .select("simulations, researches, globalops, invest")
    .eq("user_id", userId)
    .gte("date", monthStartStr);

  const simMonth = monthData?.reduce((s, d) => s + (d.simulations || 0), 0) || 0;
  const resMonth = monthData?.reduce((s, d) => s + (d.researches || 0), 0) || 0;
  const protectMonth = monthData?.reduce((s, d) => s + (d.globalops || 0), 0) || 0;
  const hireMonth = monthData?.reduce((s, d) => s + (d.invest || 0), 0) || 0;

  return {
    chat_today: todayData?.chat_messages || 0,
    simulations_month: simMonth,
    researches_month: resMonth,
    protect_month: protectMonth,
    hire_month: hireMonth,
  };
}

/**
 * Increment usage counter.
 */
export async function incrementUsage(userId: string, field: "chat_messages" | "simulations" | "researches" | "globalops" | "invest") {
  const { createServerClient: createSC } = await import("../lib/supabase");
  const supabase = createSC();
  const today = new Date().toISOString().split("T")[0];

  // Upsert: create row if not exists, increment if exists
  const { data: existing } = await supabase
    .from("usage_tracking")
    .select("id, " + field)
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing) {
    await supabase
      .from("usage_tracking")
      .update({ [field]: (existing[field] || 0) + 1 })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("usage_tracking")
      .insert({ user_id: userId, date: today, [field]: 1 });
  }
}

/**
 * Get tier directly from request (combines getUserFromRequest + getUserTier).
 */
export async function getTierFromRequest(req: NextRequest): Promise<Tier> {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return "free";
    return getUserTier(userId);
  } catch {
    return "free";
  }
}

/**
 * Check if user can perform action. Returns null if allowed, or error response if blocked.
 */
export async function checkUsageLimit(
  userId: string | null,
  action: "chat" | "simulate" | "research" | "protect" | "hire"
): Promise<NextResponse | null> {
  // No user = treat as free with no tracking
  if (!userId) {
    if (action !== "chat") {
      return NextResponse.json(
        { error: "Sign in and upgrade to use this feature.", upgrade: true },
        { status: 403 }
      );
    }
    return null; // Allow anonymous chat (rate-limited by IP already)
  }

  const tier = await getUserTier(userId);
  const limits = TIER_LIMITS[tier];
  const usage = await getUsage(userId);

  if (action === "chat" && usage.chat_today >= limits.chat_daily) {
    return NextResponse.json(
      { error: "You've used all your messages for today. Unlock unlimited to keep going.", upgrade: true, tier },
      { status: 403 }
    );
  }

  if (action === "simulate" && usage.simulations_month >= limits.simulate_monthly) {
    return NextResponse.json(
      { error: tier === "free"
        ? "You've used your free simulation this month. Unlock more to keep predicting."
        : `You've used ${usage.simulations_month}/${limits.simulate_monthly} simulations this month. Upgrade to Max for unlimited.`,
        upgrade: true, tier, usage: usage.simulations_month, limit: limits.simulate_monthly },
      { status: 403 }
    );
  }

  if (action === "research" && usage.researches_month >= limits.research_monthly) {
    return NextResponse.json(
      { error: tier === "free"
        ? "Deep research is available for Pro users. See what you're missing."
        : `You've used ${usage.researches_month}/${limits.research_monthly} researches this month. Upgrade to Max for unlimited.`,
        upgrade: true, tier, usage: usage.researches_month, limit: limits.research_monthly },
      { status: 403 }
    );
  }

  if (action === "protect" && usage.protect_month >= limits.protect_monthly) {
    return NextResponse.json(
      { error: tier === "pro"
        ? `You've used ${usage.protect_month}/${limits.protect_monthly} Protect analyses this month. Upgrade to Max for unlimited.`
        : "Protect is available for Pro users. See what you're missing.",
        upgrade: true, tier, usage: usage.protect_month, limit: limits.protect_monthly },
      { status: 403 }
    );
  }

  if (action === "hire" && usage.hire_month >= limits.hire_monthly) {
    return NextResponse.json(
      { error: tier === "pro"
        ? `You've used ${usage.hire_month}/${limits.hire_monthly} Hire analyses this month. Upgrade to Max for unlimited.`
        : "Hire mode is available for Pro users. See what you're missing.",
        upgrade: true, tier, usage: usage.hire_month, limit: limits.hire_monthly },
      { status: 403 }
    );
  }

  return null;
}

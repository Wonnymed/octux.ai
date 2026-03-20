import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, contextType, summary, keyInsights, metadata } = await req.json();

  if (!userId || !summary) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Keep max 20 contexts per user
  const { count } = await supabase
    .from("user_context")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count >= 20) {
    const { data: oldest } = await supabase
      .from("user_context")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (oldest) {
      await supabase.from("user_context").delete().eq("id", oldest.id);
    }
  }

  const { data, error } = await supabase
    .from("user_context")
    .insert({
      user_id: userId,
      context_type: contextType,
      summary: summary.slice(0, 500),
      key_insights: keyInsights || [],
      metadata: metadata || {},
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ contexts: [] });

  const { data } = await supabase
    .from("user_context")
    .select("context_type, summary, key_insights, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({ contexts: data || [] });
}

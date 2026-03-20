import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyClientToken } from "../../lib/security";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const tokenError = verifyClientToken(req);
  if (tokenError) return tokenError;

  const { userId, type, query, context, frequency } = await req.json();

  if (!userId || !query) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("intelligence_watches")
    .insert({ user_id: userId, type, query, context: context?.slice(0, 500), frequency: frequency || "weekly" })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, status: "watching" });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ watches: [], count: 0 });

  const { data, count } = await supabase
    .from("intelligence_watches")
    .select("id, type, query, frequency, status, created_at", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ watches: data || [], count: count || 0 });
}

export async function DELETE(req: NextRequest) {
  const tokenError = verifyClientToken(req);
  if (tokenError) return tokenError;

  const { watchId, userId } = await req.json();
  if (!watchId || !userId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await supabase
    .from("intelligence_watches")
    .update({ status: "expired" })
    .eq("id", watchId)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: "removed" });
}

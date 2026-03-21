import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "../../../lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { scenario, variables, rounds, verdict, evolution } = body;

    if (!scenario || !rounds) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("simulations")
      .insert({
        user_id: user.id,
        scenario,
        variables: variables || null,
        rounds,
        verdict: verdict || null,
        evolution: evolution || null,
      })
      .select("id, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ id: data.id, created_at: data.created_at });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

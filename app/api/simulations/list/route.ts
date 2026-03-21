import { NextResponse } from "next/server";
import { createSupabaseServer } from "../../../lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("simulations")
      .select("id, scenario, created_at, verdict")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyClientToken } from "../../lib/security";
import { getUserFromRequest } from "../../lib/usage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* GET — list user's projects */
export async function GET(req: NextRequest) {
  try {
    const tokenError = verifyClientToken(req);
    if (tokenError) return tokenError;

    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    console.error("Projects GET error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/* POST — create a new project */
export async function POST(req: NextRequest) {
  try {
    const tokenError = verifyClientToken(req);
    if (tokenError) return tokenError;

    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, color } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: name.trim().slice(0, 100),
        description: description?.slice(0, 500) || "",
        color: color || "#D4AF37",
        summary: "",
        conversation_count: 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    console.error("Projects POST error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/* PATCH — update a project */
export async function PATCH(req: NextRequest) {
  try {
    const tokenError = verifyClientToken(req);
    if (tokenError) return tokenError;

    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, name, description, color, archived } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim().slice(0, 100);
    if (description !== undefined) updates.description = description.slice(0, 500);
    if (color !== undefined) updates.color = color;
    if (archived !== undefined) updates.archived = archived;

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    console.error("Projects PATCH error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

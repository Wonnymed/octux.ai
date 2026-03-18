import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** Singleton browser client */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Browser client — uses anon key, respects RLS */
export function createBrowserClient() {
  return supabase;
}

/** Server client — uses service role key, bypasses RLS. Use only in API routes. */
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

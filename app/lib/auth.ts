"use client";
import { useState, useEffect } from "react";
import { supabase, createBrowserClient } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/** React hook for auth state */
export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOutFn = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/chat";
  };

  return { user, loading, signOut: signOutFn };
}

/** Get the currently authenticated user (browser-side) */
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const sb = createBrowserClient();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

/** Sign out and redirect to /chat */
export async function signOut() {
  const sb = createBrowserClient();
  await sb.auth.signOut();
  window.location.href = "/chat";
}

/** Listen for auth state changes */
export function onAuthStateChange(callback: (user: SupabaseUser | null) => void) {
  const sb = createBrowserClient();
  const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return subscription;
}

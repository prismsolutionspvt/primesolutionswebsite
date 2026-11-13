"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./env";

/** Browser client (publishable key + the visitor's own session). Used only where the user's session is needed. */
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

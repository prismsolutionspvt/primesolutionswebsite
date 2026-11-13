import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./env";

/** Cookie-less, session-less client for PUBLIC reads (cached site content) and public form inserts. Acts as `anon`. */
export function createAnonSupabase() {
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

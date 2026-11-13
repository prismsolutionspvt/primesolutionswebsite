import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminContext = { userId: string; email: string; role: "owner" };

/**
 * THE server-side authorisation check. Three independent steps, all on the server:
 *   1. supabase.auth.getUser() — the Auth server validates the session token (cookies are never trusted as-is);
 *   2. the verified user must have an e-mail;
 *   3. the database function current_admin_role() decides whether that session is the locked owner
 *      (public.owner_lock + a CONFIRMED auth user with exactly that address).
 * Anything short of that returns null. The same database function backs every Row Level Security policy, so even if
 * this code were bypassed the database would still refuse the data.
 */
export const getAdmin = cache(async (): Promise<AdminContext | null> => {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user?.email) return null;
    const { data: role, error: roleError } = await supabase.rpc("current_admin_role");
    if (roleError || role !== "owner") return null;
    return { userId: user.id, email: user.email.toLowerCase(), role: "owner" };
  } catch {
    return null;
  }
});

/** For pages and layouts: send everyone else to the sign-in screen. */
export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** For Server Actions: returns the owner, or an error result (never throws, never redirects). */
export async function authorise(): Promise<{ admin: AdminContext } | { error: { ok: false; error: string } }> {
  const admin = await getAdmin();
  if (!admin) return { error: { ok: false, error: "Your session has expired. Please sign in again." } };
  return { admin };
}

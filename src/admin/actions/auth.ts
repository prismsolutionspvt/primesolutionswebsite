"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { OWNER_EMAIL } from "@/config/owner";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getAdmin } from "@/lib/auth/admin";
import { passwordProblem } from "@/lib/password";

export type LinkState = { status: "idle" | "sent" | "invalid" | "limited" | "unavailable"; message: string };
export type PasswordState = { status: "idle" | "error"; message: string };
export type ChangeState = { status: "idle" | "done" | "error"; message: string };

const SENT = "If that address is authorised, a one-time sign-in link is on its way. It works once and expires shortly.";
const WRONG = "Incorrect email or password.";

/**
 * Sign in with email + password.
 *  • Every failure gets the SAME message and takes a similar time, so the form cannot reveal which address is the owner's.
 *  • A correct password for anyone who is not the owner still gets nowhere: the session is checked against the database's
 *    owner lock and signed straight out.
 *  • Rate-limited per visitor and per address (Supabase applies its own limits on top).
 */
export async function signInWithPassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  if (!isSupabaseConfigured) return { status: "error", message: "Sign-in is not configured on this server yet." };

  const email = z.string().trim().toLowerCase().email().max(160).safeParse(formData.get("email"));
  const password = z.string().min(1).max(128).safeParse(formData.get("password"));
  if (!email.success || !password.success) return { status: "error", message: WRONG };

  if (!rateLimit(`pw-ip:${await clientKey()}`, 8, 10 * 60_000) || !rateLimit(`pw-email:${email.data}`, 6, 10 * 60_000)) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
  if (error) return { status: "error", message: WRONG };

  const admin = await getAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    return { status: "error", message: WRONG };
  }
  redirect("/admin");
}

/**
 * Sends a one-time sign-in link (the backup way in).
 *  • The reply is IDENTICAL whether or not the address is the owner's, so the form cannot be used to discover it.
 *  • A link is only requested for the owner's address, and never creates a user (sign-ups are off in Supabase too).
 *  • Rate-limited per visitor and per address.
 */
export async function requestSignInLink(_prev: LinkState, formData: FormData): Promise<LinkState> {
  if (!isSupabaseConfigured) return { status: "unavailable", message: "Sign-in is not configured on this server yet." };

  const parsed = z.string().trim().toLowerCase().email().max(160).safeParse(formData.get("email"));
  if (!parsed.success) return { status: "invalid", message: "Please enter a valid email address." };
  const email = parsed.data;

  const ip = await clientKey();
  if (!rateLimit(`link-ip:${ip}`, 6, 10 * 60_000) || !rateLimit(`link-email:${email}`, 3, 10 * 60_000)) {
    return { status: "limited", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  if (email === OWNER_EMAIL) {
    const h = await headers();
    const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback?next=/admin` },
    });
    // The reason is logged on the server only; the visitor always sees the same neutral message.
    if (error) console.error("[auth] sign-in link was not sent:", error.message);
  }
  return { status: "sent", message: SENT };
}

/** The signed-in owner chooses a new password. The password is never logged or stored by this app. */
export async function changeOwnerPassword(_prev: ChangeState, formData: FormData): Promise<ChangeState> {
  const admin = await getAdmin();
  if (!admin) return { status: "error", message: "Your session has expired. Please sign in again." };

  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next !== confirm) return { status: "error", message: "The two passwords do not match." };
  const problem = passwordProblem(next, admin.email);
  if (problem) return { status: "error", message: problem };
  if (!rateLimit(`pw-change:${admin.userId}`, 5, 10 * 60_000)) return { status: "error", message: "Too many attempts. Please wait a few minutes." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    console.error("[auth] password change failed:", error.message);
    return { status: "error", message: "The password could not be changed. If you signed in a while ago, sign out, sign in again and retry." };
  }
  return { status: "done", message: "Password changed. Use it next time you sign in." };
}

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

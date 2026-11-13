"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { OWNER_EMAIL } from "@/config/owner";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export type LinkState = { status: "idle" | "sent" | "invalid" | "limited" | "unavailable"; message: string };

const SENT = "If that address is authorised, a one-time sign-in link is on its way. It works once and expires shortly.";

/**
 * Sends a one-time sign-in link.
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

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

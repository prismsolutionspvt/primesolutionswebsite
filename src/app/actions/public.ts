"use server";
import { createAnonSupabase } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { enquirySchema, fieldErrorsOf, reviewSchema, type EnquiryInput, type FormResult, type ReviewInput } from "@/lib/validation/public";

/**
 * PUBLIC form actions. They run as the anonymous role: the database (Row Level Security + column grants) only lets
 * `anon` INSERT a pending review or a new enquiry, never read, change or publish anything. Layers, in order:
 *   honeypot + fill-time → per-visitor rate limit → server-side validation → database constraints → global flood guard.
 */

type InsertError = { code?: string; message?: string } | null;
const dbFailure = (e: InsertError): FormResult => {
  if (e?.code === "23505") return { ok: true }; // same idempotency token: the first submission already succeeded
  if (e?.message?.includes("Too many submissions")) return { ok: false, error: "We are receiving a lot of submissions right now. Please try again in a little while." };
  console.error("[public form] insert failed:", e?.code, e?.message);
  return { ok: false, error: "We could not save that just now. Please try again in a moment." };
};

export async function submitReview(input: ReviewInput): Promise<FormResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    // a filled honeypot or a too-fast submission looks like success to the bot
    const keys = parsed.error.issues.map((i) => i.path[0]);
    if (keys.includes("trap") || keys.includes("elapsed")) return { ok: true };
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  if (!isSupabaseConfigured) return { ok: false, error: "Reviews are not available right now. Please try again later." };
  if (!rateLimit(`review:${await clientKey()}`, 4, 60 * 60_000)) return { ok: false, error: "You have sent several reviews recently. Please try again later." };

  const { name, company, rating, text, token } = parsed.data;
  const { error } = await createAnonSupabase()
    .from("testimonials")
    .insert({ name, company, rating, text, source: "visitor", status: "pending", client_token: token });
  return error ? dbFailure(error) : { ok: true };
}

/** Enquiry from the contact form. Saved to the database for the owner to review (nothing is e-mailed). */
export async function submitEnquiryAction(input: EnquiryInput): Promise<FormResult & { mode?: "saved" | "preview" }> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path[0]);
    if (keys.includes("trap") || keys.includes("elapsed")) return { ok: true, mode: "saved" };
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  // Without Supabase the form still validates, but nothing is stored: say so honestly.
  if (!isSupabaseConfigured) return { ok: true, mode: "preview" };
  if (!rateLimit(`enquiry:${await clientKey()}`, 5, 60 * 60_000)) return { ok: false, error: "You have sent several enquiries recently. Please try again later or contact us directly." };

  const { name, email, company, phone, service, message, token } = parsed.data;
  const { error } = await createAnonSupabase().from("enquiries").insert({ name, email, company, phone, service, message, client_token: token });
  return error ? dbFailure(error) : { ok: true, mode: "saved" };
}

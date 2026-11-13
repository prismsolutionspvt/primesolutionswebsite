import { submitEnquiryAction } from "@/app/actions/public";
import type { Enquiry, EnquiryErrors, EnquiryResult } from "@/types";

/** Bot-check data the form sends with every submission (see lib/validation/public.ts). */
export type SubmitMeta = { token: string; elapsed: number; trap: string };

/**
 * The only place the form talks to the backend: a Server Action that saves the enquiry in Supabase for the owner to
 * review in Admin → Enquiries. Nothing is e-mailed (no mail provider is configured). If Supabase is not configured
 * the form still validates and reports "preview": it does NOT claim to have saved anything.
 */
export async function submitEnquiry(data: Enquiry, meta: SubmitMeta): Promise<EnquiryResult> {
  try {
    const r = await submitEnquiryAction({ ...data, ...meta });
    if (r.ok) return { ok: true, mode: r.mode === "preview" ? "preview" : "saved" };
    return { ok: false, error: r.error, fieldErrors: r.fieldErrors };
  } catch {
    return { ok: false, error: "We could not reach the server. Check your connection and try again." };
  }
}

export function validate(d: Enquiry): EnquiryErrors {
  const e: EnquiryErrors = {};
  if (d.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "Please enter a valid business email address.";
  if (d.phone.trim() && !/^[+()\d\s.-]{7,24}$/.test(d.phone.trim())) e.phone = "Use digits, spaces, + or - only (7–24 characters).";
  if (!d.service) e.service = "Please choose a service.";
  if (d.message.trim().length < 10) e.message = "Please tell us a little more (at least 10 characters).";
  return e;
}

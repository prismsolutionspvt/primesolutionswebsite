import { site } from "@/lib/config";
import type { Enquiry, EnquiryErrors, EnquiryResult } from "@/types";

/**
 * ISOLATED SUBMISSION HANDLER — the only place the form talks to a backend.
 * Backend phase: set NEXT_PUBLIC_ENQUIRY_ENDPOINT (or replace this body with a server action / API route).
 * Until then it runs in "preview" mode: the data is validated but NOT stored or emailed anywhere.
 */
export async function submitEnquiry(data: Enquiry): Promise<EnquiryResult> {
  if (!site.enquiryEndpoint) {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, mode: "preview" };
  }
  try {
    const res = await fetch(site.enquiryEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, submittedAt: new Date().toISOString() }),
    });
    if (!res.ok) return { ok: false, error: "The server could not accept your enquiry. Please try again." };
    return { ok: true, mode: "delivered" };
  } catch {
    return { ok: false, error: "We could not reach the server. Check your connection and try again." };
  }
}

export function validate(d: Enquiry): EnquiryErrors {
  const e: EnquiryErrors = {};
  if (d.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "Please enter a valid business email address.";
  if (d.phone.trim() && !/^[+()\d\s-]{7,20}$/.test(d.phone.trim())) e.phone = "Use digits, spaces, + or - only (7–20 characters).";
  if (!d.service) e.service = "Please choose a service.";
  if (d.message.trim().length < 10) e.message = "Please tell us a little more (at least 10 characters).";
  return e;
}

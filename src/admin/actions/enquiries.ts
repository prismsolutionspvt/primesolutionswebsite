"use server";
import { revalidatePath } from "next/cache";
import { authorise, type ActionResult } from "@/lib/auth/admin";
import { createServerSupabase } from "@/lib/supabase/server";

import { ENQUIRY_STATUSES } from "@/admin/constants";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Guard = { supabase: Awaited<ReturnType<typeof createServerSupabase>>; email: string } | { fail: ActionResult<never> };
async function guard(): Promise<Guard> {
  const a = await authorise();
  if ("error" in a) return { fail: a.error };
  return { supabase: await createServerSupabase(), email: a.admin.email };
}

export async function setEnquiryStatus(id: string, status: string): Promise<ActionResult> {
  if (!UUID.test(id) || !(ENQUIRY_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Invalid request." };
  const g = await guard();
  if ("fail" in g) return g.fail;
  const { error } = await g.supabase.from("enquiries").update({ status }).eq("id", id);
  if (error) return { ok: false, error: "The status could not be updated." };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function addEnquiryNote(id: string, note: string): Promise<ActionResult> {
  const text = String(note ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (!UUID.test(id)) return { ok: false, error: "Invalid request." };
  if (text.length < 1 || text.length > 2000) return { ok: false, error: "A note must be between 1 and 2000 characters." };
  const g = await guard();
  if ("fail" in g) return g.fail;
  const { error } = await g.supabase.from("enquiry_notes").insert({ enquiry_id: id, note: text, author_email: g.email });
  if (error) return { ok: false, error: "The note could not be saved." };
  revalidatePath(`/admin/enquiries/${id}`);
  return { ok: true };
}

export async function deleteEnquiryNote(noteId: string, enquiryId: string): Promise<ActionResult> {
  if (!UUID.test(noteId) || !UUID.test(enquiryId)) return { ok: false, error: "Invalid request." };
  const g = await guard();
  if ("fail" in g) return g.fail;
  const { error } = await g.supabase.from("enquiry_notes").delete().eq("id", noteId);
  if (error) return { ok: false, error: "The note could not be deleted." };
  revalidatePath(`/admin/enquiries/${enquiryId}`);
  return { ok: true };
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Invalid request." };
  const g = await guard();
  if ("fail" in g) return g.fail;
  const { error } = await g.supabase.from("enquiries").delete().eq("id", id);
  if (error) return { ok: false, error: "The enquiry could not be deleted." };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

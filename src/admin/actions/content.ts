"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { authorise, type ActionResult } from "@/lib/auth/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { CONTENT_TAG } from "@/lib/content/fetch";
import { slugify } from "@/lib/slug";
import { parseFields } from "@/admin/parse";
import { RESOURCES, SINGLETONS } from "@/admin/registry";
import type { FormValues } from "@/admin/fields";

/**
 * Every mutation in the admin goes through here. Each action:
 *   1. re-verifies that the caller is the signed-in owner (never trusts the page it came from),
 *   2. validates the input on the server,
 *   3. writes with the OWNER'S OWN session, so Row Level Security is the final judge,
 *   4. clears the public cache so the website updates immediately.
 */
type Supabase = Awaited<ReturnType<typeof createServerSupabase>>;
type Guard = { supabase: Supabase; email: string } | { fail: ActionResult<never> };

async function guard(): Promise<Guard> {
  const a = await authorise();
  if ("error" in a) return { fail: a.error };
  return { supabase: await createServerSupabase(), email: a.admin.email };
}

function publish() {
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

const friendly = (e: { code?: string; message?: string }, slugField?: string): ActionResult<never> => {
  if (e.code === "23505") return { ok: false, error: "That name is already in use. Please choose another.", fieldErrors: slugField ? { [slugField]: "Already used. Please choose another." } : undefined };
  if (e.code === "42501") return { ok: false, error: "You do not have permission to do that." };
  if (e.code === "23514") return { ok: false, error: "One of the values is not allowed (too long or the wrong format). Please check the form." };
  console.error("[admin] database error:", e.code, e.message);
  return { ok: false, error: "The change could not be saved. Please try again." };
};

export type ChildRow = FormValues & { id?: string };

/** Create or update one record of a managed collection (and its child list, e.g. a service's subcategories). */
export async function saveRecord(key: string, id: string | null, raw: FormValues, childRows?: ChildRow[]): Promise<ActionResult<{ id: string }>> {
  const def = RESOURCES[key];
  if (!def) return { ok: false, error: "Unknown item type." };
  const g = await guard();
  if ("fail" in g) return g.fail;

  const parsed = parseFields(def.fields, raw);
  if (!parsed.ok) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: parsed.errors };
  const data = parsed.data;

  // slug: generated from the title when left empty
  const slugField = def.fields.find((f) => f.kind === "slug");
  if (slugField && slugField.kind === "slug") {
    if (!data[slugField.name]) data[slugField.name] = slugify(String(data[slugField.from ?? def.titleField] ?? ""));
    if (!data[slugField.name] || data[slugField.name] === "other") return { ok: false, error: "Please check the highlighted fields.", fieldErrors: { [slugField.name]: "Please enter a name or a web address name." } };
  }
  if (key === "announcements" && data.starts_at && data.ends_at && Date.parse(String(data.ends_at)) <= Date.parse(String(data.starts_at))) {
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: { ends_at: "The end must be after the start." } };
  }

  let rowId = id;
  if (id) {
    const { error } = await g.supabase.from(def.table).update(data).eq("id", id);
    if (error) return friendly(error, slugField?.name);
  } else {
    let sort_order = 10;
    if (def.order) {
      const { data: last } = await g.supabase.from(def.table).select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
      sort_order = (last?.sort_order ?? 0) + 10;
    }
    const { data: row, error } = await g.supabase.from(def.table).insert(def.order ? { ...data, sort_order } : data).select("id").single();
    if (error || !row) return friendly(error ?? {}, slugField?.name);
    rowId = row.id as string;
  }

  // child list: keep, edit, add, remove and re-order in one pass
  if (def.children && childRows && rowId) {
    const ch = def.children;
    const items: { id?: string; data: Record<string, unknown> }[] = [];
    for (const [i, c] of childRows.entries()) {
      const p = parseFields(ch.fields, c);
      if (!p.ok) return { ok: false, error: `${ch.singular} ${i + 1}: ${Object.values(p.errors)[0]}`, fieldErrors: { [`__children`]: Object.values(p.errors)[0] } };
      items.push({ id: typeof c.id === "string" ? c.id : undefined, data: p.data });
    }
    // ONE database call: the whole list is saved or none of it (see save_service_subcategories in the hardening migration)
    const { error: childError } = await g.supabase.rpc("save_service_subcategories", {
      p_service: rowId,
      p_items: items.map((it) => ({ id: it.id ?? null, title: it.data.title, detail: it.data.detail ?? "", is_published: it.data.is_published !== false })),
    });
    if (childError) return friendly(childError);
  }
  publish();
  return { ok: true, id: rowId as string };
}

export async function deleteRecord(key: string, id: string): Promise<ActionResult> {
  const def = RESOURCES[key];
  if (!def) return { ok: false, error: "Unknown item type." };
  const g = await guard();
  if ("fail" in g) return g.fail;
  const { error } = await g.supabase.from(def.table).delete().eq("id", id);
  if (error) return friendly(error);
  publish();
  return { ok: true };
}

/** Publish / unpublish, feature, approve… only whitelisted columns and values can be toggled this way. */
export async function setFlag(key: string, id: string, column: string, value: string | boolean): Promise<ActionResult> {
  const def = RESOURCES[key];
  if (!def) return { ok: false, error: "Unknown item type." };
  const allowed = def.flag?.column === column ? "boolean" : def.quick?.[column];
  if (!allowed) return { ok: false, error: "That cannot be changed here." };
  if (allowed === "boolean" ? typeof value !== "boolean" : typeof value !== "string" || !allowed.includes(value)) return { ok: false, error: "That value is not allowed." };
  const g = await guard();
  if ("fail" in g) return g.fail;
  const { error } = await g.supabase.from(def.table).update({ [column]: value }).eq("id", id);
  if (error) return friendly(error);
  publish();
  return { ok: true };
}

/** `ids` is the complete list in its new order; the database sets sort_order atomically. */
export async function reorderRecords(key: string, ids: string[]): Promise<ActionResult> {
  const def = RESOURCES[key];
  if (!def?.order) return { ok: false, error: "This list cannot be re-ordered." };
  if (!Array.isArray(ids) || ids.length > 500 || ids.some((i) => typeof i !== "string")) return { ok: false, error: "Invalid order." };
  const g = await guard();
  if ("fail" in g) return g.fail;
  const { error } = await g.supabase.rpc("reorder_rows", { p_table: def.table, p_ids: ids });
  if (error) return friendly(error);
  publish();
  return { ok: true };
}

/** Save a one-row form: a site_settings group, mission & vision, or the copy of one public section. */
export async function saveSingleton(key: string, raw: FormValues): Promise<ActionResult> {
  const def = SINGLETONS[key];
  if (!def) return { ok: false, error: "Unknown settings group." };
  const g = await guard();
  if ("fail" in g) return g.fail;

  const parsed = parseFields(def.fields, raw);
  if (!parsed.ok) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: parsed.errors };

  if (def.table === "site_sections") {
    const sectionKey = def.sectionKey as string;
    const top: Record<string, unknown> = {};
    const extraPatch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed.data)) (k.startsWith("extra.") ? extraPatch : top)[k.startsWith("extra.") ? k.slice(6) : k] = v;
    const { data: existing, error: readErr } = await g.supabase.from("site_sections").select("extra").eq("key", sectionKey).maybeSingle();
    if (readErr) return friendly(readErr);
    const extra = { ...((existing?.extra as Record<string, unknown>) ?? {}), ...extraPatch };
    const { error } = await g.supabase.from("site_sections").upsert({ key: sectionKey, ...top, extra }, { onConflict: "key" });
    if (error) return friendly(error);
  } else {
    const patch: Record<string, unknown> = { ...parsed.data };
    const { error } = await g.supabase.from(def.table).update(patch).eq("id", 1);
    if (error) return friendly(error);
  }
  publish();
  return { ok: true };
}

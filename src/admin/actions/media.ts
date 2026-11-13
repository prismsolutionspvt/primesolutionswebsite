"use server";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { authorise, type ActionResult } from "@/lib/auth/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { MEDIA_BUCKET, mediaUrl } from "@/lib/supabase/env";
import { slugify } from "@/lib/slug";
import type { MediaFolder } from "@/admin/fields";

const MAX_BYTES = 5 * 1024 * 1024;
const FOLDERS: MediaFolder[] = ["logos", "team", "services", "industries", "testimonials", "announcements", "website"];
const PAGE = 24;

/** The file's TRUE type, read from its first bytes. The browser-supplied name and MIME type are never trusted. */
function sniff(b: Uint8Array): { mime: string; ext: string } | null {
  const is = (...sig: number[]) => sig.every((v, i) => b[i] === v);
  if (is(0xff, 0xd8, 0xff)) return { mime: "image/jpeg", ext: "jpg" };
  if (is(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { mime: "image/png", ext: "png" };
  if (is(0x47, 0x49, 0x46, 0x38)) return { mime: "image/gif", ext: "gif" };
  if (is(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { mime: "image/webp", ext: "webp" };
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 && b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && (b[11] === 0x66 || b[11] === 0x73)) return { mime: "image/avif", ext: "avif" };
  if (is(0x00, 0x00, 0x01, 0x00)) return { mime: "image/x-icon", ext: "ico" };
  return null;
}

/** Everywhere an image path can be stored. A file that appears here cannot be deleted. */
const REFERENCES: [table: string, column: string, label: string][] = [
  ["services", "image_path", "Services"],
  ["industries", "image_path", "Industries"],
  ["team_members", "photo_path", "Team"],
  ["core_values", "image_path", "Core values"],
  ["why_prism_items", "image_path", "Why Prism"],
  ["approach_steps", "image_path", "Our approach"],
  ["testimonials", "photo_path", "Testimonials"],
  ["announcements", "image_path", "Announcements"],
  ["site_sections", "image_path", "Page sections"],
  ["mission_vision", "mission_image_path", "Mission"],
  ["mission_vision", "vision_image_path", "Vision"],
  ["site_settings", "logo_primary_path", "Primary logo"],
  ["site_settings", "logo_secondary_path", "Secondary logo"],
  ["site_settings", "favicon_path", "Favicon"],
  ["site_settings", "og_image_path", "Social sharing image"],
];

type Supabase = Awaited<ReturnType<typeof createServerSupabase>>;
async function usage(supabase: Supabase, path: string): Promise<string[]> {
  const found: string[] = [];
  await Promise.all(
    REFERENCES.map(async ([table, column, label]) => {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true }).eq(column, path);
      if (count) found.push(count > 1 ? `${label} (${count})` : label);
    }),
  );
  return found;
}

export type MediaItem = { id: string; path: string; url: string; filename: string; folder: string; size: number; mime: string; alt: string; createdAt: string };
type Row = { id: string; path: string; filename: string; folder: string; size_bytes: number; mime_type: string; alt_text: string; created_at: string };
const toItem = (r: Row): MediaItem => ({ id: r.id, path: r.path, url: mediaUrl(r.path), filename: r.filename, folder: r.folder, size: r.size_bytes, mime: r.mime_type, alt: r.alt_text, createdAt: r.created_at });

type Guard = { supabase: Awaited<ReturnType<typeof createServerSupabase>>; email: string } | { fail: ActionResult<never> };
async function guard(): Promise<Guard> {
  const a = await authorise();
  if ("error" in a) return { fail: a.error };
  return { supabase: await createServerSupabase(), email: a.admin.email };
}

export async function listMedia(page = 0, folder?: string): Promise<ActionResult<{ items: MediaItem[]; total: number; pageSize: number }>> {
  const g = await guard();
  if ("fail" in g) return g.fail;
  let q = g.supabase.from("media_assets").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (folder && FOLDERS.includes(folder as MediaFolder)) q = q.eq("folder", folder);
  const from = Math.max(0, Math.floor(page)) * PAGE;
  const { data, count, error } = await q.range(from, from + PAGE - 1);
  if (error) return { ok: false, error: "Could not load the media library." };
  return { ok: true, items: (data as Row[]).map(toItem), total: count ?? 0, pageSize: PAGE };
}

/** Upload a new image (or, with `replaceId`, swap the file behind an existing one while keeping its address). */
export async function uploadMedia(form: FormData): Promise<ActionResult<{ item: MediaItem }>> {
  const g = await guard();
  if ("fail" in g) return g.fail;

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "website") as MediaFolder;
  const replaceId = String(form.get("replaceId") ?? "");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Please choose an image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "That image is larger than 5 MB. Please choose a smaller one." };
  if (!FOLDERS.includes(folder)) return { ok: false, error: "Unknown folder." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return { ok: false, error: "Only JPG, PNG, WebP, AVIF, GIF or ICO images can be uploaded." };

  if (replaceId) {
    const { data: old } = await g.supabase.from("media_assets").select("*").eq("id", replaceId).maybeSingle();
    if (!old) return { ok: false, error: "The image to replace was not found." };
    if (old.mime_type !== type.mime && !(old.mime_type.includes("icon") && type.mime.includes("icon"))) return { ok: false, error: `The replacement must be the same type of file (${old.mime_type.replace("image/", "").toUpperCase()}).` };
    const up = await g.supabase.storage.from(MEDIA_BUCKET).upload(old.path, bytes, { contentType: type.mime, upsert: true, cacheControl: "3600" });
    if (up.error) return { ok: false, error: "The image could not be replaced. Please try again." };
    const { data: row, error } = await g.supabase.from("media_assets").update({ size_bytes: bytes.length }).eq("id", replaceId).select("*").single();
    if (error) return { ok: false, error: "The image was replaced, but its record could not be updated." };
    revalidatePath("/admin/media");
    return { ok: true, item: toItem(row as Row) };
  }

  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 40).replace(/^-+|-+$/g, "") || "image";
  const path = `${folder}/${base}-${randomBytes(3).toString("hex")}.${type.ext}`;
  const up = await g.supabase.storage.from(MEDIA_BUCKET).upload(path, bytes, { contentType: type.mime, upsert: false, cacheControl: "31536000" });
  if (up.error) {
    console.error("[media] upload failed:", up.error.message);
    return { ok: false, error: "The image could not be uploaded. Please try again." };
  }
  const { data: row, error } = await g.supabase
    .from("media_assets")
    .insert({ path, filename: file.name.slice(0, 200), folder, mime_type: type.mime, size_bytes: bytes.length, uploaded_by: g.email })
    .select("*")
    .single();
  if (error || !row) {
    await g.supabase.storage.from(MEDIA_BUCKET).remove([path]); // never leave an orphaned file behind
    return { ok: false, error: "The image was uploaded but could not be recorded. Please try again." };
  }
  revalidatePath("/admin/media");
  return { ok: true, item: toItem(row as Row) };
}

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  const g = await guard();
  if ("fail" in g) return g.fail;
  const clean = String(alt ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 200);
  const { error } = await g.supabase.from("media_assets").update({ alt_text: clean }).eq("id", id);
  if (error) return { ok: false, error: "Could not save the description." };
  revalidatePath("/admin/media");
  return { ok: true };
}

/** Deleting an image that is still in use would leave a broken picture on the website, so it is refused. */
export async function deleteMedia(id: string): Promise<ActionResult> {
  const g = await guard();
  if ("fail" in g) return g.fail;
  const { data: asset } = await g.supabase.from("media_assets").select("path").eq("id", id).maybeSingle();
  if (!asset) return { ok: false, error: "That image no longer exists." };
  const used = await usage(g.supabase, asset.path);
  if (used.length) return { ok: false, error: `This image is still in use (${used.join(", ")}). Replace it there first, or use “Replace” to swap the file.` };
  const rm = await g.supabase.storage.from(MEDIA_BUCKET).remove([asset.path]);
  if (rm.error) return { ok: false, error: "The file could not be removed. Please try again." };
  const { error } = await g.supabase.from("media_assets").delete().eq("id", id);
  if (error) return { ok: false, error: "The file was removed but its record could not be deleted." };
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function mediaUsageOf(path: string): Promise<ActionResult<{ used: string[] }>> {
  const g = await guard();
  if ("fail" in g) return g.fail;
  return { ok: true, used: await usage(g.supabase, path) };
}

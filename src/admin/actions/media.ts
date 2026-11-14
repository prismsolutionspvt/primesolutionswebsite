"use server";
import { randomBytes } from "node:crypto";
import { authorise, type ActionResult } from "@/lib/auth/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { MEDIA_BUCKET, mediaUrl } from "@/lib/supabase/env";
import { slugify } from "@/lib/slug";
import type { MediaFolder } from "@/admin/fields";

/**
 * Image upload and browsing for the image picker used by every image field (services, team, industries…).
 * There is no separate media-library screen: the picker lists what was uploaded so a picture can be reused.
 */
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
  if (error) return { ok: false, error: "Could not load your images." };
  return { ok: true, items: (data as Row[]).map(toItem), total: count ?? 0, pageSize: PAGE };
}

/** Upload a new image into one of the fixed folders. Owner-only; storage policies and the bucket repeat every limit. */
export async function uploadMedia(form: FormData): Promise<ActionResult<{ item: MediaItem }>> {
  const g = await guard();
  if ("fail" in g) return g.fail;

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "website") as MediaFolder;
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Please choose an image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "That image is larger than 5 MB. Please choose a smaller one." };
  if (!FOLDERS.includes(folder)) return { ok: false, error: "Unknown folder." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return { ok: false, error: "Only JPG, PNG, WebP, AVIF, GIF or ICO images can be uploaded." };

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
  return { ok: true, item: toItem(row as Row) };
}

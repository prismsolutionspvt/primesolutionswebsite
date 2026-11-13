/**
 * Supabase configuration (PUBLIC values only).
 * NEXT_PUBLIC_* values are embedded in the browser bundle. The publishable key is designed to be public:
 * what a visitor can do with it is decided entirely by Row Level Security in the database.
 * The app never uses (or needs) a service-role key.
 */
export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
export const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
export const isSupabaseConfigured = supabaseUrl.startsWith("https://") && supabaseKey.length > 20;

/** Storage bucket for public website images (see supabase/migrations/…_storage.sql). */
export const MEDIA_BUCKET = "site-media";

/** Public URL of an image stored in the media bucket. Returns "" when there is no path. */
export function mediaUrl(path?: string | null): string {
  if (!path || !supabaseUrl) return "";
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

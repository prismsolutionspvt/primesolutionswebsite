# Storage and the media library

## What exists

One **public** bucket, `site-media`, created by `supabase/migrations/…0400_storage.sql`:

- **Public** here means "anyone who has the file's address can view it", exactly like an image on any web page. It is used only for images that appear on the public website. Nothing private (documents, exports, admin files) belongs in it. Private files, if ever needed, should go in a separate **private** bucket with signed URLs.
- **Limit:** 5 MB per file. **Allowed types:** JPEG, PNG, WebP, AVIF, GIF, ICO. **SVG is deliberately refused** (it can contain script).
- Visitors **cannot list** the bucket (there is no public `SELECT` policy); they can only fetch known URLs.
- Only the **owner** can upload, replace or delete (storage policies call `is_owner()`).

Folders (paths are `<folder>/<name>-<random>.<ext>`): `logos/`, `team/`, `services/`, `industries/`, `testimonials/`, `announcements/`, `website/`.

## How an upload is checked

`src/admin/actions/media.ts` (a Server Action, owner-only):

1. size ≤ 5 MB;
2. the file's **real type is read from its first bytes** (the browser's file name and MIME type are never trusted); anything that is not a recognised image is refused;
3. the name is rewritten to a safe slug plus a random suffix (no overwriting, no path tricks);
4. the file goes to the bucket **with the owner's session**, so storage policies apply;
5. a row is added to `media_assets`; if that fails the file is removed again (no orphans).

The bucket repeats the size and type limits on its own, so they hold even if the app were bypassed.

## Using images

The image fields left in the admin are the team photograph, the service image and the industry image; each opens a picker (choose an uploaded image or upload a new one). The optional image fields on values, why, approach, about, mission, vision, testimonials and announcements were removed (most were never displayed on the website). Their database columns are kept, so nothing stored is lost and a field can be switched back on later. There is no separate library screen, and no way to delete or replace an uploaded file from the admin: files stay in the bucket (and in `media_assets`) once uploaded. Delete unused ones in the Supabase dashboard (Storage → site-media) only after checking that no page uses them.

## Delivery

Public images are served from Supabase's CDN URL. Section images use `next/image` (resizing, AVIF/WebP) via the `remotePatterns` entry in `next.config.mjs`; **rebuild after changing `NEXT_PUBLIC_SUPABASE_URL`**. Uploads are given a one-year cache header (each upload gets a new random name, so a changed picture is a new file).

## Not done

Deleting or replacing files from the admin, image dimension checks, automatic resizing on upload, virus scanning and per-folder quotas. Reserved for later.

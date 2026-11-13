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

## Using and replacing images

Every image field in the admin opens the same picker (choose an existing image or upload a new one), so one picture can be reused anywhere. **Replace** (in the Media Library) swaps the file behind an existing image *and keeps its address*, so every place that uses it updates. It must be the same file type.

**Delete** is refused while the image is used anywhere (the list of places is shown). Referenced locations are listed in `REFERENCES` in `media.ts`; add a line there when you add an image column.

## Delivery

Public images are served from Supabase's CDN URL. Section images use `next/image` (resizing, AVIF/WebP) via the `remotePatterns` entry in `next.config.mjs`; **rebuild after changing `NEXT_PUBLIC_SUPABASE_URL`**. Uploads are given a one-year cache header, which is why *Replace* keeps a short (1 h) cache.

## Not done

Image dimension checks, automatic resizing on upload, virus scanning, per-folder quotas, and a "where is this used?" panel on every image (the list appears when deleting). Reserved for the audit.

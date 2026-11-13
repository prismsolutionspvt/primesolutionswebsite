-- ════════════════════════════════════════════════════════════════════════════
-- 04 · STORAGE
--
-- One PUBLIC bucket, `site-media`, for images that appear on the public website (logos, team photos, service /
-- industry / announcement imagery). Public means "anyone with the URL can view the file", the same as an image on
-- any web page. Nothing private (documents, exports, admin files) is ever stored here.
--
-- Only the OWNER can upload, replace or delete. The bucket itself enforces a 5 MB limit and an image-only MIME
-- allow-list (SVG is deliberately excluded because it can carry script).
-- There is no public SELECT policy on storage.objects: visitors cannot list the bucket, only fetch known URLs.
-- ════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "site-media owner read"   on storage.objects for select to authenticated
  using (bucket_id = 'site-media' and (select public.is_owner()));
create policy "site-media owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and (select public.is_owner()));
create policy "site-media owner update" on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and (select public.is_owner()))
  with check (bucket_id = 'site-media' and (select public.is_owner()));
create policy "site-media owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and (select public.is_owner()));

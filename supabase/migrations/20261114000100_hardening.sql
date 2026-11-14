-- ════════════════════════════════════════════════════════════════════════════
-- 06 · HARDENING (security review, additive, nothing is dropped)
--
-- 1. Trigger helper functions are not callable by API roles.
-- 2. The public can no longer read site_settings.updated_by (an administrator's e-mail address).
-- 3. reorder_rows() no longer needs elevated rights (SECURITY INVOKER: Row Level Security applies to the caller).
-- 4. Saving a service's subcategories is ONE atomic operation (all or nothing) via save_service_subcategories().
--
-- Remaining SECURITY DEFINER functions and why each is necessary and safe:
--   is_owner / current_admin_role : must read auth.users and owner_lock, which no API role may read.
--   log_activity                  : must write activity_log on behalf of visitors' inserts (visitors cannot write it).
--   throttle_public_inserts       : must COUNT enquiries/reviews, which visitors cannot read.
--   All use `set search_path = ''` (no search-path hijacking), fully-qualified names, and take no caller-controlled SQL.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. trigger functions: nobody calls these directly ─────────────────────
revoke all on function public.touch_updated_at()          from public, anon, authenticated;
revoke all on function public.log_activity()              from public, anon, authenticated;
revoke all on function public.throttle_public_inserts()   from public, anon, authenticated;

-- ─── 2. no administrator e-mail in a publicly readable column ──────────────
update public.site_settings set updated_by = null where id = 1;   -- the activity log (owner-only) already records who changed what

-- anonymous visitors may read every settings column EXCEPT updated_by.
-- NOTE: a migration that adds a column to site_settings must also `grant select (new_column) ... to anon`
-- (the test suite fails if a column is forgotten, so the public site cannot silently lose a setting).
revoke select on public.site_settings from anon;
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'site_settings' and column_name <> 'updated_by';
  execute format('grant select (%s) on public.site_settings to anon', cols);
end $$;

-- ─── 3. reorder_rows: run with the caller's rights ─────────────────────────
alter function public.reorder_rows(text, uuid[]) security invoker;

-- ─── 4. atomic subcategory save ────────────────────────────────────────────
-- p_items: [{ "id": uuid|null, "title": text, "detail": text, "is_published": bool }, …] in display order.
-- Rows not listed are deleted, listed rows are updated, new rows are inserted, order follows the array.
-- It is one function call, so Postgres runs it as a single transaction: any invalid item undoes the whole save.
-- SECURITY INVOKER: Row Level Security applies to the owner's session; the explicit owner check is defence in depth.
create or replace function public.save_service_subcategories(p_service uuid, p_items jsonb)
returns void
language plpgsql security invoker set search_path = ''
as $$
declare
  it    jsonb;
  pos   integer := 0;
  keep  uuid[];
begin
  if not (select public.is_owner()) then
    raise exception 'Not authorised.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) > 100 then
    raise exception 'Invalid subcategory list.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.services where id = p_service) then
    raise exception 'Service not found.' using errcode = '22023';
  end if;

  select coalesce(array_agg((e ->> 'id')::uuid) filter (where nullif(e ->> 'id', '') is not null), '{}')
    into keep from jsonb_array_elements(p_items) e;

  delete from public.service_subcategories where service_id = p_service and not (id = any (keep));

  for it in select value from jsonb_array_elements(p_items) loop
    pos := pos + 1;
    if nullif(it ->> 'id', '') is not null then
      update public.service_subcategories
         set title = it ->> 'title',
             detail = coalesce(it ->> 'detail', ''),
             is_published = coalesce((it ->> 'is_published')::boolean, true),
             sort_order = pos * 10
       where id = (it ->> 'id')::uuid and service_id = p_service;
    else
      insert into public.service_subcategories (service_id, title, detail, is_published, sort_order)
      values (p_service, it ->> 'title', coalesce(it ->> 'detail', ''), coalesce((it ->> 'is_published')::boolean, true), pos * 10);
    end if;
  end loop;
end $$;

revoke all on function public.save_service_subcategories(uuid, jsonb) from public, anon;
grant execute on function public.save_service_subcategories(uuid, jsonb) to authenticated;

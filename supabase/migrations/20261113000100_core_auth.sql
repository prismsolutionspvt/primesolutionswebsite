-- ════════════════════════════════════════════════════════════════════════════
-- 01 · CORE: shared domains, helpers and the SINGLE-OWNER LOCK
--
-- SECURITY MODEL (read this first)
--   • There is exactly ONE person who can administer the website: the address stored in public.owner_lock.
--   • Sign-in is a one-time e-mail link (Supabase Auth). Sign-ups are switched OFF in the Supabase dashboard and the
--     owner's user is added by hand, so no other address can ever receive a link.
--   • That is only the first lock. The decisive one is here: public.is_owner() asks the DATABASE whether the current
--     session belongs to the owner — the user must exist in auth.users with a CONFIRMED e-mail equal to the locked
--     address. Every Row Level Security policy calls it, so even if the application code were bypassed (or someone
--     held the public key and called the REST API directly) the database would still refuse.
--   • There are no other roles and no way to create more administrators through the API.
--   • No service-role key is used anywhere by the application.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── domains: validated value types reused across tables ───────────────────
-- A path inside the public `site-media` storage bucket. No "..", no leading slash, no odd characters.
create domain public.media_path as text
  check (value ~ '^[a-z0-9][a-z0-9/_.-]{0,200}$' and value !~ '\.\.');

-- A URL we are willing to render as a link: http(s), site-relative (one slash, never "//host"), in-page anchor, mailto or tel.
-- (javascript:, data: etc. are rejected, so a stored link can never execute script.)
create domain public.safe_url as text
  check (char_length(value) <= 500 and value ~* '^(https?://[^[:space:]]+|/([^/\\[:space:]][^[:space:]]*)?|#[^[:space:]]*|mailto:[^[:space:]]+|tel:[+0-9() .-]+)$');

-- ─── generic trigger: keep updated_at honest ───────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ─── the owner lock: one row, one address, not reachable through the API ───
create table public.owner_lock (
  id          smallint primary key default 1 check (id = 1),
  email       text not null check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  created_at  timestamptz not null default now()
);
alter table public.owner_lock enable row level security;
-- no policies and no privileges: only the security-definer function below (and the database owner) can read it
revoke all on public.owner_lock from anon, authenticated;

-- ─── identity check (the single source of truth for "is this the owner?") ──
create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.owner_lock l
    join auth.users u on u.id = auth.uid()
    where lower(u.email) = l.email
      and u.email_confirmed_at is not null
  )
$$;

-- 'owner' for the owner, NULL for everyone else (the app calls this to decide whether to show the admin panel)
create or replace function public.current_admin_role()
returns text language sql stable security definer set search_path = ''
as $$ select case when public.is_owner() then 'owner' end $$;

-- Only signed-in sessions may even ask. (Anonymous callers get "permission denied", not an answer.)
revoke all on function public.is_owner()           from public, anon;
revoke all on function public.current_admin_role() from public, anon;
grant execute on function public.is_owner()           to authenticated;
grant execute on function public.current_admin_role() to authenticated;

-- ─── activity log (genuine "recent updates" for the dashboard) ─────────────
create table public.activity_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_email text,
  table_name  text not null,
  action      text not null check (action in ('insert', 'update', 'delete')),
  record_id   text,
  label       text
);
create index activity_log_at_idx on public.activity_log (at desc);

create or replace function public.log_activity()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  r jsonb;
  lbl text;
begin
  if tg_op = 'DELETE' then
    r := to_jsonb(old);
  else
    r := to_jsonb(new);
  end if;
  -- reordering and touch-only updates are not "content updates"
  if tg_op = 'UPDATE' and (r - 'sort_order' - 'updated_at' - 'updated_by') = (to_jsonb(old) - 'sort_order' - 'updated_at' - 'updated_by') then
    return null;
  end if;
  lbl := coalesce(r ->> 'title', r ->> 'name', r ->> 'question', r ->> 'word', r ->> 'heading', r ->> 'filename',
                  r ->> 'key', r ->> 'platform', r ->> 'mission_label', r ->> 'company_name', r ->> 'email');
  insert into public.activity_log (actor_email, table_name, action, record_id, label)
  values ((select u.email from auth.users u where u.id = auth.uid()), tg_table_name, lower(tg_op), r ->> 'id', left(lbl, 120));
  return null;
end $$;

alter table public.activity_log enable row level security;
revoke all on public.activity_log from anon, authenticated;
grant select on public.activity_log to authenticated;
create policy activity_log_read on public.activity_log for select to authenticated using ((select public.is_owner()));

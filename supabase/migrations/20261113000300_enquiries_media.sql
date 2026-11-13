-- ════════════════════════════════════════════════════════════════════════════
-- 03 · ENQUIRIES, INTERNAL NOTES, MEDIA REGISTER, ANTI-SPAM
--
-- The public contact form may INSERT an enquiry and nothing else. Enquiries are never readable by the
-- public; only the owner can read, update or delete them.
-- ════════════════════════════════════════════════════════════════════════════

create table public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 100),
  email         text not null check (char_length(email) <= 160 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  company       text not null default '' check (char_length(company) <= 120),
  phone         text not null default '' check (phone = '' or phone ~ '^[+()0-9 .-]{7,24}$'),
  service       text not null default '' check (char_length(service) <= 120),
  message       text not null check (char_length(message) between 10 and 4000),
  status        text not null default 'new' check (status in ('new', 'contacted', 'in_progress', 'converted', 'closed')),
  client_token  uuid unique,   -- idempotency: a double-click or retry can never create two rows
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index enquiries_created_idx on public.enquiries (created_at desc);
create index enquiries_status_idx  on public.enquiries (status, created_at desc);

create table public.enquiry_notes (
  id            uuid primary key default gen_random_uuid(),
  enquiry_id    uuid not null references public.enquiries (id) on delete cascade,
  note          text not null check (char_length(note) between 1 and 2000),
  author_email  text,
  created_at    timestamptz not null default now()
);
create index enquiry_notes_enquiry_idx on public.enquiry_notes (enquiry_id, created_at);

-- every file in the media library (the file itself lives in the `site-media` storage bucket)
create table public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  path         public.media_path not null unique,
  filename     text not null check (char_length(filename) between 1 and 200),
  folder       text not null default 'website' check (folder in ('logos', 'team', 'services', 'industries', 'testimonials', 'announcements', 'website')),
  mime_type    text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon')),
  size_bytes   integer not null check (size_bytes between 1 and 5242880),
  alt_text     text not null default '' check (char_length(alt_text) <= 200),
  uploaded_by  text,
  created_at   timestamptz not null default now()
);
create index media_assets_created_idx on public.media_assets (created_at desc);

-- ─── flood guard for public submissions ────────────────────────────────────
-- Anyone holding the (public) publishable key could call the REST API directly, bypassing the website's own
-- rate limiter. This trigger caps how many rows non-owner callers can add in a time window: the table stays
-- usable and cannot be filled by a script. Arguments: max rows, window in minutes.
create or replace function public.throttle_public_inserts()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  max_rows integer := tg_argv[0]::integer;
  mins     integer := tg_argv[1]::integer;
  n        integer;
begin
  if (select public.is_owner()) then
    return new;
  end if;
  execute format('select count(*) from %I.%I where created_at > now() - make_interval(mins => $1)', tg_table_schema, tg_table_name)
    into n using mins;
  if n >= max_rows then
    raise exception 'Too many submissions right now. Please try again in a little while.' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger enquiries_throttle before insert on public.enquiries
  for each row execute function public.throttle_public_inserts('40', '10');
create trigger testimonials_throttle before insert on public.testimonials
  for each row when (new.source = 'visitor') execute function public.throttle_public_inserts('30', '10');

-- ─── triggers: timestamps + activity ───────────────────────────────────────
create trigger enquiries_touch before update on public.enquiries for each row execute function public.touch_updated_at();
create trigger enquiries_activity after insert or update or delete on public.enquiries for each row execute function public.log_activity();
create trigger media_assets_activity after insert or update or delete on public.media_assets for each row execute function public.log_activity();

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon, authenticated;
grant select, update, delete on public.enquiries to authenticated;
grant insert on public.enquiries to authenticated;
-- the public form can only fill these columns; status, timestamps etc. are fixed by the database
grant insert (name, email, company, phone, service, message, client_token) on public.enquiries to anon;

create policy enquiries_public_submit on public.enquiries for insert to anon, authenticated with check (status = 'new');
create policy enquiries_owner_read   on public.enquiries for select to authenticated using ((select public.is_owner()));
create policy enquiries_owner_update on public.enquiries for update to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));
create policy enquiries_owner_delete on public.enquiries for delete to authenticated using ((select public.is_owner()));

alter table public.enquiry_notes enable row level security;
revoke all on public.enquiry_notes from anon, authenticated;
grant select, insert, update, delete on public.enquiry_notes to authenticated;
create policy enquiry_notes_owner_all on public.enquiry_notes for all to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

alter table public.media_assets enable row level security;
revoke all on public.media_assets from anon, authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
create policy media_assets_owner_all on public.media_assets for all to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

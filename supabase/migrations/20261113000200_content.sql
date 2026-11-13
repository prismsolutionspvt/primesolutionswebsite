-- ════════════════════════════════════════════════════════════════════════════
-- 02 · WEBSITE CONTENT
--
-- Conventions
--   • Collections have: id (uuid), sort_order, is_published, created_at, updated_at.
--   • Public visitors (anon) may only READ rows that are published. The owner may read/write everything.
--   • Singletons (site_settings, mission_vision) are one-row tables (id is always 1).
--   • Text lengths are capped in the database so no client can store megabytes in a content field.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── site_settings : contact, WhatsApp, social, brand, SEO, theme, footer, FRX credit ──
create table public.site_settings (
  id                     smallint primary key default 1 check (id = 1),
  -- identity / SEO
  company_name           text not null default 'Prism Solutions' check (char_length(company_name) between 1 and 80),
  tagline                text not null default 'Your Partner in Business Growth.' check (char_length(tagline) <= 160),
  location_label         text not null default 'United States' check (char_length(location_label) <= 120),
  site_url               text not null default '' check (site_url = '' or site_url ~* '^https?://[^[:space:]]+$'),
  seo_title              text not null default 'Prism Solutions | BPO & Digital Services' check (char_length(seo_title) <= 120),
  seo_description        text not null default '' check (char_length(seo_description) <= 320),
  og_image_path          public.media_path,
  indexable              boolean not null default true,
  -- contact
  contact_email          text not null default 'prismsolutions.pvt@gmail.com' check (contact_email = '' or contact_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  contact_phone          text not null default '' check (contact_phone = '' or contact_phone ~ '^[+()0-9 .-]{7,24}$'),
  contact_address        text not null default '' check (char_length(contact_address) <= 300),
  contact_extra          text not null default '' check (char_length(contact_extra) <= 500),
  -- WhatsApp (country code and national number are digits only; the link is composed in the app)
  whatsapp_enabled       boolean not null default true,
  whatsapp_country_code  text not null default '' check (whatsapp_country_code ~ '^[0-9]{0,4}$'),
  whatsapp_number        text not null default '' check (whatsapp_number ~ '^[0-9]{0,15}$'),
  whatsapp_message       text not null default 'Hello Prism Solutions, I would like to discuss my business requirements.' check (char_length(whatsapp_message) <= 300),
  -- social
  instagram_enabled      boolean not null default true,
  instagram_url          text not null default '' check (instagram_url = '' or instagram_url ~* '^https?://[^[:space:]]+$'),
  -- brand
  logo_primary_path      public.media_path,
  logo_secondary_path    public.media_path,
  favicon_path           public.media_path,
  -- footer
  footer_note            text not null default '' check (char_length(footer_note) <= 600),
  footer_marquee         text[] not null default '{}' check (cardinality(footer_marquee) <= 12),
  footer_show_contact    boolean not null default true,
  -- "Powered by" credit
  frx_label              text not null default 'FRX Technologies' check (char_length(frx_label) between 1 and 60),
  frx_url                text not null default 'https://frxtechnologiesprv.netlify.app/' check (frx_url ~* '^https?://[^[:space:]]+$'),
  -- theme
  default_theme          text not null default 'light' check (default_theme in ('light', 'dark', 'adaptive')),
  theme_switcher_enabled boolean not null default true,
  -- becomes true once the starter content (supabase/seed.sql) has been loaded
  content_seeded         boolean not null default false,
  updated_at             timestamptz not null default now(),
  updated_by             text
);
insert into public.site_settings (id) values (1);

-- ─── site_sections : headings & intro copy for each public section ─────────
create table public.site_sections (
  key         text primary key check (key ~ '^[a-z_]{2,30}$'),
  eyebrow     text not null default '' check (char_length(eyebrow) <= 80),
  heading     text not null default '' check (char_length(heading) <= 200),
  intro       text not null default '' check (char_length(intro) <= 1200),
  body        text[] not null default '{}' check (cardinality(body) <= 12),
  extra       jsonb not null default '{}'::jsonb check (pg_column_size(extra) <= 20000),
  image_path  public.media_path,
  is_visible  boolean not null default true,
  updated_at  timestamptz not null default now()
);

-- ─── mission_vision (singleton) ────────────────────────────────────────────
create table public.mission_vision (
  id                  smallint primary key default 1 check (id = 1),
  mission_label       text not null default 'Our Mission' check (char_length(mission_label) <= 80),
  mission_text        text not null default '' check (char_length(mission_text) <= 1200),
  mission_highlights  text[] not null default '{}' check (cardinality(mission_highlights) <= 6),
  mission_image_path  public.media_path,
  vision_label        text not null default 'Our Vision' check (char_length(vision_label) <= 80),
  vision_text         text not null default '' check (char_length(vision_text) <= 1200),
  vision_highlights   text[] not null default '{}' check (cardinality(vision_highlights) <= 6),
  vision_image_path   public.media_path,
  updated_at          timestamptz not null default now()
);
insert into public.mission_vision (id) values (1);

-- ─── services & subcategories ──────────────────────────────────────────────
create table public.services (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  name          text not null check (char_length(name) between 1 and 120),
  ray_label     text not null default '' check (char_length(ray_label) <= 40),
  group_label   text not null default '' check (char_length(group_label) <= 80),
  tagline       text not null default '' check (char_length(tagline) <= 220),
  summary       text not null default '' check (char_length(summary) <= 600),
  note          text not null default '' check (char_length(note) <= 600),
  detail        text not null default '' check (char_length(detail) <= 4000),
  icon          text not null default '' check (char_length(icon) <= 40),
  image_path    public.media_path,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index services_order_idx on public.services (sort_order);

create table public.service_subcategories (
  id            uuid primary key default gen_random_uuid(),
  service_id    uuid not null references public.services (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 160),
  detail        text not null default '' check (char_length(detail) <= 600),
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index service_subcategories_service_idx on public.service_subcategories (service_id, sort_order);

-- ─── industries ────────────────────────────────────────────────────────────
create table public.industries (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  name          text not null check (char_length(name) between 1 and 120),
  summary       text not null default '' check (char_length(summary) <= 600),
  note          text not null default '' check (char_length(note) <= 400),
  detail        text not null default '' check (char_length(detail) <= 4000),
  image_path    public.media_path,
  fits          text[] not null default '{}' check (cardinality(fits) <= 20),
  scene         text not null default 'generic' check (scene in ('generic', 'healthcare', 'realestate', 'ecommerce', 'saas', 'professional', 'finance')),
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index industries_order_idx on public.industries (sort_order);

-- ─── team ("Meet the People Behind Prism") ─────────────────────────────────
create table public.team_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '' check (char_length(name) <= 100),
  designation   text not null default '' check (char_length(designation) <= 120),
  bio           text not null default '' check (char_length(bio) <= 2000),
  extra_info    text not null default '' check (char_length(extra_info) <= 1000),
  photo_path    public.media_path,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index team_members_order_idx on public.team_members (sort_order);

-- ─── core values · why prism · approach ────────────────────────────────────
create table public.core_values (
  id            uuid primary key default gen_random_uuid(),
  word          text not null check (char_length(word) between 1 and 60),
  line          text not null default '' check (char_length(line) <= 400),
  is_principle  boolean not null default false,   -- the three guiding principles (Quality, Commitment, Performance)
  image_path    public.media_path,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index core_values_order_idx on public.core_values (sort_order);

create table public.why_prism_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 120),
  text          text not null default '' check (char_length(text) <= 500),
  image_path    public.media_path,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index why_prism_items_order_idx on public.why_prism_items (sort_order);

create table public.approach_steps (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 80),
  text          text not null default '' check (char_length(text) <= 500),
  image_path    public.media_path,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index approach_steps_order_idx on public.approach_steps (sort_order);

-- ─── faqs ──────────────────────────────────────────────────────────────────
create table public.faqs (
  id            uuid primary key default gen_random_uuid(),
  question      text not null check (char_length(question) between 3 and 240),
  answer        text not null check (char_length(answer) between 1 and 3000),
  category      text not null default 'General' check (char_length(category) between 1 and 40),
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index faqs_order_idx on public.faqs (sort_order);

-- ─── announcements ─────────────────────────────────────────────────────────
create table public.announcements (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null check (char_length(title) between 1 and 120),
  short_description   text not null default '' check (char_length(short_description) <= 300),
  detail_description  text not null default '' check (char_length(detail_description) <= 3000),
  image_path          public.media_path,
  cta_text            text not null default '' check (char_length(cta_text) <= 40),
  cta_url             public.safe_url,
  is_enabled          boolean not null default false,
  starts_at           timestamptz,
  ends_at             timestamptz,
  priority            integer not null default 0 check (priority between 0 and 100),
  show_on_load        boolean not null default true,
  show_delay_seconds  integer not null default 2 check (show_delay_seconds between 0 and 60),
  frequency           text not null default 'once_per_visitor' check (frequency in ('every_visit', 'once_per_session', 'once_per_visitor')),
  reappear_days       integer not null default 7 check (reappear_days between 0 and 365),
  is_dismissible      boolean not null default true,
  reappear_after_dismiss boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

-- ─── social_links (anything beyond the Instagram field in site_settings) ───
create table public.social_links (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null check (char_length(platform) between 1 and 40),
  label       text not null default '' check (char_length(label) <= 60),
  url         text not null check (url ~* '^https?://[^[:space:]]+$' and char_length(url) <= 500),
  is_enabled  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── testimonials & visitor reviews (one moderated table) ──────────────────
-- Owner-authored testimonials and visitor "leave a review" submissions share this table.
-- Visitor submissions can ONLY be inserted as status 'pending'; the owner approves them.
create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 80),
  role          text not null default '' check (char_length(role) <= 80),
  company       text not null default '' check (char_length(company) <= 80),
  photo_path    public.media_path,
  text          text not null check (char_length(text) between 10 and 800),
  rating        smallint check (rating between 1 and 5),
  source        text not null default 'owner' check (source in ('owner', 'visitor')),
  status        text not null default 'published' check (status in ('pending', 'published', 'rejected')),
  is_featured   boolean not null default false,
  sort_order    integer not null default 0,
  client_token  uuid unique,   -- idempotency: the same form submission can never create two rows
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index testimonials_status_idx on public.testimonials (status, created_at desc);

-- ─── updated_at triggers ───────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'site_sections', 'mission_vision', 'services', 'service_subcategories', 'industries',
                           'team_members', 'core_values', 'why_prism_items', 'approach_steps', 'faqs', 'announcements',
                           'social_links', 'testimonials']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', t || '_touch', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.log_activity()', t || '_activity', t);
  end loop;
end $$;

-- ─── Row Level Security ────────────────────────────────────────────────────
-- Uniform "published collections": the public reads published rows, the owner does everything.
do $$
declare t text;
begin
  foreach t in array array['services', 'industries', 'team_members', 'core_values', 'why_prism_items', 'approach_steps', 'faqs']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (is_published)', t || '_public_read', t);
    execute format('create policy %I on public.%I for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()))', t || '_owner_all', t);
  end loop;
end $$;

-- subcategories are public only while BOTH they and their parent service are published
alter table public.service_subcategories enable row level security;
revoke all on public.service_subcategories from anon, authenticated;
grant select on public.service_subcategories to anon, authenticated;
grant insert, update, delete on public.service_subcategories to authenticated;
create policy service_subcategories_public_read on public.service_subcategories for select to anon, authenticated
  using (is_published and exists (select 1 from public.services s where s.id = service_id and s.is_published));
create policy service_subcategories_owner_all on public.service_subcategories for all to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

-- singletons & section copy: public read, owner write
alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
create policy site_settings_public_read on public.site_settings for select to anon, authenticated using (true);
create policy site_settings_owner_update on public.site_settings for update to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

alter table public.site_sections enable row level security;
revoke all on public.site_sections from anon, authenticated;
grant select on public.site_sections to anon, authenticated;
grant insert, update on public.site_sections to authenticated;
create policy site_sections_public_read on public.site_sections for select to anon, authenticated using (true);
create policy site_sections_owner_write on public.site_sections for insert to authenticated with check ((select public.is_owner()));
create policy site_sections_owner_update on public.site_sections for update to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

alter table public.mission_vision enable row level security;
revoke all on public.mission_vision from anon, authenticated;
grant select on public.mission_vision to anon, authenticated;
grant update on public.mission_vision to authenticated;
create policy mission_vision_public_read on public.mission_vision for select to anon, authenticated using (true);
create policy mission_vision_owner_update on public.mission_vision for update to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

-- announcements: the public sees only enabled ones (the app additionally applies the schedule window)
alter table public.announcements enable row level security;
revoke all on public.announcements from anon, authenticated;
grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;
create policy announcements_public_read on public.announcements for select to anon, authenticated using (is_enabled and (ends_at is null or ends_at > now()));
create policy announcements_owner_all on public.announcements for all to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

-- social links
alter table public.social_links enable row level security;
revoke all on public.social_links from anon, authenticated;
grant select on public.social_links to anon, authenticated;
grant insert, update, delete on public.social_links to authenticated;
create policy social_links_public_read on public.social_links for select to anon, authenticated using (is_enabled);
create policy social_links_owner_all on public.social_links for all to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

-- testimonials: the public reads published ones and may SUBMIT a pending visitor review, nothing else
alter table public.testimonials enable row level security;
revoke all on public.testimonials from anon, authenticated;
grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
-- anonymous visitors may set only these columns when they submit a review (everything else takes its default)
grant insert (name, company, role, text, rating, source, status, client_token) on public.testimonials to anon;
create policy testimonials_public_read on public.testimonials for select to anon, authenticated using (status = 'published');
create policy testimonials_visitor_submit on public.testimonials for insert to anon, authenticated
  with check (source = 'visitor' and status = 'pending' and is_featured = false and photo_path is null
              and rating between 1 and 5 and sort_order = 0);
create policy testimonials_owner_all on public.testimonials for all to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));

-- ─── reorder_rows(): atomic drag-free ordering for any collection ──────────
-- Whitelisted table names only; the caller must be the owner. Sets sort_order = position in p_ids.
create or replace function public.reorder_rows(p_table text, p_ids uuid[])
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not (select public.is_owner()) then
    raise exception 'Not authorised.' using errcode = '42501';
  end if;
  if p_table not in ('services', 'service_subcategories', 'industries', 'team_members', 'core_values', 'why_prism_items',
                     'approach_steps', 'faqs', 'testimonials', 'social_links') then
    raise exception 'Unknown table.' using errcode = '22023';
  end if;
  execute format(
    'update public.%I t set sort_order = o.ord::int from unnest($1) with ordinality as o(id, ord) where t.id = o.id', p_table)
  using p_ids;
end $$;
revoke all on function public.reorder_rows(text, uuid[]) from public, anon;
grant execute on function public.reorder_rows(text, uuid[]) to authenticated;

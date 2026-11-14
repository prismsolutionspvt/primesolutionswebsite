/**
 * Database security tests: run the REAL migrations + seed in an in-process Postgres (PGlite) and attack them.
 *   npm run db:test
 * See harness.mjs for what is stubbed (only Supabase-owned pieces). Not proven here: Google/e-mail delivery or the hosted config.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bootDb, ID, OWNER_EMAIL } from "./harness.mjs";

const seedSql = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "seed.sql"), "utf8");
const H = await bootDb();
const { db, anon, owner, stranger, user, rows, denied } = H;
after(async () => db?.close());

// ───────────────────────────────────────────────────── identity
test("the owner (confirmed e-mail = the locked address) is recognised by the database", async () => {
  assert.equal((await owner(() => rows("select public.current_admin_role() r")))[0].r, "owner");
  assert.equal((await owner(() => rows("select public.is_owner() o")))[0].o, true);
});

test("any other account is NOT the owner", async () => {
  const r = await stranger(() => rows("select public.current_admin_role() r, public.is_owner() o"));
  assert.equal(r[0].r, null);
  assert.equal(r[0].o, false);
});

test("the owner's address alone is not enough: an UNCONFIRMED account with that e-mail is refused", async () => {
  const r = await user(ID.unconfirmed, OWNER_EMAIL, () => rows("select public.is_owner() o"));
  assert.equal(r[0].o, false);
});

test("a forged JWT e-mail claim does not grant access (identity is read from auth.users, never from the claim)", async () => {
  const r = await user(ID.stranger, OWNER_EMAIL, () => rows("select public.is_owner() o"));
  assert.equal(r[0].o, false);
});

test("a token for a user that does not exist is refused", async () => {
  const r = await user("00000000-0000-0000-0000-00000000ffff", OWNER_EMAIL, () => rows("select public.is_owner() o"));
  assert.equal(r[0].o, false);
});

test("anonymous callers cannot even ask whether they are the owner", async () => {
  await denied(anon(() => db.query("select public.is_owner()")), /permission denied/);
});

test("the owner lock cannot be read or changed through the API by anyone (not even the owner)", async () => {
  await denied(anon(() => db.query("select * from public.owner_lock")), /permission denied/);
  await denied(stranger(() => db.query("select * from public.owner_lock")), /permission denied/);
  await denied(owner(() => db.query("select * from public.owner_lock")), /permission denied/);
  await denied(owner(() => db.exec("update public.owner_lock set email = 'me@evil.com'")), /permission denied/);
  await denied(stranger(() => db.exec("insert into public.owner_lock (id, email) values (2, 'x@y.com')")), /permission denied/);
  assert.equal((await rows("select email from public.owner_lock"))[0].email, OWNER_EMAIL);
});

// ───────────────────────────────────────────────────── public reads
test("seed loaded the approved starter content and flipped content_seeded", async () => {
  const c = (await rows(`select (select count(*) from services)::int services, (select count(*) from service_subcategories)::int subs,
    (select count(*) from industries)::int industries, (select count(*) from core_values)::int vals, (select count(*) from why_prism_items)::int why,
    (select count(*) from approach_steps)::int steps, (select count(*) from faqs)::int faqs, (select count(*) from team_members)::int team,
    (select count(*) from testimonials)::int testimonials, (select content_seeded from site_settings) seeded`))[0];
  assert.deepEqual(c, { services: 7, subs: 36, industries: 6, vals: 5, why: 8, steps: 5, faqs: 10, team: 3, testimonials: 0, seeded: true });
});

test("the seed is idempotent", async () => {
  await db.exec(seedSql);
  assert.equal((await rows("select count(*)::int n from services"))[0].n, 7);
});

test("public visitors see only PUBLISHED rows", async () => {
  await owner(() => db.exec(`update public.services set is_published = false where slug = 'lead-generation'`));
  const seen = await anon(() => rows("select slug from public.services"));
  assert.equal(seen.length, 6);
  assert.ok(!seen.some((s) => s.slug === "lead-generation"));
  const subs = await anon(() => rows("select s.slug from public.service_subcategories c join public.services s on s.id = c.service_id"));
  assert.ok(!subs.some((s) => s.slug === "lead-generation"), "subcategories of an unpublished service must be hidden too");
  await owner(() => db.exec(`update public.services set is_published = true where slug = 'lead-generation'`));
  assert.equal((await anon(() => rows("select 1 from public.services"))).length, 7);
});

test("public visitors can read settings, but nothing private exists in them", async () => {
  const s = (await anon(() => rows("select contact_email, frx_url from public.site_settings")))[0];
  assert.equal(s.contact_email, OWNER_EMAIL);
  assert.equal(s.frx_url, "https://frxtechnologiesprv.netlify.app/");
});

// ───────────────────────────────────────────────────── public writes are refused
test("anonymous visitors cannot create, change or delete content", async () => {
  await denied(anon(() => db.exec(`insert into public.services (slug, name) values ('x', 'X')`)), /row-level security|permission denied/);
  // anon holds no UPDATE/DELETE privilege at all, so the database refuses outright
  await denied(anon(() => db.exec(`update public.services set name = 'hacked'`)), /permission denied/);
  assert.equal((await rows("select count(*)::int n from services where name = 'hacked'"))[0].n, 0);
  await denied(anon(() => db.exec(`delete from public.faqs`)), /permission denied/);
  assert.equal((await rows("select count(*)::int n from faqs"))[0].n, 10);
  await denied(anon(() => db.exec(`update public.site_settings set contact_email = 'evil@example.com'`)), /permission denied/);
  assert.equal((await rows("select contact_email from site_settings"))[0].contact_email, OWNER_EMAIL);
});

test("a signed-in stranger (any Google account) has the same non-power as an anonymous visitor", async () => {
  await denied(stranger(() => db.exec(`insert into public.services (slug, name) values ('x', 'X')`)), /row-level security/);
  await stranger(() => db.exec(`update public.faqs set answer = 'hacked'`));
  assert.equal((await rows("select count(*)::int n from faqs where answer = 'hacked'"))[0].n, 0);
  assert.equal((await stranger(() => rows("select * from public.enquiries"))).length, 0);
  assert.equal((await stranger(() => rows("select * from public.activity_log"))).length, 0);
  await denied(stranger(() => db.exec(`insert into storage.objects (bucket_id, name) values ('site-media', 'team/x.png')`)), /row-level security/);
});

// ───────────────────────────────────────────────────── enquiries
const enquiry = (extra = "") =>
  `insert into public.enquiries (name, email, company, phone, service, message${extra ? ", " + extra.split("=")[0] : ""}) values ('Jane Doe', 'jane@example.com', 'Acme', '+1 555 010 2030', 'Customer Support', 'We need help with inbound support.'${extra ? ", " + extra.split("=")[1] : ""})`;

test("visitors can submit an enquiry, but cannot read any enquiry back", async () => {
  await anon(() => db.exec(enquiry()));
  await denied(anon(() => db.query("select * from public.enquiries")), /permission denied/);
  assert.equal((await owner(() => rows("select * from public.enquiries"))).length, 1);
});

test("visitors cannot choose an enquiry's status, id or timestamps", async () => {
  await denied(anon(() => db.exec(enquiry("status='converted'"))), /permission denied/);
  await denied(anon(() => db.exec(enquiry("created_at='2000-01-01'"))), /permission denied/);
});

test("enquiry validation lives in the database (bad e-mail, short message, huge text)", async () => {
  await denied(anon(() => db.exec(`insert into public.enquiries (name, email, message) values ('Jo', 'not-an-email', 'a long enough message')`)), /check constraint|violates/);
  await denied(anon(() => db.exec(`insert into public.enquiries (name, email, message) values ('Jo', 'a@b.co', 'short')`)), /check constraint|violates/);
  await denied(anon(() => db.exec(`insert into public.enquiries (name, email, message) values ('Jo', 'a@b.co', '${"x".repeat(4001)}')`)), /check constraint|violates/);
});

test("a retried / double-clicked submission cannot create two rows (client_token)", async () => {
  const t = "11111111-1111-1111-1111-111111111111";
  await anon(() => db.exec(enquiry(`client_token='${t}'`)));
  await denied(anon(() => db.exec(enquiry(`client_token='${t}'`))), /duplicate key|unique/);
});

test("the owner can read, update status, annotate and delete enquiries; nobody else can see them", async () => {
  const id = (await owner(() => rows("select id from public.enquiries limit 1")))[0].id;
  await owner(() => db.exec(`update public.enquiries set status = 'contacted' where id = '${id}'`));
  assert.equal((await owner(() => rows(`select status from public.enquiries where id = '${id}'`)))[0].status, 'contacted');
  await owner(() => db.exec(`insert into public.enquiry_notes (enquiry_id, note, author_email) values ('${id}', 'Called back, will email a proposal.', '${OWNER_EMAIL}')`));
  assert.equal((await stranger(() => rows("select * from public.enquiry_notes"))).length, 0);
});

test("the enquiry flood guard stops scripted spam (40 per 10 minutes) but never blocks staff", async () => {
  await db.exec("delete from public.enquiries");
  let ok = 0;
  let blocked = false;
  for (let i = 0; i < 45; i++) {
    try {
      await anon(() => db.exec(enquiry()));
      ok++;
    } catch (e) {
      assert.match(String(e.message), /Too many submissions/);
      blocked = true;
      break;
    }
  }
  assert.equal(ok, 40);
  assert.ok(blocked);
  await owner(() => db.exec(enquiry())); // staff unaffected
});

// ───────────────────────────────────────────────────── reviews
const review = (cols, vals) => `insert into public.testimonials (${cols}) values (${vals})`;

test("a visitor review can ONLY arrive as pending, and stays invisible until the owner approves it", async () => {
  await db.exec("delete from public.enquiries"); // (clears the earlier flood so unrelated tests are unaffected)
  await anon(() => db.exec(review("name, text, rating, source, status", `'Sam', 'Really helpful and professional team.', 5, 'visitor', 'pending'`)));
  assert.equal((await anon(() => rows("select * from public.testimonials"))).length, 0, "pending reviews are not public");
  await denied(anon(() => db.exec(review("name, text, rating, source, status", `'Eve', 'Auto-published review attempt here.', 5, 'visitor', 'published'`))), /row-level security/);
  await denied(anon(() => db.exec(review("name, text, rating, source, status", `'Eve', 'Pretending to be the owner here.', 5, 'owner', 'pending'`))), /row-level security/);
  await denied(anon(() => db.exec(review("name, text, rating, source, status, is_featured", `'Eve', 'Trying to feature myself here.', 5, 'visitor', 'pending', true`))), /permission denied/);
  await denied(anon(() => db.exec(review("name, text, rating, source, status", `'Eve', 'Rating out of range attempt here.', 9, 'visitor', 'pending'`))), /check constraint|row-level security/);
  const id = (await owner(() => rows("select id from public.testimonials where name = 'Sam'")))[0].id;
  await owner(() => db.exec(`update public.testimonials set status = 'published' where id = '${id}'`));
  const pub = await anon(() => rows("select name, rating from public.testimonials"));
  assert.deepEqual(pub, [{ name: "Sam", rating: 5 }]);
});

// ───────────────────────────────────────────────────── staff powers & roles
test("the owner can create, reorder and delete content", async () => {
  await owner(() => db.exec(`insert into public.faqs (question, answer) values ('Is this a test?', 'Yes, this is a test.')`));
  const ids = (await owner(() => rows("select id from public.faqs order by sort_order desc"))).map((r) => r.id);
  await owner(() => db.query("select public.reorder_rows('faqs', $1::uuid[])", [`{${ids.join(",")}}`]));
  const first = (await owner(() => rows("select id from public.faqs order by sort_order limit 1")))[0].id;
  assert.equal(first, ids[0]);
  await owner(() => db.exec(`delete from public.faqs where question = 'Is this a test?'`));
});

test("reorder_rows refuses non-staff callers and unknown tables", async () => {
  await denied(stranger(() => db.query("select public.reorder_rows('faqs', '{}')")), /Not authorised/);
  await denied(owner(() => db.query("select public.reorder_rows('owner_lock', '{}')")), /Unknown table/);
});

test("only the owner can change site settings and content; a signed-in stranger changes nothing", async () => {
  await owner(() => db.exec(`update public.site_settings set contact_phone = '+1 555 111 2222'`));
  assert.equal((await rows("select contact_phone from site_settings"))[0].contact_phone, "+1 555 111 2222");
  await stranger(() => db.exec(`update public.site_settings set contact_phone = '+1 555 999 9999'`));
  assert.equal((await rows("select contact_phone from site_settings"))[0].contact_phone, "+1 555 111 2222", "a stranger's update must match nothing");
  await owner(() => db.exec(`update public.site_settings set contact_phone = ''`));
});

// ───────────────────────────────────────────────────── announcements & social
test("announcements are public only while enabled and not expired", async () => {
  await owner(() => db.exec(`insert into public.announcements (title, is_enabled) values ('Live one', true), ('Draft', false)`));
  await owner(() => db.exec(`insert into public.announcements (title, is_enabled, starts_at, ends_at) values ('Expired', true, now() - interval '3 days', now() - interval '1 day')`));
  const t = (await anon(() => rows("select title from public.announcements"))).map((r) => r.title);
  assert.deepEqual(t, ["Live one"]);
});

test("disabled social links are hidden from the public", async () => {
  await owner(() => db.exec(`insert into public.social_links (platform, url, is_enabled) values ('Facebook', 'https://facebook.com/prism', true), ('X', 'https://x.com/prism', false)`));
  const t = (await anon(() => rows("select platform from public.social_links"))).map((r) => r.platform);
  assert.deepEqual(t, ["Facebook"]);
});

// ───────────────────────────────────────────────────── validation domains
test("stored links can never be javascript: URLs, and image paths cannot escape the bucket", async () => {
  await denied(owner(() => db.exec(`insert into public.announcements (title, cta_url) values ('Bad', 'javascript:alert(1)')`)), /safe_url|check/);
  await denied(owner(() => db.exec(`insert into public.announcements (title, cta_url) values ('Bad', 'data:text/html,<script>alert(1)</script>')`)), /safe_url|check/);
  await denied(owner(() => db.exec(`insert into public.announcements (title, cta_url) values ('Bad', '//evil.example.com/x')`)), /safe_url|check/);
  await denied(owner(() => db.exec(`insert into public.announcements (title, cta_url) values ('Bad', '/\\evil.example.com')`)), /safe_url|check/);
  await owner(() => db.exec(`insert into public.announcements (title, cta_url) values ('Ok', '/#contact'), ('Ok2', 'https://example.com/x')`));
  await denied(owner(() => db.exec(`update public.team_members set photo_path = '../secrets/x.png'`)), /media_path|check/);
  await denied(owner(() => db.exec(`update public.team_members set photo_path = '/etc/passwd'`)), /media_path|check/);
  await owner(() => db.exec(`update public.team_members set photo_path = 'team/ab12-photo.png' where id = (select id from public.team_members limit 1)`));
});

// ───────────────────────────────────────────────────── media & storage
test("only staff can write to the site-media bucket; strangers and anonymous cannot", async () => {
  await owner(() => db.exec(`insert into storage.objects (bucket_id, name) values ('site-media', 'team/ok.png')`));
  await denied(anon(() => db.exec(`insert into storage.objects (bucket_id, name) values ('site-media', 'team/evil.png')`)), /row-level security|permission denied/);
  await denied(stranger(() => db.exec(`insert into storage.objects (bucket_id, name) values ('site-media', 'team/evil.png')`)), /row-level security/);
  await stranger(() => db.exec(`delete from storage.objects where bucket_id = 'site-media'`));
  assert.equal((await rows("select count(*)::int n from storage.objects"))[0].n, 1, "a stranger's delete must match nothing");
  const b = (await rows("select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'site-media'"))[0];
  assert.equal(b.public, true);
  assert.equal(Number(b.file_size_limit), 5242880);
  assert.ok(!b.allowed_mime_types.includes("image/svg+xml"), "SVG must not be allowed (script risk)");
});

test("media register: staff only", async () => {
  await owner(() => db.exec(`insert into public.media_assets (path, filename, folder, mime_type, size_bytes) values ('team/ok.png', 'ok.png', 'team', 'image/png', 1234)`));
  assert.equal((await anon(() => rows("select 1 from public.media_assets").catch(() => []))).length, 0);
  await denied(owner(() => db.exec(`insert into public.media_assets (path, filename, folder, mime_type, size_bytes) values ('x/a.svg', 'a.svg', 'website', 'image/svg+xml', 10)`)), /check/);
});

// ───────────────────────────────────────────────────── private tables stay private
test("activity log is not public; activity is recorded for real edits", async () => {
  await denied(anon(() => db.query("select * from public.activity_log")), /permission denied/);
  const log = await owner(() => rows("select table_name, action, label from public.activity_log where table_name = 'services' order by id desc limit 2"));
  assert.ok(log.length >= 1);
  assert.equal((await owner(() => rows("select count(*)::int n from public.activity_log where actor_email is not null")))[0].n > 0, true);
});

test("every application table has Row Level Security enabled", async () => {
  const off = await rows(`select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`);
  assert.deepEqual(off, []);
});

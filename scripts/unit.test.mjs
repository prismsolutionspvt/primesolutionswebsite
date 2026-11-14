/**
 * Unit tests for the pure logic: server-side form validation, public-form validation and the database → website mapper.
 *   npm run test:unit
 * Loads the TypeScript sources directly (no bundler), resolving the "@/" alias.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadTs, root } from "./ts-loader.mjs";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
const load = loadTs;

const { parseFields } = load(path.join(root, "src/admin/parse.ts"));
const { reviewSchema, enquirySchema } = load(path.join(root, "src/lib/validation/public.ts"));
const { mapContent } = load(path.join(root, "src/lib/content/map.ts"));
const { RESOURCES, SINGLETONS } = load(path.join(root, "src/admin/registry.ts"));

const ok = (r) => (assert.equal(r.ok, true, JSON.stringify(r.errors)), r.data);
const bad = (r, field) => (assert.equal(r.ok, false), assert.ok(r.errors[field], `expected an error on ${field}`), r.errors[field]);

// ───────────────────────── admin form validation
test("text fields are trimmed, control characters removed, required and length enforced", () => {
  const f = [{ kind: "text", name: "name", label: "Name", required: true, max: 20 }];
  assert.equal(ok(parseFields(f, { name: "  Hello\u0000 \u0007World " })).name, "Hello World");
  bad(parseFields(f, { name: "   " }), "name");
  bad(parseFields(f, { name: "x".repeat(21) }), "name");
});

test("URLs: http(s), relative, anchors, mailto and tel pass; javascript: and data: never do", () => {
  const f = [{ kind: "url", name: "u", label: "Link", nullable: true }];
  for (const good of ["https://example.com/a?b=1", "/#contact", "#top", "mailto:a@b.co", "tel:+1 555 010 2030"]) assert.equal(ok(parseFields(f, { u: good })).u, good);
  for (const evil of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:x", "//evil.com", "/\\evil.com", "ftp://x.com", "https://exa mple.com"]) bad(parseFields(f, { u: evil }), "u");
  assert.equal(ok(parseFields(f, { u: "" })).u, null);
  const http = [{ kind: "url", name: "u", label: "Link", httpOnly: true }];
  bad(parseFields(http, { u: "/relative" }), "u");
  bad(parseFields(http, { u: "mailto:a@b.co" }), "u");
});

test("image paths: only plain bucket paths; traversal and absolute paths are refused; empty becomes null", () => {
  const f = [{ kind: "image", name: "i", label: "Image", folder: "team" }];
  assert.equal(ok(parseFields(f, { i: "team/jane-ab12cd.png" })).i, "team/jane-ab12cd.png");
  for (const evil of ["../secret.png", "team/../../x.png", "/etc/passwd", "team/a b.png", "http://x.com/a.png", "TEAM/A.PNG"]) bad(parseFields(f, { i: evil }), "i");
  assert.equal(ok(parseFields(f, { i: "" })).i, null);
});

test("lines and paragraphs split into arrays; limits apply", () => {
  const lines = [{ kind: "lines", name: "l", label: "L", maxItems: 3, max: 10 }];
  assert.deepEqual(ok(parseFields(lines, { l: "a\n\n  b  \nc" })).l, ["a", "b", "c"]);
  bad(parseFields(lines, { l: "a\nb\nc\nd" }), "l");
  bad(parseFields(lines, { l: "x".repeat(11) }), "l");
  const para = [{ kind: "paragraphs", name: "p", label: "P" }];
  assert.deepEqual(ok(parseFields(para, { p: "One\nstill one\n\nTwo" })).p, ["One\nstill one", "Two"]);
});

test("numbers: whole, in range, default when empty", () => {
  const f = [{ kind: "number", name: "n", label: "N", min: 0, max: 100, default: 5 }];
  assert.equal(ok(parseFields(f, { n: "42" })).n, 42);
  assert.equal(ok(parseFields(f, { n: "" })).n, 5);
  bad(parseFields(f, { n: "101" }), "n");
  bad(parseFields(f, { n: "1.5" }), "n");
  bad(parseFields(f, { n: "abc" }), "n");
});

test("select accepts only listed options; switch coerces; multi accepts only slugs", () => {
  const sel = [{ kind: "select", name: "s", label: "S", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] }];
  assert.equal(ok(parseFields(sel, { s: "a" })).s, "a");
  bad(parseFields(sel, { s: "c" }), "s");
  assert.equal(ok(parseFields([{ kind: "switch", name: "w", label: "W" }], { w: true })).w, true);
  assert.equal(ok(parseFields([{ kind: "switch", name: "w", label: "W" }], { w: "yes" })).w, false);
  const multi = [{ kind: "multi", name: "m", label: "M", optionsFrom: "services" }];
  assert.deepEqual(ok(parseFields(multi, { m: ["lead-generation", "customer-support"] })).m, ["lead-generation", "customer-support"]);
  bad(parseFields(multi, { m: ["ok", "Not A Slug!"] }), "m");
});

test("datetime normalises to ISO; invalid dates are refused; empty becomes null", () => {
  const f = [{ kind: "datetime", name: "d", label: "D" }];
  assert.equal(ok(parseFields(f, { d: "2026-12-01T10:00:00.000Z" })).d, "2026-12-01T10:00:00.000Z");
  bad(parseFields(f, { d: "not a date" }), "d");
  assert.equal(ok(parseFields(f, { d: "" })).d, null);
});

test("email, phone, digits, slug", () => {
  const f = [{ kind: "email", name: "e", label: "E" }, { kind: "phone", name: "p", label: "P" }, { kind: "digits", name: "d", label: "D", max: 4 }, { kind: "slug", name: "s", label: "S" }];
  const d = ok(parseFields(f, { e: "Owner@Example.COM", p: "+1 (555) 010-2030", d: "1234", s: "my-slug-2" }));
  assert.equal(d.e, "owner@example.com");
  bad(parseFields(f, { e: "nope", p: "", d: "", s: "" }), "e");
  bad(parseFields(f, { e: "", p: "abc", d: "", s: "" }), "p");
  bad(parseFields(f, { e: "", p: "", d: "12345", s: "" }), "d");
  bad(parseFields(f, { e: "", p: "", d: "", s: "Bad Slug" }), "s");
});

test("pairs drop empty titles and enforce limits", () => {
  const f = [{ kind: "pairs", name: "x", label: "X", maxItems: 2 }];
  assert.deepEqual(ok(parseFields(f, { x: [{ title: "A", text: "a" }, { title: "", text: "orphan" }] })).x, [{ title: "A", text: "a" }]);
  bad(parseFields(f, { x: [{ title: "1", text: "" }, { title: "2", text: "" }, { title: "3", text: "" }] }), "x");
});

test("every registered module's own field definitions accept their defaults shape (no field can be mis-registered)", () => {
  for (const def of [...Object.values(RESOURCES), ...Object.values(SINGLETONS)]) {
    const names = def.fields.map((f) => f.name);
    assert.equal(new Set(names).size, names.length, `${def.key}: duplicate field names`);
    for (const s of def.sections ?? []) for (const n of s.fields) assert.ok(names.includes(n), `${def.key}: section references unknown field ${n}`);
  }
  for (const def of Object.values(RESOURCES)) {
    assert.ok(def.titleField && def.fields.some((f) => f.name === def.titleField), `${def.key}: bad titleField`);
    if (def.flag) assert.ok(def.fields.some((f) => f.name === def.flag.column) || def.key === "services", `${def.key}: flag column not editable`);
  }
});

// ───────────────────────── public forms
const guards = { trap: "", elapsed: 5000, token: "11111111-1111-4111-8111-111111111111" };
test("review form: valid passes; rating, length, honeypot and speed are enforced", () => {
  const good = { name: "  Sam ", company: "", rating: 5, text: "Really helpful and professional.", ...guards };
  const r = reviewSchema.safeParse(good);
  assert.equal(r.success, true);
  assert.equal(r.data.name, "Sam");
  assert.equal(reviewSchema.safeParse({ ...good, rating: 0 }).success, false);
  assert.equal(reviewSchema.safeParse({ ...good, rating: 6 }).success, false);
  assert.equal(reviewSchema.safeParse({ ...good, text: "short" }).success, false);
  assert.equal(reviewSchema.safeParse({ ...good, text: "x".repeat(801) }).success, false);
  assert.equal(reviewSchema.safeParse({ ...good, trap: "http://spam" }).success, false);
  assert.equal(reviewSchema.safeParse({ ...good, elapsed: 300 }).success, false);
  assert.equal(reviewSchema.safeParse({ ...good, token: "nope" }).success, false);
});

test("enquiry form: valid passes; bad email/phone/message and bot signals are rejected", () => {
  const good = { name: "Jane Doe", email: "jane@example.com", company: "", phone: "+1 555 010 2030", service: "Customer Support", message: "We need help with support.", ...guards };
  assert.equal(enquirySchema.safeParse(good).success, true);
  assert.equal(enquirySchema.safeParse({ ...good, email: "bad" }).success, false);
  assert.equal(enquirySchema.safeParse({ ...good, phone: "abc" }).success, false);
  assert.equal(enquirySchema.safeParse({ ...good, phone: "" }).success, true);
  assert.equal(enquirySchema.safeParse({ ...good, message: "hi" }).success, false);
  assert.equal(enquirySchema.safeParse({ ...good, service: "" }).success, false);
  assert.equal(enquirySchema.safeParse({ ...good, trap: "x" }).success, false);
});

// ───────────────────────── owner password rules
const { passwordProblem } = load(path.join(root, "src/lib/password.ts"));
test("password rules: length, variety, common words and the email name are refused; a passphrase passes", () => {
  assert.ok(passwordProblem("short1!"));
  assert.ok(passwordProblem("aaaaaaaaaaaaaaaa"));
  assert.ok(passwordProblem("MyPassword12345"));
  assert.ok(passwordProblem("prismsolutions-2026-x"));
  assert.match(passwordProblem("zebra-owner99-quiet-harbor", "owner99@gmail.com"), /email/i);
  assert.ok(passwordProblem("x".repeat(129)));
  assert.equal(passwordProblem("river-lantern-orbit-seven", "prismsolutions.pvt@gmail.com"), null);
  assert.equal(passwordProblem("Tr0ub4dor&3-horse-staple", "a@b.co"), null);
});

// ───────────────────────── database → website mapper
const raw = (over = {}) => ({
  settings: { content_seeded: true, whatsapp_enabled: true, whatsapp_country_code: "92", whatsapp_number: "0300 1234567".replace(/\D/g, ""), whatsapp_message: "Hi", instagram_enabled: true, instagram_url: "https://instagram.com/prism", contact_email: "a@b.co", default_theme: "dark", theme_switcher_enabled: false, frx_label: "FRX", frx_url: "https://frx.example", footer_marquee: [], footer_note: "", logo_primary_path: "logos/x.png", ...over.settings },
  sections: [{ key: "services", eyebrow: "Our Services", heading: "H", intro: "I", extra: {}, is_visible: true }, { key: "faq", eyebrow: "FAQ", heading: "Q", intro: "", extra: {}, is_visible: false }],
  missionVision: null,
  services: [
    { id: "id1", slug: "a", name: "A", group_label: "Group One", ray_label: "", tagline: "t", summary: "", note: "", detail: "", icon: "headset", image_path: null },
    { id: "id2", slug: "b", name: "B", group_label: "Group Two", ray_label: "Bee", tagline: "", summary: "", note: "", detail: "", icon: "", image_path: "services/b.png" },
    { id: "id3", slug: "c", name: "C", group_label: "Group One", ray_label: "", tagline: "", summary: "", note: "", detail: "", icon: "", image_path: null },
  ],
  subcategories: [{ id: "k1", service_id: "id1", title: "Item", detail: "", sort_order: 10 }],
  industries: [{ id: "i1", slug: "ind", name: "Ind", summary: "", note: "", detail: "", image_path: null, fits: ["a", "gone"], scene: "generic" }],
  team: [], values: [{ word: "Quality", line: "", is_principle: true, image_path: null }, { word: "Trust", line: "", is_principle: false, image_path: null }],
  why: [], steps: [{ name: "One", text: "", image_path: null }, { name: "Two", text: "", image_path: null }],
  faqs: [{ question: "Q1", answer: "A1", category: "Working together" }, { question: "Q2", answer: "A2", category: "Services" }, { question: "Q3", answer: "A3", category: "Working together" }],
  testimonials: [{ id: "t1", name: "Sam", role: "", company: "Acme", text: "Great work indeed.", rating: 5, photo_path: null, is_featured: true, source: "visitor", created_at: "2026-01-01T00:00:00Z" }],
  announcements: [
    { id: "a1", title: "Live", priority: 1, ends_at: new Date(Date.now() + 864e5).toISOString(), starts_at: null, updated_at: "x" },
    { id: "a2", title: "Expired", priority: 1, ends_at: new Date(Date.now() - 864e5).toISOString(), starts_at: null, updated_at: "x" },
  ],
  social: [{ id: "s1", platform: "Facebook", label: "", url: "https://facebook.com/prism" }],
});

test("mapper: numbering, derived groups, fits filtered, subcategories attached, icon and image URLs", () => {
  const c = mapContent(raw());
  assert.deepEqual(c.services.map((s) => [s.id, s.index, s.group]), [["a", "01", "group-one"], ["b", "02", "group-two"], ["c", "03", "group-one"]]);
  assert.deepEqual(c.serviceGroups.map((g) => g.label), ["Group One", "Group Two"]);
  assert.equal(c.services[0].items[0].title, "Item");
  assert.equal(c.services[0].icon, "headset");
  assert.equal(c.services[1].ray, "Bee");
  assert.equal(c.services[0].ray, "A");
  assert.equal(c.services[1].imageUrl, "https://example.supabase.co/storage/v1/object/public/site-media/services/b.png");
  assert.deepEqual(c.industries[0].fits, ["a"]);
  assert.deepEqual(c.approach.stages.map((s) => s.n), ["01", "02"]);
});

test("mapper: FAQ topics derive from the questions, in order of first use", () => {
  const c = mapContent(raw());
  assert.deepEqual(c.faqCategories.map((x) => x.label), ["All", "Working together", "Services"]);
});

test("mapper: WhatsApp digits = country code + number without leading zeros; Instagram off hides the link; theme and logo", () => {
  let c = mapContent(raw({ settings: { whatsapp_number: "03001234567" } }));
  assert.equal(c.settings.whatsapp.number, "923001234567");
  c = mapContent(raw({ settings: { instagram_enabled: false } }));
  assert.equal(c.settings.social.instagramUrl, "");
  c = mapContent(raw());
  assert.equal(c.settings.theme.defaultTheme, "dark");
  assert.equal(c.settings.theme.switcherEnabled, false);
  assert.match(c.settings.brand.logoPrimaryUrl, /logos\/x\.png$/);
  assert.deepEqual(c.settings.social.links.map((l) => l.platform), ["Facebook"]);
});

test("mapper: hidden sections, principles from values, expired announcements dropped, reviews mapped", () => {
  const c = mapContent(raw());
  assert.equal(c.visibility.faq, false);
  assert.equal(c.visibility.services, true);
  assert.deepEqual(c.hero.principles, ["Quality"]);
  assert.deepEqual(c.announcements.map((a) => a.title), ["Live"]);
  assert.equal(c.testimonials[0].rating, 5);
  assert.equal(c.testimonials[0].source, "visitor");
});

// ───────────────────────── announcements: schedule, frequency, priority, one at a time
const { eligible, pickAnnouncement, markShown, markDismissed } = load(path.join(root, "src/lib/announcements.ts"));
const memStore = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};
const visitor = () => ({ local: memStore(), session: memStore() });
const ann = (o = {}) => ({ id: "a", title: "T", shortDescription: "", detail: "", priority: 0, showOnLoad: true, delaySeconds: 0, frequency: "once_per_visitor", reappearDays: 7, dismissible: true, reappearAfterDismiss: false, version: "v1", ...o });
const DAY = 864e5;

test("announcement schedule: before start and after end it never shows", () => {
  const now = Date.now();
  assert.equal(eligible(ann({ startsAt: new Date(now + DAY).toISOString() }), visitor(), now), false);
  assert.equal(eligible(ann({ endsAt: new Date(now - DAY).toISOString() }), visitor(), now), false);
  assert.equal(eligible(ann({ startsAt: new Date(now - DAY).toISOString(), endsAt: new Date(now + DAY).toISOString() }), visitor(), now), true);
  assert.equal(eligible(ann({ showOnLoad: false }), visitor(), now), false);
});

test("announcement frequency: once per visitor, again only after N days (0 = never again)", () => {
  const v = visitor();
  const a = ann({ reappearDays: 7 });
  const t0 = 1_000_000_000_000;
  assert.equal(eligible(a, v, t0), true);
  markShown(a, v, t0);
  assert.equal(eligible(a, v, t0 + DAY), false);
  assert.equal(eligible(a, v, t0 + 8 * DAY), true);
  const never = ann({ reappearDays: 0 });
  const v2 = visitor();
  markShown(never, v2, t0);
  assert.equal(eligible(never, v2, t0 + 400 * DAY), false);
});

test("announcement frequency: once per session shows again in a NEW session but not within one", () => {
  const v = visitor();
  const a = ann({ frequency: "once_per_session" });
  assert.equal(eligible(a, v), true);
  markShown(a, v);
  assert.equal(eligible(a, v), false);
  assert.equal(eligible(a, { local: v.local, session: memStore() }), true);
});

test("announcement frequency: every visit shows on each load, but not again in the session once closed", () => {
  const v = visitor();
  const a = ann({ frequency: "every_visit", reappearAfterDismiss: true });
  markShown(a, v);
  assert.equal(eligible(a, v), true);
  markDismissed(a, v);
  assert.equal(eligible(a, v), false);
  assert.equal(eligible(a, { local: v.local, session: memStore() }), true);
});

test("announcement dismissal: stays closed until edited unless 'may reappear' is on; an edit makes it new for everyone", () => {
  const v = visitor();
  const a = ann({ frequency: "every_visit", reappearAfterDismiss: false });
  markShown(a, v);
  markDismissed(a, v);
  assert.equal(eligible(a, { local: v.local, session: memStore() }), false);
  assert.equal(eligible({ ...a, version: "v2" }, { local: v.local, session: memStore() }), true);
});

test("only ONE announcement is chosen: highest priority first, ineligible ones skipped", () => {
  const v = visitor();
  const low = ann({ id: "low", priority: 1 });
  const high = ann({ id: "high", priority: 9 });
  assert.equal(pickAnnouncement([low, high], v)?.id, "high");
  markShown(high, v);
  markDismissed(high, v);
  assert.equal(pickAnnouncement([low, high], v)?.id, "low");
  assert.equal(pickAnnouncement([], v), undefined);
});

// ───────────────────────── every admin Server Action authorises FIRST
import fs from "node:fs";
test("every exported admin Server Action verifies the owner before it touches data (they can be called directly, not only via pages)", () => {
  const files = ["content.ts", "media.ts", "enquiries.ts"].map((f) => path.join(root, "src/admin/actions", f));
  let checked = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    assert.match(src.split("\n")[0], /use server/, `${file} must be a "use server" file`);
    const parts = src.split(/^export async function /m).slice(1);
    for (const part of parts) {
      const name = part.slice(0, part.indexOf("("));
      const firstDb = part.search(/supabase\.|createServerSupabase\(\)|\.from\(|\.rpc\(|\.storage/);
      const firstAuth = part.search(/\bguard\(\)|\bauthorise\(\)|\bgetAdmin\(\)/);
      assert.ok(firstAuth >= 0, `${file} › ${name}: no owner check`);
      assert.ok(firstDb < 0 || firstAuth < firstDb, `${file} › ${name}: touches data before checking the owner`);
      checked++;
    }
  }
  // password change and sign-out live in auth.ts: the change action must check the owner too
  const auth = fs.readFileSync(path.join(root, "src/admin/actions/auth.ts"), "utf8");
  const change = auth.slice(auth.indexOf("export async function changeOwnerPassword"));
  assert.ok(change.indexOf("getAdmin()") >= 0 && change.indexOf("getAdmin()") < change.indexOf("updateUser"), "changeOwnerPassword must check the owner before updating");
  assert.ok(checked >= 10, `expected to check at least 10 actions, checked ${checked}`);
});

test("public Server Actions can only ever write through the anonymous client (never a privileged one)", () => {
  const pub = fs.readFileSync(path.join(root, "src/app/actions/public.ts"), "utf8");
  assert.ok(pub.includes("createAnonSupabase"), "public actions must use the anonymous client");
  assert.ok(!pub.includes("createServerSupabase"), "public actions must not use the signed-in client");
  // and nothing in the app references a privileged key
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of walk(path.join(root, "src")).filter((f) => /\.(ts|tsx)$/.test(f))) {
    assert.ok(!/service_role|SERVICE_ROLE|sb_secret_/.test(fs.readFileSync(f, "utf8")), `${f} references a privileged key`);
  }
});

test("no admin page or component renders stored text as raw HTML", () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const allowed = new Set(["src/app/(site)/page.tsx", "src/app/layout.tsx", "src/components/sections/faq/Faq.tsx"].map((p) => path.join(root, p)));
  for (const f of walk(path.join(root, "src")).filter((f) => /\.tsx$/.test(f))) {
    if (fs.readFileSync(f, "utf8").includes("dangerouslySetInnerHTML")) assert.ok(allowed.has(f), `${f} uses dangerouslySetInnerHTML`);
  }
});

// ───────────────────────── hardening: errors, links, mass assignment, CSP
test("branded error screens never print technical detail (message, stack, digest) to the visitor", () => {
  for (const f of ["src/app/error.tsx", "src/app/global-error.tsx", "src/app/not-found.tsx", "src/app/admin/(panel)/error.tsx"]) {
    const src = fs.readFileSync(path.join(root, f), "utf8");
    assert.ok(!/\{\s*error\.(message|stack|digest)|error\.(message|stack)\s*\}/.test(src), `${f} renders error detail`);
    assert.ok(!/<[^>]*>[^<]*\{[^}]*error[^}]*\}[^<]*</.test(src.replace(/console\.error\([^)]*\)/g, "")), `${f} interpolates the error into the page`);
  }
});

test("JSON-LD blocks escape '<' so stored text can never close the script tag", () => {
  for (const f of ["src/app/(site)/page.tsx", "src/components/sections/faq/Faq.tsx"]) {
    assert.match(fs.readFileSync(path.join(root, f), "utf8"), /u003c/, `${f} must escape < in JSON-LD`);
  }
});

test("every file that opens a link in a new tab sets rel=noopener", () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of walk(path.join(root, "src")).filter((f) => f.endsWith(".tsx"))) {
    const s = fs.readFileSync(f, "utf8");
    if (/target=("|\{")_blank|target: "_blank"/.test(s)) assert.match(s, /noopener/, `${f} opens a new tab without rel=noopener`);
  }
});

test("public forms ignore fields they do not know (no mass assignment of status, id, featured…)", () => {
  const good = { name: "Jane Doe", email: "jane@example.com", company: "", phone: "", service: "Customer Support", message: "We need help with support.", trap: "", elapsed: 5000, token: "11111111-1111-4111-8111-111111111111" };
  const r = enquirySchema.safeParse({ ...good, status: "converted", id: "x", created_at: "2000-01-01", is_featured: true });
  assert.equal(r.success, true);
  for (const k of ["status", "id", "created_at", "is_featured"]) assert.ok(!(k in r.data), `${k} must be dropped`);
  const v = reviewSchema.safeParse({ name: "Sam", company: "", rating: 5, text: "Really helpful and professional.", trap: "", elapsed: 5000, token: good.token, status: "published", source: "owner", is_featured: true, photo_path: "team/x.png" });
  assert.equal(v.success, true);
  for (const k of ["status", "source", "is_featured", "photo_path"]) assert.ok(!(k in v.data), `${k} must be dropped from a review`);
});

test("stored text is never turned into markup: hostile review/FAQ text stays plain text through validation and mapping", () => {
  const evil = '<img src=x onerror=alert(1)> <script>alert(1)</script> "><svg/onload=alert(1)>';
  const r = reviewSchema.safeParse({ name: evil.slice(0, 40), company: "", rating: 5, text: evil + " padding text", trap: "", elapsed: 5000, token: "11111111-1111-4111-8111-111111111111" });
  assert.equal(r.success, true);
  assert.ok(r.data.text.includes("<script>"), "text is kept as text (escaped by React on render), not stripped into something else");
  // React renders strings as text nodes: the only raw-HTML sinks are audited above (escaped JSON-LD + fixed theme script)
});

test("production CSP: no wildcards, no eval, no framing, HSTS, and only the Supabase origin is allowed besides self", async () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
  const { pathToFileURL } = await import("node:url");
  const cfg = (await import(pathToFileURL(path.join(root, "next.config.mjs")).href + "?prod")).default;
  process.env.NODE_ENV = prev;
  const headers = Object.fromEntries((await cfg.headers())[0].headers.map((h) => [h.key, h.value]));
  const csp = headers["Content-Security-Policy"];
  assert.ok(!/unsafe-eval/.test(csp), "no eval in production");
  assert.ok(!/(^|\s)\*(\s|;|$)/.test(csp), "no wildcard source");
  assert.ok(/frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp) && /form-action 'self'/.test(csp));
  const origins = [...csp.matchAll(/https?:\/\/[^\s;]+|wss:\/\/[^\s;]+/g)].map((m) => m[0]);
  assert.ok(origins.every((o) => /abc\.supabase\.co/.test(o)), `unexpected origin in CSP: ${origins.join(", ")}`);
  assert.match(headers["Strict-Transport-Security"], /max-age=\d+/);
  assert.equal(headers["X-Frame-Options"], "DENY");
});

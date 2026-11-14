/**
 * Defensive security check of a RUNNING Prism site and its Supabase project, from a visitor's point of view.
 *   npm run build && npm start      (in another terminal)
 *   npm run security:check [http://localhost:5200]
 *
 * It only ever acts as an anonymous visitor (the public/publishable key). Every "attack" below must be REFUSED; if one is
 * accepted the script says so and exits non-zero. It reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * from the environment or .env.local, prints no secret, and creates no data (the only writes it attempts are forbidden ones).
 * Never point it at anything you do not own.
 */
import fs from "node:fs";
import path from "node:path";

const base = (process.argv[2] ?? "http://localhost:5200").replace(/\/$/, "");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");

// minimal .env.local loader (no dependency)
const envFile = path.join(root, ".env.local");
if (fs.existsSync(envFile)) for (const l of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim(); }
const SB = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

let pass = 0, fail = 0, skip = 0;
const ok = (name, cond, detail = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : `  ← ${detail}`}`); };
const skipped = (name, why) => { skip++; console.log(`SKIP  ${name}  (${why})`); };

// ── 1. headers ──
const home = await fetch(base + "/");
const h = (n) => home.headers.get(n) ?? "";
const csp = h("content-security-policy");
ok("CSP present and restrictive (default-src 'self', no wildcard sources)", /default-src 'self'/.test(csp) && !/\s\*(\s|;|$)/.test(csp), csp.slice(0, 80));
ok("CSP forbids framing, plugins and foreign <base>", /frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp));
ok("CSP does not allow eval in this build", !/unsafe-eval/.test(csp), "unsafe-eval present (expected only in dev)");
ok("X-Content-Type-Options: nosniff", h("x-content-type-options") === "nosniff");
ok("X-Frame-Options: DENY", h("x-frame-options") === "DENY");
ok("Referrer-Policy set", /strict-origin/.test(h("referrer-policy")));
ok("Permissions-Policy denies camera/microphone/geolocation", /camera=\(\)/.test(h("permissions-policy")) && /microphone=\(\)/.test(h("permissions-policy")));
ok("Cross-Origin-Opener-Policy: same-origin", h("cross-origin-opener-policy") === "same-origin");
ok("X-Powered-By is not disclosed", !h("x-powered-by"));
if (base.startsWith("https://") || /production/.test(process.env.NODE_ENV ?? "")) ok("HSTS present", /max-age=\d+/.test(h("strict-transport-security")));
else skipped("HSTS header", "only sent by production builds");

// ── 2. admin area from a signed-out visitor ──
const routes = ["/admin", "/admin/company", "/admin/mission-vision", "/admin/values", "/admin/why", "/admin/approach", "/admin/services", "/admin/industries", "/admin/team", "/admin/testimonials", "/admin/faqs", "/admin/announcements", "/admin/enquiries", "/admin/enquiries/00000000-0000-0000-0000-000000000000", "/admin/contact", "/admin/settings"];
let leaked = [];
for (const r of routes) {
  const res = await fetch(base + r, { redirect: "manual" });
  if (!(res.status === 307 || res.status === 308 || res.status === 302) || !(res.headers.get("location") ?? "").includes("/admin/login")) leaked.push(`${r} → ${res.status}`);
}
ok(`all ${routes.length} admin pages redirect a signed-out visitor to sign-in`, leaked.length === 0, leaked.join(", "));
const login = await fetch(base + "/admin/login", { redirect: "manual" });
ok("sign-in page is not cached and not indexed", /no-store/.test(login.headers.get("cache-control") ?? "") && /noindex/.test(login.headers.get("x-robots-tag") ?? ""));
const sess = await (await fetch(base + "/api/admin/session")).json();
ok("session endpoint answers only a bare boolean, false for visitors", JSON.stringify(sess) === '{"admin":false}', JSON.stringify(sess));
const cb1 = await fetch(base + "/auth/callback", { redirect: "manual" });
const cb2 = await fetch(base + "/auth/callback?code=forged&next=https://evil.example", { redirect: "manual" });
ok("forged sign-in callbacks are rejected and never redirect off-site", [cb1, cb2].every((r) => (r.headers.get("location") ?? "").includes("/admin/login") && !/evil/.test(r.headers.get("location") ?? "")));
const nf = await fetch(base + "/no-such-page-" + Date.now());
const nfBody = await nf.text();
ok("unknown pages return a branded 404 with no technical detail", nf.status === 404 && /different path/.test(nfBody) && !/\bat\s+\S+\.(js|ts)|stack|ENOENT|node_modules/i.test(nfBody));

// ── 3. nothing sensitive in what the browser downloads ──
const pageHtml = await (await fetch(base + "/")).text();
const scripts = [...pageHtml.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]);
let bundle = pageHtml;
for (const s of [...new Set(scripts)]) bundle += await (await fetch(base + s.replace(/\(/g, "%28").replace(/\)/g, "%29"))).text();
ok("no service-role / secret key markers in the HTML or any script the page loads", !/service_role|sb_secret_|SUPABASE_SERVICE/.test(bundle));
ok("no JWT-shaped credential in the HTML or scripts", !/eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}/.test(bundle));
ok("no source maps are published", !(await fetch(base + (scripts[0] ?? "/x") + ".map")).ok);

// ── 4. the Supabase project, as an anonymous visitor ──
if (!SB || !KEY) {
  skipped("Supabase visitor checks", "NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY not set");
} else {
  const rest = (p, init = {}) => fetch(`${SB}/rest/v1/${p}`, { ...init, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });
  // `gone` = a 404 also counts as refused (the API does not expose that function at all)
  const refused = async (name, p, init, gone = false) => { const r = await rest(p, init); ok(name, r.status === 401 || r.status === 403 || (gone && r.status === 404) || (r.status === 200 && (await r.clone().json()).length === 0), `HTTP ${r.status}`); };
  for (const t of ["enquiries", "enquiry_notes", "owner_lock", "activity_log", "media_assets"]) await refused(`visitor cannot read ${t}`, `${t}?select=*&limit=1`);
  await refused("visitor cannot read pending/rejected reviews", "testimonials?select=name&status=in.(pending,rejected)");
  const settings = await rest("site_settings?select=updated_by&limit=1");
  ok("visitor cannot read the administrator column site_settings.updated_by", settings.status === 401 || settings.status === 403, `HTTP ${settings.status}: apply migration 20261114000100_hardening.sql in Supabase`);
  const pub = await rest("services?select=slug&is_published=eq.false");
  ok("visitor sees no unpublished services", pub.ok && (await pub.json()).length === 0);
  await refused("visitor cannot publish their own review", "testimonials", { method: "POST", body: JSON.stringify({ name: "x", text: "attempted self-published review", rating: 5, source: "visitor", status: "published" }) });
  await refused("visitor cannot feature their own review", "testimonials", { method: "POST", body: JSON.stringify({ name: "x", text: "attempted featured review!!", rating: 5, source: "visitor", status: "pending", is_featured: true }) });
  await refused("visitor cannot set an enquiry's status", "enquiries", { method: "POST", body: JSON.stringify({ name: "Test", email: "t@example.com", message: "attempted status change", status: "converted" }) });
  await refused("visitor cannot edit site settings", "site_settings?id=eq.1", { method: "PATCH", body: JSON.stringify({ contact_email: "evil@example.com" }) });
  await refused("visitor cannot delete a service", "services?slug=eq.__never__", { method: "DELETE" });
  await refused("visitor cannot call the owner check", "rpc/is_owner", { method: "POST", body: "{}" });
    const sub = await rest("rpc/save_service_subcategories", { method: "POST", body: JSON.stringify({ p_service: "00000000-0000-0000-0000-000000000000", p_items: [] }) });
  ok("hardening migration is applied (subcategory writer exists and refuses visitors)", sub.status === 401 || sub.status === 403, `HTTP ${sub.status}: apply migration 20261114000100_hardening.sql in Supabase`);
  await refused("visitor cannot call a trigger function", "rpc/log_activity", { method: "POST", body: "{}" }, true);
  const up = await fetch(`${SB}/storage/v1/object/site-media/team/anon-check.png`, { method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "image/png" }, body: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) });
  ok("visitor cannot upload to the image bucket", !up.ok, `HTTP ${up.status}`);
  const list = await fetch(`${SB}/storage/v1/object/list/site-media`, { method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ prefix: "", limit: 5 }) });
  ok("visitor cannot list the image bucket", !list.ok || (await list.json()).length === 0);
  const del = await fetch(`${SB}/storage/v1/object/site-media`, { method: "DELETE", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: ["team/anon-check.png"] }) });
  ok("visitor cannot delete from the image bucket", !del.ok || (await del.json()).length === 0);
  const auth = await (await fetch(`${SB}/auth/v1/settings`, { headers: { apikey: KEY } })).json();
  ok("public sign-up is DISABLED in Supabase Auth", auth.disable_signup === true, "disable_signup is false: turn off 'Allow new users to sign up'");
  ok("no third-party sign-in provider is enabled", !Object.entries(auth.external ?? {}).some(([k, v]) => v && k !== "email"), "an OAuth provider is enabled");
}

console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped`);
process.exit(fail ? 1 : 0);

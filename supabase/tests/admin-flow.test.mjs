/**
 * Admin ↔ database ↔ public site, end to end (minus the HTTP hop).
 *   npm run db:test
 *
 * For EVERY admin module this takes the module's own field definitions (src/admin/registry.ts), builds a valid form
 * submission, runs it through the REAL server-side validator (src/admin/parse.ts), writes it with the same statements
 * the Server Actions issue, as the owner, against the REAL migrations, then reads it back as a visitor and through the
 * REAL public mapper (src/lib/content/map.ts). It also proves the registry and the schema agree (every form field is a real
 * column; every required column has a form field), that unpublished content is invisible to visitors, that ordering,
 * deleting and cascades work, and that the change history is recorded.
 *
 * What it does NOT cover: the HTTP request from the browser to Supabase and the cookie session (needs the real owner login).
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { bootDb } from "./harness.mjs";
import { loadTs } from "../../scripts/ts-loader.mjs";

const { PUBLIC_SETTINGS_COLUMNS } = loadTs("src/lib/content/columns.ts");

const { RESOURCES, SINGLETONS } = loadTs("src/admin/registry.ts");
const { parseFields } = loadTs("src/admin/parse.ts");
const { mapContent } = loadTs("src/lib/content/map.ts");
const { slugify } = loadTs("src/lib/slug.ts");

const H = await bootDb();
const { db, anon, owner, rows } = H;
after(async () => db.close());

const ARRAY_KINDS = new Set(["lines", "paragraphs", "multi"]);
const cast = (f) => (ARRAY_KINDS.has(f.kind) ? "::text[]" : f.kind === "pairs" ? "::jsonb" : "");
const pg = (f, v) => (f.kind === "pairs" ? JSON.stringify(v) : v);

/** A valid submission for a field, the way a person would fill the form. */
function sample(f, tag) {
  switch (f.kind) {
    case "text":
    case "combo":
      return `QA ${f.label} ${tag}`.slice(0, Math.min(f.max ?? 200, 70));
    case "email":
      return "qa@example.com";
    case "phone":
      return "+1 555 010 2030";
    case "digits":
      return "1".repeat(Math.min(f.max ?? 3, 3));
    case "slug":
      return "";
    case "textarea":
      return `QA text for ${f.label}. `.repeat(2).slice(0, Math.min(f.max ?? 200, 120));
    case "paragraphs":
      return "Paragraph one.\n\nParagraph two.";
    case "lines":
      return "first\nsecond";
    case "number":
      return String(f.min ?? f.default ?? 1);
    case "switch":
      return true;
    case "select":
      return f.options.find((o) => o.value)?.value ?? "";
    case "multi":
      return ["customer-support"];
    case "image":
    case "datetime":
      return "";
    case "url":
      return f.httpOnly ? "https://example.com/qa" : "/#contact";
    case "pairs":
      return [{ title: "Point", text: "Detail" }];
  }
}

function form(fields, tag, over = {}) {
  const raw = {};
  for (const f of fields) raw[f.name] = sample(f, tag);
  return { ...raw, ...over };
}

const valid = (fields, raw) => {
  const r = parseFields(fields, raw);
  assert.equal(r.ok, true, `validator rejected a valid sample: ${JSON.stringify(r.errors)}`);
  return r.data;
};

/** Same shape of statement the Server Action issues for a new record. */
async function insertRecord(def, data, extra = {}) {
  const fields = def.fields;
  const cols = fields.map((f) => f.name);
  const vals = fields.map((f) => pg(f, data[f.name]));
  const casts = fields.map(cast);
  for (const [k, v] of Object.entries(extra)) (cols.push(k), vals.push(v), casts.push(""));
  const sql = `insert into public.${def.table} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}${casts[i]}`).join(", ")}) returning id`;
  return (await owner(() => db.query(sql, vals))).rows[0].id;
}

async function updateRecord(def, id, data) {
  const fields = def.fields;
  const sql = `update public.${def.table} set ${fields.map((f, i) => `${f.name} = $${i + 1}${cast(f)}`).join(", ")} where id = $${fields.length + 1}`;
  await owner(() => db.query(sql, [...fields.map((f) => pg(f, data[f.name])), id]));
}

const slugOf = (def) => def.fields.find((f) => f.kind === "slug");
function prepare(def, tag, over = {}) {
  const data = valid(def.fields, form(def.fields, tag, over));
  const sf = slugOf(def);
  if (sf) data[sf.name] = `${slugify(String(data[sf.from ?? def.titleField]))}-${tag}`.slice(0, 60); // the action generates this
  return data;
}

/** The status/flag value that makes a record public. */
function publicOverrides(def) {
  const o = {};
  if (def.tabs) o[def.tabs.column] = "published";
  return o;
}
const isPublicFlag = (def, on) => (def.tabs ? { [def.tabs.column]: on ? "published" : "pending" } : def.flag ? { [def.flag.column]: on } : {});

/* ───────────────────────── registry ⇄ schema agreement ───────────────────────── */

test("every form field is a real column, and every required column has a form field (no module can fail on save)", async () => {
  const problems = [];
  const check = async (table, fields, extraOk = []) => {
    const cols = await rows(`select column_name c, is_nullable n, column_default d, data_type t from information_schema.columns where table_schema='public' and table_name=$1`, [table]);
    const byName = new Map(cols.map((c) => [c.c, c]));
    for (const f of fields) {
      const name = f.name.startsWith("extra.") ? "extra" : f.name;
      if (!byName.has(name)) problems.push(`${table}.${f.name}: no such column`);
    }
    const have = new Set(fields.map((f) => (f.name.startsWith("extra.") ? "extra" : f.name)));
    for (const c of cols) if (c.n === "NO" && c.d === null && !["id", "created_at", "updated_at", "key"].includes(c.c) && !extraOk.includes(c.c) && !have.has(c.c)) problems.push(`${table}.${c.c}: required but has no form field`);
  };
  for (const def of Object.values(RESOURCES)) {
    await check(def.table, def.fields, def.children ? [] : []);
    if (def.children) await check(def.children.table, def.children.fields, [def.children.fk]);
    if (def.order) assert.ok((await rows(`select 1 from information_schema.columns where table_name=$1 and column_name='sort_order'`, [def.table])).length, `${def.table} lacks sort_order`);
    if (def.flag) assert.ok((await rows(`select 1 from information_schema.columns where table_name=$1 and column_name=$2`, [def.table, def.flag.column])).length, `${def.table} lacks ${def.flag.column}`);
    for (const k of Object.keys(def.quick ?? {})) assert.ok((await rows(`select 1 from information_schema.columns where table_name=$1 and column_name=$2`, [def.table, k])).length, `${def.table} lacks quick column ${k}`);
  }
  for (const def of Object.values(SINGLETONS)) await check(def.table === "site_sections" ? "site_sections" : def.table, def.fields, ["eyebrow", "heading"]);
  assert.deepEqual(problems, []);
});

/* ───────────────────────── every collection: create → public → edit → hide → reorder → delete ───────────────────────── */

for (const def of Object.values(RESOURCES)) {
  test(`${def.key}: add, read as visitor, edit, hide, reorder, delete`, async () => {
    const tag = `${def.key}-${Date.now().toString(36)}`.replace(/[^a-z0-9-]/g, "").slice(0, 28);

    // 1. add (live)
    const data = prepare(def, tag, publicOverrides(def));
    if (def.flag) data[def.flag.column] = true;
    const id = await insertRecord(def, data, def.order ? { sort_order: 900 } : {});
    const mine = async () => (await rows(`select * from public.${def.table} where id = $1`, [id]))[0];
    const stored = await mine();
    assert.ok(stored, "row was not saved");
    for (const f of def.fields) {
      if (ARRAY_KINDS.has(f.kind)) assert.deepEqual(stored[f.name], data[f.name], `${f.name} round-trip`);
      else if (f.kind === "pairs") assert.deepEqual(stored[f.name], data[f.name], `${f.name} round-trip`);
      else if (f.kind === "number") assert.equal(Number(stored[f.name]), Number(data[f.name]), `${f.name} round-trip`);
      else assert.equal(stored[f.name] ?? "", data[f.name] ?? "", `${f.name} round-trip`);
    }

    // 2. a visitor sees it (it is live)
    const seen = async () => (await anon(() => rows(`select id from public.${def.table} where id = $1`, [id]))).length;
    if (def.flag || def.tabs) assert.equal(await seen(), 1, "live record must be visible to visitors");

    // 3. edit persists
    const edited = { ...data, [def.titleField]: `Edited ${tag}`.slice(0, 60) };
    await updateRecord(def, id, edited);
    assert.equal((await mine())[def.titleField], edited[def.titleField]);

    // 4. hide it: it must disappear for visitors but stay for the owner
    if (def.flag || def.tabs) {
      const off = isPublicFlag(def, false);
      const [col, val] = Object.entries(off)[0];
      await owner(() => db.query(`update public.${def.table} set ${col} = $1 where id = $2`, [val, id]));
      assert.equal(await seen(), 0, "hidden record must NOT be visible to visitors");
      assert.ok(await mine(), "hidden record must remain for the owner");
    }

    // 5. reorder (atomic RPC)
    if (def.order) {
      const id2 = await insertRecord(def, prepare(def, `${tag}b`, publicOverrides(def)), { sort_order: 901 });
      await owner(() => db.query("select public.reorder_rows($1, $2::uuid[])", [def.table, `{${id2},${id}}`]));
      const [a, b] = await Promise.all([rows(`select sort_order from public.${def.table} where id=$1`, [id2]), rows(`select sort_order from public.${def.table} where id=$1`, [id])]);
      assert.ok(a[0].sort_order < b[0].sort_order, "reorder_rows must put the first id first");
      await owner(() => db.query(`delete from public.${def.table} where id = $1`, [id2]));
    }

    // 6. delete
    await owner(() => db.query(`delete from public.${def.table} where id = $1`, [id]));
    assert.equal(await mine(), undefined, "row was not deleted");

    // 7. the change history recorded it
    const log = await owner(() => rows(`select action from public.activity_log where table_name = $1 and record_id = $2 order by id`, [def.table, id]));
    assert.ok(log.map((l) => l.action).includes("insert") && log.map((l) => l.action).includes("delete"), "activity log must record insert and delete");
  });
}

test("services: subcategories are saved with the service, hidden with an unpublished parent, and removed with it", async () => {
  const def = RESOURCES.services;
  const ch = def.children;
  const data = prepare(def, "svc1", { is_published: true });
  const sid = await insertRecord(def, data, { sort_order: 950 });
  const kids = [valid(ch.fields, { title: "Item A", detail: "a", is_published: true }), valid(ch.fields, { title: "Item B", detail: "", is_published: false })];
  for (const [i, k] of kids.entries()) await owner(() => db.query(`insert into public.${ch.table} (${ch.fk}, title, detail, is_published, sort_order) values ($1,$2,$3,$4,$5)`, [sid, k.title, k.detail, k.is_published, (i + 1) * 10]));
  const pub = () => anon(() => rows(`select title from public.${ch.table} where ${ch.fk} = $1 order by sort_order`, [sid]));
  assert.deepEqual((await pub()).map((r) => r.title), ["Item A"], "only the published subcategory is public");
  await owner(() => db.query("update public.services set is_published = false where id = $1", [sid]));
  assert.deepEqual(await pub(), [], "subcategories of an unpublished service must be hidden");
  await owner(() => db.query("delete from public.services where id = $1", [sid]));
  assert.equal((await rows(`select count(*)::int n from public.${ch.table} where ${ch.fk} = $1`, [sid]))[0].n, 0, "deleting a service must delete its subcategories");
});

test("services: a duplicate web-address name is refused by the database (the action turns this into a friendly message)", async () => {
  const def = RESOURCES.services;
  const data = prepare(def, "dup");
  await insertRecord(def, data, { sort_order: 960 });
  await H.denied(insertRecord(def, data, { sort_order: 961 }), /duplicate key|unique/);
  await owner(() => db.query("delete from public.services where slug = $1", [data.slug]));
});

/* ───────────────────────── every one-row form ───────────────────────── */

async function applySingleton(def, data) {
  if (def.table === "site_sections") {
    const top = {};
    const extra = {};
    for (const [k, v] of Object.entries(data)) (k.startsWith("extra.") ? extra : top)[k.startsWith("extra.") ? k.slice(6) : k] = v;
    const fieldOf = (n) => def.fields.find((f) => f.name === n);
    const cols = Object.keys(top);
    const sql = `insert into public.site_sections (key, ${cols.join(", ")}, extra) values ($1, ${cols.map((c, i) => `$${i + 2}${cast(fieldOf(c))}`).join(", ")}, $${cols.length + 2}::jsonb)
      on conflict (key) do update set ${cols.map((c) => `${c} = excluded.${c}`).join(", ")}, extra = public.site_sections.extra || excluded.extra`;
    await owner(() => db.query(sql, [def.sectionKey, ...cols.map((c) => pg(fieldOf(c), top[c])), JSON.stringify(extra)]));
  } else {
    const cols = def.fields.map((f) => f.name);
    const sql = `update public.${def.table} set ${cols.map((c, i) => `${c} = $${i + 1}${cast(def.fields[i])}`).join(", ")} where id = 1`;
    await owner(() => db.query(sql, def.fields.map((f) => pg(f, data[f.name]))));
  }
}

for (const def of Object.values(SINGLETONS)) {
  test(`${def.key}: the form saves to ${def.table}${def.sectionKey ? ` (${def.sectionKey})` : ""} and reads back`, async () => {
    const data = valid(def.fields, form(def.fields, def.key));
    await applySingleton(def, data);
    const row = (await anon(() => rows(def.table === "site_sections" ? `select * from public.site_sections where key = '${def.sectionKey}'` : def.table === "site_settings" ? `select ${PUBLIC_SETTINGS_COLUMNS} from public.site_settings where id = 1` : `select * from public.${def.table} where id = 1`)))[0];
    assert.ok(row, "row must be readable by visitors");
    for (const f of def.fields) {
      const got = f.name.startsWith("extra.") ? row.extra[f.name.slice(6)] : row[f.name];
      if (ARRAY_KINDS.has(f.kind) || f.kind === "pairs") assert.deepEqual(got, data[f.name], `${f.name} round-trip`);
      else assert.equal(got ?? "", data[f.name] ?? "", `${f.name} round-trip`);
    }
  });
}

test("a visitor who cannot read anything private still gets a complete, well-formed public page from what the owner saved", async () => {
  const q = (t, order = true) => anon(() => rows(`select * from public.${t}${order ? " order by sort_order, created_at" : ""}`));
  const [settings] = await anon(() => rows(`select ${PUBLIC_SETTINGS_COLUMNS} from public.site_settings where id = 1`));
  const [mv] = await anon(() => rows("select * from public.mission_vision where id = 1"));
  const raw = {
    settings, sections: await q("site_sections", false), missionVision: mv, services: await q("services"), subcategories: await q("service_subcategories"),
    industries: await q("industries"), team: await q("team_members"), values: await q("core_values"), why: await q("why_prism_items"), steps: await q("approach_steps"),
    faqs: await q("faqs"), testimonials: await q("testimonials", false), announcements: await q("announcements", false), social: await q("social_links"),
  };
  const c = mapContent(raw);
  assert.equal(c.source, "database");
  // what the singleton tests wrote must surface in the shapes the components read
  assert.equal(c.hero.headline, "QA Headline hero");
  assert.equal(c.settings.contact.phone, "+1 555 010 2030");
  assert.equal(c.settings.contact.email, "qa@example.com");
  assert.equal(c.settings.whatsapp.number, "111111"); // country code "111" + number "111" (the samples)
  assert.match(c.settings.social.instagramUrl, /^https:\/\//);
  assert.deepEqual(c.footer.marquee, ["first", "second"]);
  assert.equal(c.direction.mission.text.startsWith("QA text for Mission statement"), true);
  assert.equal(c.services.length, 7, "the seeded services are still there and nothing leaked in");
  assert.equal(c.team.length, 3);
  assert.ok(c.faqCategories.length >= 2);
  assert.equal(c.testimonials.length, 0, "no review was ever published");
});

test("the owner's changes cannot be made by anyone else: the same writes as a visitor and as a stranger all fail", async () => {
  const def = RESOURCES.faqs;
  const data = prepare(def, "intruder");
  const cols = def.fields.map((f) => f.name);
  const sql = `insert into public.faqs (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")})`;
  const vals = def.fields.map((f) => data[f.name]);
  await H.denied(anon(() => db.query(sql, vals)), /permission denied|row-level security/);
  await H.denied(H.stranger(() => db.query(sql, vals)), /row-level security/);
  await H.denied(anon(() => db.query("update public.site_settings set contact_phone = '000'")), /permission denied/);
  await H.stranger(() => db.query("update public.site_settings set contact_phone = '000' where id = 1"));
  assert.notEqual((await rows("select contact_phone from public.site_settings"))[0].contact_phone, "000");
});

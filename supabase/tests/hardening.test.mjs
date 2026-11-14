/**
 * Database hardening tests (migration 06 and standing rules).   npm run db:test
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { bootDb } from "./harness.mjs";
import { loadTs } from "../../scripts/ts-loader.mjs";

const { PUBLIC_SETTINGS_COLUMNS } = loadTs("src/lib/content/columns.ts");
const H = await bootDb();
const { db, anon, owner, stranger, rows, denied } = H;
after(async () => db.close());

test("function inventory: visitors can execute NOTHING; signed-in users can execute only the four intended functions", async () => {
  const exec = async (role) => (await rows(`select p.proname n from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and has_function_privilege('${role}', p.oid, 'execute') order by 1`)).map((r) => r.n);
  assert.deepEqual(await exec("anon"), [], "anon must not be able to execute any public function");
  assert.deepEqual(await exec("authenticated"), ["current_admin_role", "is_owner", "reorder_rows", "save_service_subcategories"]);
});

test("SECURITY DEFINER inventory: exactly the four justified functions, each with a pinned empty search_path", async () => {
  const defs = await rows(`select p.proname n, p.proconfig c from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and p.prosecdef order by 1`);
  assert.deepEqual(defs.map((d) => d.n), ["current_admin_role", "is_owner", "log_activity", "throttle_public_inserts"]);
  for (const d of defs) assert.ok((d.c ?? []).some((c) => /^search_path=("")?$/.test(c) || c === 'search_path=""' || c.startsWith("search_path=")), `${d.n} must pin search_path`);
});

test("reorder_rows and save_service_subcategories run with the CALLER's rights (SECURITY INVOKER)", async () => {
  const f = await rows(`select proname n, prosecdef d from pg_proc where proname in ('reorder_rows','save_service_subcategories')`);
  assert.equal(f.length, 2);
  for (const x of f) assert.equal(x.d, false, `${x.n} must be SECURITY INVOKER`);
});

test("trigger functions cannot be called through the API by anyone", async () => {
  await denied(anon(() => db.query("select public.log_activity()")), /permission denied/);
  await denied(owner(() => db.query("select public.log_activity()")), /permission denied/);
  await denied(owner(() => db.query("select public.throttle_public_inserts()")), /permission denied/);
});

test("no administrator e-mail is publicly readable: updated_by is blocked and empty, and the public column list matches the database exactly", async () => {
  await denied(anon(() => db.query("select updated_by from public.site_settings")), /permission denied/);
  await denied(anon(() => db.query("select * from public.site_settings")), /permission denied/);
  assert.equal((await rows("select updated_by from public.site_settings"))[0].updated_by, null);
  const dbCols = (await rows(`select column_name c from information_schema.columns where table_schema='public' and table_name='site_settings' and column_name <> 'updated_by' order by 1`)).map((r) => r.c);
  assert.deepEqual([...PUBLIC_SETTINGS_COLUMNS.split(",")].sort(), dbCols, "PUBLIC_SETTINGS_COLUMNS must equal the readable columns (add new columns to both)");
  assert.equal((await anon(() => rows(`select ${PUBLIC_SETTINGS_COLUMNS} from public.site_settings`))).length, 1);
});

test("no column that records WHO administered something is readable by visitors or by signed-in non-owners' read paths (updated_by, author, actor, uploaded_by, invited_by)", async () => {
  const cols = await rows(`select table_name t, column_name c from information_schema.columns where table_schema = 'public' and (column_name ~ '(_by$|^author|^actor|^uploaded)')`);
  assert.ok(cols.length >= 3, "expected to find the administrator-identity columns");
  for (const { t: table, c } of cols) {
    const can = (await rows(`select has_column_privilege('anon', 'public.${table}', '${c}', 'select') ok`))[0].ok;
    assert.equal(can, false, `anon can read ${table}.${c}`);
  }
});

/* ───────── atomic subcategory save ───────── */
async function service(slug) {
  return (await owner(() => rows(`insert into public.services (slug, name, sort_order) values ('${slug}', 'Hardening test', 999) returning id`)))[0].id;
}
const items = (list) => JSON.stringify(list);
const titles = async (id) => (await rows("select title from public.service_subcategories where service_id = $1 order by sort_order", [id])).map((r) => r.title);

test("save_service_subcategories: add, edit, reorder and remove in one call", async () => {
  const id = await service("hard-1");
  await owner(() => db.query("select public.save_service_subcategories($1, $2::jsonb)", [id, items([{ id: null, title: "A", detail: "a", is_published: true }, { id: null, title: "B", detail: "", is_published: false }, { id: null, title: "C", detail: "", is_published: true }])]));
  assert.deepEqual(await titles(id), ["A", "B", "C"]);
  const [a, , c] = (await rows("select id from public.service_subcategories where service_id=$1 order by sort_order", [id])).map((r) => r.id);
  // keep C (first, renamed), keep A (second), drop B, add D
  await owner(() => db.query("select public.save_service_subcategories($1, $2::jsonb)", [id, items([{ id: c, title: "C2", detail: "", is_published: true }, { id: a, title: "A", detail: "a", is_published: true }, { id: null, title: "D", detail: "", is_published: true }])]));
  assert.deepEqual(await titles(id), ["C2", "A", "D"]);
  const visible = () => anon(() => rows("select title from public.service_subcategories where service_id=$1", [id]));
  assert.equal((await visible()).length, 3, "a published parent shows its published subcategories");
  await owner(() => db.query("update public.services set is_published = false where id = $1", [id]));
  assert.equal((await visible()).length, 0, "an unpublished parent keeps its subcategories private");
});

test("save_service_subcategories is ALL-OR-NOTHING: one invalid item undoes the whole save", async () => {
  const id = await service("hard-2");
  await owner(() => db.query("select public.save_service_subcategories($1, $2::jsonb)", [id, items([{ id: null, title: "Keep me", detail: "", is_published: true }])]));
  const before = await titles(id);
  await denied(owner(() => db.query("select public.save_service_subcategories($1, $2::jsonb)", [id, items([{ id: null, title: "Would be added", detail: "", is_published: true }, { id: null, title: "", detail: "", is_published: true }])])), /check|violates/);
  assert.deepEqual(await titles(id), before, "nothing may change when any item is invalid");
});

test("save_service_subcategories: strangers and visitors are refused; bad input is refused", async () => {
  const id = await service("hard-3");
  await denied(anon(() => db.query("select public.save_service_subcategories($1, '[]'::jsonb)", [id])), /permission denied/);
  await denied(stranger(() => db.query("select public.save_service_subcategories($1, '[]'::jsonb)", [id])), /Not authorised/);
  await denied(owner(() => db.query("select public.save_service_subcategories($1, '{}'::jsonb)", [id])), /Invalid/);
  await denied(owner(() => db.query("select public.save_service_subcategories('00000000-0000-0000-0000-000000000099', '[]'::jsonb)")), /not found/);
});

test("reorder_rows: the owner can; a stranger changes nothing even though the function is callable", async () => {
  const ids = (await rows("select id from public.faqs order by sort_order")).map((r) => r.id).reverse();
  await owner(() => db.query("select public.reorder_rows('faqs', $1::uuid[])", [`{${ids.join(",")}}`]));
  assert.equal((await rows("select id from public.faqs order by sort_order limit 1"))[0].id, ids[0]);
  await denied(stranger(() => db.query("select public.reorder_rows('faqs', $1::uuid[])", [`{${ids.join(",")}}`])), /Not authorised/);
});

test("mass assignment: a visitor cannot smuggle privileged columns into a public insert", async () => {
  // columns that were never granted to anon
  await denied(anon(() => db.query("insert into public.enquiries (name, email, message, id) values ('Jo', 'a@b.co', 'a long enough message', gen_random_uuid())")), /permission denied/);
  await denied(anon(() => db.query("insert into public.enquiries (name, email, message, created_at) values ('Jo', 'a@b.co', 'a long enough message', now())")), /permission denied/);
  await denied(anon(() => db.query("insert into public.testimonials (name, text, rating, source, status, sort_order) values ('Jo', 'a long enough review', 5, 'visitor', 'pending', 5)")), /permission denied/);
  await denied(anon(() => db.query("insert into public.testimonials (name, text, rating, source, status, photo_path) values ('Jo', 'a long enough review', 5, 'visitor', 'pending', 'team/x.png')")), /permission denied/);
});

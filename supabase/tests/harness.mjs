/**
 * Shared test harness: boots an in-process PostgreSQL (PGlite), stubs the few Supabase-owned pieces (auth.users,
 * auth.uid(), auth.jwt(), storage tables, the anon/authenticated roles with Supabase's default grants), then runs the
 * REAL migrations and the REAL seed. Everything else under test is the project's own SQL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";

const sup = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const OWNER_EMAIL = "prismsolutions.pvt@gmail.com";
export const ID = {
  owner: "00000000-0000-0000-0000-0000000000a1",
  stranger: "00000000-0000-0000-0000-0000000000b2",
  unconfirmed: "00000000-0000-0000-0000-0000000000e5",
};

export async function bootDb() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin; create role supabase_auth_admin nologin;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
    create table auth.identities (id uuid primary key default gen_random_uuid(), user_id uuid not null, provider text not null, identity_data jsonb not null default '{}');
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid);
    alter table storage.objects enable row level security;
    grant usage on schema public, auth, storage to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
    grant all on storage.objects to anon, authenticated, service_role;
  `);
  await db.exec(`
    insert into auth.users (id, email, email_confirmed_at) values
      ('${ID.owner}', '${OWNER_EMAIL}', now()),
      ('${ID.stranger}', 'someone.else@gmail.com', now()),
      ('${ID.unconfirmed}', '${OWNER_EMAIL}', null);
  `);
  for (const f of fs.readdirSync(path.join(sup, "migrations")).sort()) await db.exec(fs.readFileSync(path.join(sup, "migrations", f), "utf8"));
  await db.exec(fs.readFileSync(path.join(sup, "seed.sql"), "utf8"));

  /** Run `fn` as a Supabase role with the given JWT claims. */
  const as = async (role, claims, fn) => {
    await db.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify(claims ?? {})]);
    await db.exec(`set role ${role}`);
    try {
      return await fn();
    } finally {
      await db.exec("reset role");
    }
  };
  const user = (id, email, fn) => as("authenticated", { sub: id, email, role: "authenticated" }, fn);
  return {
    db,
    as,
    user,
    anon: (fn) => as("anon", {}, fn),
    owner: (fn) => user(ID.owner, OWNER_EMAIL, fn),
    stranger: (fn) => user(ID.stranger, "someone.else@gmail.com", fn),
    rows: async (sql, params) => (await db.query(sql, params)).rows,
    /** Expect a SQL error, optionally matching a message. */
    denied: (promise, pattern = /./) => assert.rejects(promise, (e) => pattern.test(String(e.message)), "expected the database to refuse this"),
  };
}

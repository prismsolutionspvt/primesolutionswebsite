import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { RESOURCES, type SingletonDef } from "./registry";
import type { Opt, ResourceDef } from "./fields";

type Row = Record<string, unknown> & { id: string };
type Supabase = Awaited<ReturnType<typeof createServerSupabase>>;

/** All rows of a managed collection, in display order, plus its child rows grouped by parent id. Runs as the signed-in owner. */
export async function loadResource(def: ResourceDef, supabase?: Supabase) {
  const sb = supabase ?? (await createServerSupabase());
  let q = sb.from(def.table).select("*");
  q = def.order ? q.order("sort_order", { ascending: true }).order("created_at", { ascending: true }) : q.order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) throw new Error(`Could not load ${def.plural}: ${error.message}`);

  const childRows: Record<string, Row[]> = {};
  if (def.children) {
    const { data: kids, error: e2 } = await sb.from(def.children.table).select("*").order("sort_order", { ascending: true });
    if (e2) throw new Error(`Could not load ${def.children.plural}: ${e2.message}`);
    for (const k of (kids ?? []) as Row[]) {
      const parent = String(k[def.children.fk]);
      (childRows[parent] ??= []).push(k);
    }
  }
  return { rows: (data ?? []) as Row[], childRows };
}

/** Option lists some fields draw from (e.g. the services an industry fits). */
export async function loadOptions(supabase?: Supabase): Promise<Record<string, Opt[]>> {
  const sb = supabase ?? (await createServerSupabase());
  const { data } = await sb.from(RESOURCES.services.table).select("slug,name").order("sort_order", { ascending: true });
  return { services: (data ?? []).map((s) => ({ value: s.slug as string, label: s.name as string })) };
}

/** The current values of a one-row form. `site_sections` rows keep some values in `extra`; they are flattened to "extra.key". */
export async function loadSingleton(def: SingletonDef, supabase?: Supabase): Promise<Record<string, unknown>> {
  const sb = supabase ?? (await createServerSupabase());
  const q = sb.from(def.table).select("*");
  const { data, error } = await (def.table === "site_sections" ? q.eq("key", def.sectionKey as string) : q.eq("id", 1)).maybeSingle();
  if (error) throw new Error(`Could not load ${def.title}: ${error.message}`);
  const row = (data ?? {}) as Record<string, unknown>;
  if (def.table === "site_sections") {
    const extra = (row.extra ?? {}) as Record<string, unknown>;
    for (const [k, v] of Object.entries(extra)) row[`extra.${k}`] = v;
  }
  return row;
}

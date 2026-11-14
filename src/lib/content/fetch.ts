import "server-only";
import { unstable_cache } from "next/cache";
import { createAnonSupabase } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { defaultContent } from "./defaults";
import { mapContent, type RawContent } from "./map";
import { PUBLIC_SETTINGS_COLUMNS } from "./columns";
import type { SiteContent } from "./types";

/** Cache tag: every admin save calls revalidateTag(CONTENT_TAG) so edits reach the public site immediately. */
export const CONTENT_TAG = "site-content";

async function loadFromDatabase(): Promise<SiteContent> {
  const sb = createAnonSupabase();
  const ordered = (table: string) => sb.from(table).select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });

  // ONE round of parallel queries for the whole site (cached below), never one per component.
  const [settings, sections, mv, services, subs, industries, team, values, why, steps, faqs, testimonials, announcements, social] = await Promise.all([
    sb.from("site_settings").select(PUBLIC_SETTINGS_COLUMNS).eq("id", 1).maybeSingle(),
    sb.from("site_sections").select("*"),
    sb.from("mission_vision").select("*").eq("id", 1).maybeSingle(),
    ordered("services"),
    ordered("service_subcategories"),
    ordered("industries"),
    ordered("team_members"),
    ordered("core_values"),
    ordered("why_prism_items"),
    ordered("approach_steps"),
    ordered("faqs"),
    sb.from("testimonials").select("*").order("is_featured", { ascending: false }).order("sort_order", { ascending: true }).order("created_at", { ascending: false }).limit(30),
    sb.from("announcements").select("*").order("priority", { ascending: false }),
    ordered("social_links"),
  ]);
  const failed = [settings, sections, mv, services, subs, industries, team, values, why, steps, faqs, testimonials, announcements, social].find((r) => r.error);
  if (failed?.error) throw new Error(`Supabase read failed: ${failed.error.message}`);

  // the column list is a runtime string, so the client cannot infer the row type: it is the public subset of site_settings
  const settingsRow = settings.data as unknown as Record<string, unknown> | null;
  const raw: RawContent = {
    settings: settingsRow,
    sections: sections.data ?? [],
    missionVision: mv.data,
    services: services.data ?? [],
    subcategories: subs.data ?? [],
    industries: industries.data ?? [],
    team: team.data ?? [],
    values: values.data ?? [],
    why: why.data ?? [],
    steps: steps.data ?? [],
    faqs: faqs.data ?? [],
    testimonials: testimonials.data ?? [],
    announcements: announcements.data ?? [],
    social: social.data ?? [],
  };
  const mapped = mapContent(raw);
  // Migrations applied but the starter content not loaded yet: keep the built-in text, but honour live settings.
  if (!settingsRow?.content_seeded) {
    return { ...defaultContent, settings: mapped.settings, testimonials: mapped.testimonials, announcements: mapped.announcements };
  }
  return mapped;
}

const cached = unstable_cache(loadFromDatabase, ["site-content-v1"], { revalidate: 300, tags: [CONTENT_TAG] });

/**
 * The public site's single content entry point. Cached for 5 minutes AND invalidated by tag on every admin save.
 * A failed read is thrown (so it is never cached) and replaced by the built-in defaults: the site never goes blank.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) return defaultContent;
  try {
    return await cached();
  } catch (e) {
    console.error("[content] falling back to built-in defaults:", e instanceof Error ? e.message : e);
    return defaultContent;
  }
}

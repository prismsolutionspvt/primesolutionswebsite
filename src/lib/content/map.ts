import type { Announcement, Faq, Industry, Reason, Service, ServiceGroup, SocialLink, Stage, TeamMember, Testimonial, Value } from "@/types";
import { mediaUrl } from "@/lib/supabase/env";
import { slugify } from "@/lib/slug";
import { defaultContent } from "./defaults";
import { SECTION_KEYS, type SectionKey, type SiteContent } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
export type RawContent = {
  settings: Row | null;
  sections: Row[];
  missionVision: Row | null;
  services: Row[];
  subcategories: Row[];
  industries: Row[];
  team: Row[];
  values: Row[];
  why: Row[];
  steps: Row[];
  faqs: Row[];
  testimonials: Row[];
  announcements: Row[];
  social: Row[];
};


const pad = (n: number) => String(n).padStart(2, "0");
const img = (p: unknown) => (typeof p === "string" && p ? mediaUrl(p) : undefined);
const str = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);
const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const pairs = (v: unknown): { title: string; text: string }[] =>
  Array.isArray(v) ? v.filter((x) => x && typeof x.title === "string").map((x) => ({ title: String(x.title), text: str(x.text) })) : [];

/** Database rows → the exact shape the components render. Missing pieces fall back to the built-in defaults. */
export function mapContent(raw: RawContent): SiteContent {
  const d = defaultContent;
  const sec = (key: string): Row | undefined => raw.sections.find((s) => s.key === key);
  const s = raw.settings ?? {};

  // ── settings
  const waDigits = `${str(s.whatsapp_country_code)}${str(s.whatsapp_number).replace(/^0+/, "")}`.replace(/\D/g, "");
  const settings: SiteContent["settings"] = {
    company: {
      name: str(s.company_name, d.settings.company.name),
      tagline: str(s.tagline, d.settings.company.tagline),
      locationLabel: str(s.location_label, d.settings.company.locationLabel),
      url: str(s.site_url) || d.settings.company.url,
    },
    seo: {
      title: str(s.seo_title, d.settings.seo.title),
      description: str(s.seo_description) || d.settings.seo.description,
      ogImageUrl: img(s.og_image_path) ?? "",
      indexable: s.indexable !== false,
    },
    contact: { email: str(s.contact_email), phone: str(s.contact_phone), address: str(s.contact_address), extra: str(s.contact_extra) },
    whatsapp: { enabled: s.whatsapp_enabled !== false, number: waDigits, message: str(s.whatsapp_message, d.settings.whatsapp.message) },
    social: {
      instagramUrl: s.instagram_enabled === false ? "" : str(s.instagram_url),
      links: raw.social.map((l): SocialLink => ({ id: l.id, platform: l.platform, label: l.label || l.platform, url: l.url })),
    },
    brand: { logoPrimaryUrl: img(s.logo_primary_path) ?? "", logoSecondaryUrl: img(s.logo_secondary_path) ?? "", faviconUrl: img(s.favicon_path) ?? "" },
    footerExtra: { showContact: s.footer_show_contact !== false },
    credit: { label: str(s.frx_label, d.settings.credit.label), href: str(s.frx_url, d.settings.credit.href) },
    theme: {
      defaultTheme: s.default_theme === "dark" || s.default_theme === "adaptive" ? s.default_theme : "light",
      switcherEnabled: s.theme_switcher_enabled !== false,
    },
  };

  const visibility = Object.fromEntries(SECTION_KEYS.map((k) => [k, true])) as Record<SectionKey, boolean>;
  for (const k of SECTION_KEYS) {
    const row = sec(k);
    if (row && row.is_visible === false) visibility[k] = false;
  }

  const intro = (key: string, fb: { eyebrow: string; heading: string; text: string }) => {
    const r = sec(key);
    return r ? { eyebrow: str(r.eyebrow), heading: str(r.heading), text: str(r.intro) } : fb;
  };

  // ── services (+ groups derived from the group labels, in order of first appearance)
  const subsBy = new Map<string, Row[]>();
  for (const sub of raw.subcategories) subsBy.set(sub.service_id, [...(subsBy.get(sub.service_id) ?? []), sub]);
  const groups: ServiceGroup[] = [];
  const services: Service[] = raw.services.map((row, i) => {
    const label = str(row.group_label).trim() || "Services";
    const gid = slugify(label);
    if (!groups.some((g) => g.id === gid)) groups.push({ id: gid, label });
    return {
      id: row.slug,
      index: pad(i + 1),
      name: row.name,
      ray: str(row.ray_label) || row.name,
      group: gid,
      tagline: str(row.tagline),
      summary: str(row.summary),
      note: str(row.note) || undefined,
      detail: str(row.detail) || undefined,
      imageUrl: img(row.image_path),
      icon: str(row.icon) || undefined,
      items: (subsBy.get(row.id) ?? []).map((x) => ({ title: x.title, detail: str(x.detail) || undefined })),
    };
  });
  const serviceIds = new Set(services.map((x) => x.id));

  const industries: Industry[] = raw.industries.map((row) => ({
    id: row.slug,
    name: row.name,
    summary: str(row.summary),
    note: str(row.note) || undefined,
    detail: str(row.detail) || undefined,
    imageUrl: img(row.image_path),
    fits: list(row.fits).filter((f) => serviceIds.has(f)),
    scene: row.scene ?? "generic",
  }));

  const values: Value[] = raw.values.map((v) => ({ word: v.word, line: str(v.line), imageUrl: img(v.image_path) }));
  const principles = raw.values.filter((v) => v.is_principle).map((v) => v.word as string);
  const why: Reason[] = raw.why.map((w) => ({ title: w.title, text: str(w.text), imageUrl: img(w.image_path) }));
  const stages: Stage[] = raw.steps.map((st, i) => ({ n: pad(i + 1), name: st.name, text: str(st.text), imageUrl: img(st.image_path) }));
  const team: TeamMember[] = raw.team.map((m) => ({
    id: m.id, name: str(m.name), designation: str(m.designation), description: str(m.bio), extraInfo: str(m.extra_info) || undefined, photoUrl: img(m.photo_path) ?? "",
  }));

  const catLabels: string[] = [];
  const faqs: Faq[] = raw.faqs.map((f) => {
    const category = str(f.category, "General");
    if (!catLabels.includes(category)) catLabels.push(category);
    return { q: f.question, a: f.answer, category };
  });

  const testimonials: Testimonial[] = raw.testimonials.map((t) => ({
    id: t.id, name: t.name, designation: str(t.role), company: str(t.company), text: t.text, rating: t.rating ?? undefined,
    photoUrl: img(t.photo_path), featured: Boolean(t.is_featured), source: t.source === "visitor" ? "visitor" : "owner", createdAt: t.created_at,
  }));

  const now = Date.now();
  const announcements: Announcement[] = raw.announcements
    .map((a): Announcement => ({
      id: a.id,
      title: a.title,
      shortDescription: str(a.short_description),
      detail: str(a.detail_description),
      imageUrl: img(a.image_path),
      ctaText: str(a.cta_text) || undefined,
      ctaUrl: str(a.cta_url) || undefined,
      startsAt: a.starts_at ?? undefined,
      endsAt: a.ends_at ?? undefined,
      priority: a.priority ?? 0,
      showOnLoad: a.show_on_load !== false,
      delaySeconds: a.show_delay_seconds ?? 2,
      frequency: a.frequency ?? "once_per_visitor",
      reappearDays: a.reappear_days ?? 7,
      dismissible: a.is_dismissible !== false,
      reappearAfterDismiss: Boolean(a.reappear_after_dismiss),
      version: String(a.updated_at ?? ""),
    }))
    .filter((a) => !a.endsAt || Date.parse(a.endsAt) > now);

  // ── section copy (the built-in text is the fallback for any row that does not exist yet)
  const hero = sec("hero");
  const about = sec("about");
  const industriesSec = sec("industries");
  const contact = sec("contact");
  const commit = sec("commitment");
  const mv = raw.missionVision;
  const valuesSec = sec("values");
  const whySec = sec("why");
  const approachSec = sec("approach");

  return {
    source: "database",
    settings,
    visibility,
    hero: hero
      ? {
          eyebrow: str(hero.eyebrow),
          headline: str(hero.heading),
          text: str(hero.intro),
          accent: list(hero.extra?.accent),
          primaryCta: str(hero.extra?.primaryCta, d.hero.primaryCta),
          secondaryCta: str(hero.extra?.secondaryCta, d.hero.secondaryCta),
          principles: principles.length ? principles : d.hero.principles,
        }
      : { ...d.hero, principles: principles.length ? principles : d.hero.principles },
    about: about
      ? { eyebrow: str(about.eyebrow), heading: str(about.heading), overview: list(about.body), principlesLine: str(about.extra?.principlesLine), imageUrl: img(about.image_path) }
      : d.about,
    positioning: about ? pairs(about.extra?.pillars) : d.positioning,
    direction: mv
      ? {
          mission: { label: str(mv.mission_label), text: str(mv.mission_text), highlights: list(mv.mission_highlights), imageUrl: img(mv.mission_image_path) },
          vision: { label: str(mv.vision_label), text: str(mv.vision_text), highlights: list(mv.vision_highlights), imageUrl: img(mv.vision_image_path) },
        }
      : d.direction,
    valuesIntro: valuesSec ? { eyebrow: str(valuesSec.eyebrow), heading: str(valuesSec.heading) } : d.valuesIntro,
    values,
    servicesIntro: intro("services", d.servicesIntro),
    serviceGroups: groups,
    services,
    why: { eyebrow: whySec ? str(whySec.eyebrow) : d.why.eyebrow, heading: whySec ? str(whySec.heading) : d.why.heading, items: why },
    industriesIntro: industriesSec
      ? { eyebrow: str(industriesSec.eyebrow), heading: str(industriesSec.heading), text: str(industriesSec.intro), disclaimer: str(industriesSec.extra?.disclaimer) }
      : d.industriesIntro,
    industries,
    approach: {
      eyebrow: approachSec ? str(approachSec.eyebrow) : d.approach.eyebrow,
      heading: approachSec ? str(approachSec.heading) : d.approach.heading,
      text: approachSec ? str(approachSec.intro) : d.approach.text,
      stages,
    },
    teamIntro: intro("team", d.teamIntro),
    team,
    reviewsIntro: intro("reviews", d.reviewsIntro),
    testimonials,
    faqIntro: intro("faq", d.faqIntro),
    faqCategories: [{ id: "all", label: "All" }, ...catLabels.map((l) => ({ id: slugify(l), label: l }))],
    faqs,
    cta: contact
      ? { eyebrow: str(contact.eyebrow), heading: str(contact.heading), text: str(contact.intro), button: str(contact.extra?.button, d.cta.button), fineprint: str(contact.extra?.fineprint) }
      : d.cta,
    commitment: commit
      ? { eyebrow: str(commit.eyebrow), heading: str(commit.heading), text: str(commit.intro), items: pairs(commit.extra?.items) }
      : d.commitment,
    footer: {
      ...d.footer,
      marquee: list(s.footer_marquee).length ? list(s.footer_marquee) : d.footer.marquee,
      note: str(s.footer_note) || d.footer.note,
    },
    announcements,
  };
}

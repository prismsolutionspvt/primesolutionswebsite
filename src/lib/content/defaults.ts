import * as c from "@/content";
import { poweredBy, settings, whatsappMessage } from "@/config/site";
import { SECTION_KEYS, type SectionKey, type SiteContent } from "./types";

const allVisible = Object.fromEntries(SECTION_KEYS.map((k) => [k, true])) as Record<SectionKey, boolean>;

/**
 * Built-in content (the approved portfolio wording). It is what the site shows when Supabase is not configured,
 * cannot be reached, or the starter content has not been loaded yet — so the public site never goes blank.
 */
export const defaultContent: SiteContent = {
  source: "defaults",
  settings: {
    company: { name: settings.company.name, tagline: settings.company.tagline, locationLabel: settings.company.locationLabel, url: settings.company.url },
    seo: { title: "Prism Solutions | BPO & Digital Services", description: settings.company.description, ogImageUrl: "", indexable: true },
    contact: { email: settings.contact.email, phone: settings.contact.phone, address: settings.contact.address, extra: "" },
    whatsapp: { enabled: true, number: settings.contact.whatsappNumber, message: whatsappMessage },
    social: { instagramUrl: settings.social.instagram, links: [] },
    brand: { logoPrimaryUrl: "", logoSecondaryUrl: "", faviconUrl: "" },
    footerExtra: { showContact: true },
    credit: { label: poweredBy.label, href: poweredBy.href },
    theme: { defaultTheme: "light", switcherEnabled: true },
  },
  visibility: allVisible,
  hero: { ...c.hero, accent: [...c.hero.accent], principles: [...c.hero.principles] },
  about: { eyebrow: c.about.eyebrow, heading: c.about.heading, overview: [...c.about.overview], principlesLine: c.about.principlesLine },
  positioning: c.positioning,
  direction: c.direction,
  valuesIntro: c.valuesIntro,
  values: c.values,
  servicesIntro: c.servicesIntro,
  serviceGroups: c.serviceGroups,
  services: c.services,
  why: c.why,
  industriesIntro: c.industriesIntro,
  industries: c.industries,
  approach: c.approach,
  teamIntro: c.teamIntro,
  team: c.team,
  reviewsIntro: {
    eyebrow: "Reviews",
    heading: "Leave a review.",
    text: "Share your experience with Prism Solutions. Every review is read by our team and appears here once it has been approved.",
  },
  testimonials: [],
  faqIntro: c.faqIntro,
  faqCategories: c.faqCategories.map((x) => ({ id: x.id, label: x.label })),
  faqs: c.faqs.map((f) => ({ q: f.q, a: f.a, category: c.faqCategories.find((x) => x.id === f.category)?.label ?? "General" })),
  cta: c.cta,
  commitment: c.commitment,
  footer: c.footer,
  announcements: [],
};

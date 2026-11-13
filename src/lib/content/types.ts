import type {
  Announcement, Commitment, Faq, FooterContent, Industry, PositioningPillar, Reason, Service, ServiceGroup, SocialLink, Stage, TeamMember, Testimonial, Value,
} from "@/types";

/** Sections the owner can show or hide (site_sections.is_visible). */
export const SECTION_KEYS = ["about", "direction", "values", "team", "services", "why", "industries", "approach", "reviews", "faq", "contact"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type Intro = { eyebrow: string; heading: string; text: string };

export type PublicSettings = {
  company: { name: string; tagline: string; locationLabel: string; url: string };
  seo: { title: string; description: string; ogImageUrl: string; indexable: boolean };
  contact: { email: string; phone: string; address: string; extra: string };
  /** `number` is digits only, country code included; "" opens WhatsApp's contact chooser */
  whatsapp: { enabled: boolean; number: string; message: string };
  social: { instagramUrl: string; links: SocialLink[] };
  brand: { logoPrimaryUrl: string; logoSecondaryUrl: string; faviconUrl: string };
  footerExtra: { showContact: boolean };
  credit: { label: string; href: string };
  theme: { defaultTheme: "light" | "dark" | "adaptive"; switcherEnabled: boolean };
};

/**
 * Everything the public website renders. The shape mirrors the content modules in src/content (which remain the
 * built-in defaults), so a section component reads it exactly as it always did.
 * `source`: "database" = live Supabase content; "defaults" = built-in content (Supabase not configured, unreachable,
 * or the starter content has not been loaded yet).
 */
export type SiteContent = {
  source: "database" | "defaults";
  settings: PublicSettings;
  visibility: Record<SectionKey, boolean>;
  hero: { eyebrow: string; headline: string; accent: string[]; text: string; primaryCta: string; secondaryCta: string; principles: string[] };
  about: { eyebrow: string; heading: string; overview: string[]; principlesLine: string; imageUrl?: string };
  positioning: PositioningPillar[];
  direction: {
    mission: { label: string; text: string; highlights: string[]; imageUrl?: string };
    vision: { label: string; text: string; highlights: string[]; imageUrl?: string };
  };
  valuesIntro: { eyebrow: string; heading: string };
  values: Value[];
  servicesIntro: Intro;
  serviceGroups: ServiceGroup[];
  services: Service[];
  why: { eyebrow: string; heading: string; items: Reason[] };
  industriesIntro: Intro & { disclaimer: string };
  industries: Industry[];
  approach: { eyebrow: string; heading: string; text: string; stages: Stage[] };
  teamIntro: Intro;
  team: TeamMember[];
  reviewsIntro: Intro;
  testimonials: Testimonial[];
  faqIntro: Intro;
  faqCategories: { id: string; label: string }[];
  faqs: Faq[];
  cta: { eyebrow: string; heading: string; text: string; button: string; fineprint: string };
  commitment: { eyebrow: string; heading: string; text: string; items: Commitment[] };
  footer: FooterContent;
  announcements: Announcement[];
};

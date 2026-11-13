/** A capability inside a service (a "subcategory" in the admin). `detail` is the supporting sentence shown on expand. */
export type ServiceItem = { title: string; detail?: string };

/** Services are grouped under plain-language headings. Groups are derived from the services' group labels. */
export type ServiceGroupId = string;

export type ServiceGroup = { id: ServiceGroupId; label: string };

export type Service = {
  /** URL-safe slug; also the in-page anchor and the id industries reference */
  id: string;
  index: string;
  name: string;
  /** Short label for compact UI (hero rays, menus) */
  ray: string;
  group: ServiceGroupId;
  /** One concise line shown in the service list so every service is understood at a glance */
  tagline: string;
  summary: string;
  /** Extra sentence shown under the summary (optional) */
  note?: string;
  /** Longer supporting description written in the admin panel (optional) */
  detail?: string;
  /** Public URL of an uploaded service image (optional) */
  imageUrl?: string;
  /** Icon key (lib/icons.tsx) used when the service has no built-in illustration */
  icon?: string;
  items: ServiceItem[];
};

export type IndustrySceneKind = "generic" | "healthcare" | "realestate" | "ecommerce" | "saas" | "professional" | "finance";

export type Industry = {
  id: string;
  name: string;
  /** The portfolio's own sentence for this industry (potential service fit — never past engagements) */
  summary: string;
  /** Policy / compliance clause the portfolio requires for this industry */
  note?: string;
  detail?: string;
  imageUrl?: string;
  /** Prism services (by service id) that map to this industry */
  fits: string[];
  scene: IndustrySceneKind;
};

export type Reason = { title: string; text: string; imageUrl?: string };

export type Stage = { n: string; name: string; text: string; imageUrl?: string };

/** `category` is the human label ("Services"); filter chips are derived from the labels in use. */
export type Faq = { q: string; a: string; category: string };

export type Commitment = { title: string; text: string };

export type Value = { word: string; line: string; imageUrl?: string };

export type PositioningPillar = { title: string; text: string };

/** One "Meet the people behind Prism" profile. Empty fields render as placeholders. Nothing is ever invented. */
export type TeamMember = {
  id: string;
  name: string;
  designation: string;
  /** Individual biography written by the client */
  description: string;
  /** Optional extra information shown with the profile */
  extraInfo?: string;
  /** Public URL of the uploaded portrait ("" = placeholder) */
  photoUrl: string;
};

export type FooterLink = { label: string; href: string; hint?: string };

export type FooterContent = {
  /** Phrases that loop in the closing marquee */
  marquee: string[];
  explore: FooterLink[];
  legal: FooterLink[];
  /** Small print taken from the portfolio */
  note: string;
};

/** An approved review / testimonial (only published ones ever reach the public site). */
export type Testimonial = {
  id: string;
  name: string;
  designation: string;
  company: string;
  text: string;
  rating?: number;
  photoUrl?: string;
  featured: boolean;
  source: "owner" | "visitor";
  createdAt?: string;
};

export type AnnouncementFrequency = "every_visit" | "once_per_session" | "once_per_visitor";

/** A website announcement. Schedule and frequency rules are applied in the visitor's browser. */
export type Announcement = {
  id: string;
  title: string;
  shortDescription: string;
  detail: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  startsAt?: string;
  endsAt?: string;
  priority: number;
  showOnLoad: boolean;
  delaySeconds: number;
  frequency: AnnouncementFrequency;
  reappearDays: number;
  dismissible: boolean;
  reappearAfterDismiss: boolean;
  /** changes whenever the owner edits it, so an edited announcement is treated as new */
  version: string;
};

export type SocialLink = { id: string; platform: string; label: string; url: string };

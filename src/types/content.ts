/** A capability inside a service. `detail` is the portfolio's own supporting sentence, shown on expand. */
export type ServiceItem = { title: string; detail?: string };

/** Groups mirror the portfolio: customer & revenue operations, business operations, digital growth. */
export type ServiceGroupId = "customer" | "operations" | "digital";

export type ServiceGroup = { id: ServiceGroupId; label: string };

export type Service = {
  id: string;
  index: string;
  name: string;
  /** Short label for compact UI (hero rays, menus) */
  ray: string;
  group: ServiceGroupId;
  /** One concise line shown in the service list so every service is understood at a glance */
  tagline: string;
  summary: string;
  /** Extra portfolio sentence shown under the summary (optional) */
  note?: string;
  items: ServiceItem[];
};

export type IndustrySceneKind = "healthcare" | "realestate" | "ecommerce" | "saas" | "professional" | "finance";

export type Industry = {
  id: string;
  name: string;
  /** The portfolio's own sentence for this industry (potential service fit — never past engagements) */
  summary: string;
  /** Policy / compliance clause the portfolio requires for this industry */
  note?: string;
  /** Prism services (by service id) that map to this industry */
  fits: string[];
  scene: IndustrySceneKind;
};

export type Reason = { title: string; text: string };

export type Stage = { n: string; name: string; text: string };

export type FaqCategoryId = "services" | "engagement" | "start";

export type Faq = { q: string; a: string; category: FaqCategoryId };

export type Commitment = { title: string; text: string };

export type Value = { word: string; line: string };

export type PositioningPillar = { title: string; text: string };

/** One of the three "Meet the people behind Prism" profile slots. All fields are admin-editable; empty fields render as placeholders. */
export type TeamMember = {
  id: string;
  name: string;
  designation: string;
  /** Individual description / biography written by the client — never invented */
  description: string;
  /** Public path (e.g. "/team/member-1.jpg") or absolute URL of the portrait */
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

export type Testimonial = {
  id: string;
  name: string;
  designation: string;
  company: string;
  text: string;
  photoUrl?: string;
  status: "draft" | "published";
  featured: boolean;
};

export type Announcement = {
  enabled: boolean;
  showOnLoad: boolean;
  heading: string;
  text: string;
  imageUrl?: string;
  /** Do not show again after dismissal for N days */
  dismissDays: number;
};

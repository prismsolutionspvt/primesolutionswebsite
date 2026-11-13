/** A bullet inside a service. `detail` is optional supporting copy shown on expand. */
export type ServiceItem = { title: string; detail?: string };

/** Groups mirror the portfolio: digital growth, customer & revenue operations, business operations. */
export type ServiceGroupId = "digital" | "customer" | "operations";

export type ServiceGroup = { id: ServiceGroupId; label: string };

export type Service = {
  id: string;
  index: string;
  name: string;
  /** Short label for compact UI (hero rays, menus) */
  ray: string;
  group: ServiceGroupId;
  summary: string;
  items: ServiceItem[];
};

export type IndustrySceneKind = "healthcare" | "realestate" | "ecommerce" | "saas" | "professional" | "finance";

export type Industry = {
  id: string;
  name: string;
  /** One-line framing of the fit — never implies past engagements */
  summary: string;
  /** Services that map to this industry (from the portfolio) */
  services: string[];
  /** Compliance / policy wording where the portfolio requires it */
  note?: string;
  scene: IndustrySceneKind;
};

export type Reason = { title: string; text: string };

export type Stage = { n: string; name: string; text: string };

export type FaqCategoryId = "services" | "engagement" | "start";

export type Faq = { q: string; a: string; category: FaqCategoryId };

export type Commitment = { title: string; text: string };

export type Value = { word: string; line: string };

export type PositioningPillar = { title: string; text: string };

export type Founder = {
  name: string;
  designation: string;
  message: string;
  /** Public path or absolute URL of the portrait. */
  photoUrl: string;
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

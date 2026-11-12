export type Service = {
  id: string;
  index: string;
  name: string;
  short: string;
  /** Label shown on the hero prism ray */
  ray: string;
  summary: string;
  items: string[];
  /** How a client typically uses it — written without performance claims */
  fit: string;
  core?: boolean;
};

export type IndustryArtKind = "grid" | "arches" | "pulse" | "lines" | "nodes" | "roofs";

export type Industry = {
  id: string;
  name: string;
  blurb: string;
  help: string[];
  art: IndustryArtKind;
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

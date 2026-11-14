import type { ChildDef, FieldDef, FormSection, Opt, ResourceDef } from "./fields";

/** Every managed collection. Adding a module = adding one entry here (the form, validation, list, ordering and publishing come for free). */

export const SCENES: Opt[] = [
  { value: "generic", label: "Neutral (general)" },
  { value: "healthcare", label: "Healthcare & wellness" },
  { value: "realestate", label: "Real estate" },
  { value: "ecommerce", label: "E-commerce & retail" },
  { value: "saas", label: "SaaS & technology" },
  { value: "professional", label: "Professional services" },
  { value: "finance", label: "Finance & insurance" },
];

/** Icons available for services that have no built-in illustration (see lib/icons.tsx). */
export const ICONS: Opt[] = [
  ["headset", "Headset (support)"], ["phone", "Phone"], ["calendar", "Calendar"], ["megaphone", "Megaphone"], ["search", "Search"], ["target", "Target"],
  ["users", "People"], ["globe", "Globe"], ["briefcase", "Briefcase"], ["chart", "Chart"], ["mail", "Mail"], ["shield", "Shield"],
  ["star", "Star"], ["wrench", "Wrench"], ["building", "Building"], ["laptop", "Laptop"],
].map(([value, label]) => ({ value, label }));

const subcategories: ChildDef = {
  table: "service_subcategories",
  fk: "service_id",
  singular: "Subcategory",
  plural: "Subcategories",
  titleField: "title",
  fields: [
    { kind: "text", name: "title", label: "Title", required: true, max: 160, placeholder: "e.g. Inbound customer inquiries" },
    { kind: "textarea", name: "detail", label: "Supporting sentence", help: "Shown when the visitor opens the service. Optional.", max: 600, rows: 2 },
    { kind: "switch", name: "is_published", label: "Show on the website" },
  ],
};

export const RESOURCES: Record<string, ResourceDef> = {
  services: {
    key: "services",
    table: "services",
    singular: "service",
    plural: "services",
    description: "The services Prism offers. Order here is the order on the website; the number (01, 02…) follows automatically.",
    titleField: "name",
    subtitleField: "tagline",
    imageField: "image_path",
    order: true,
    flag: { column: "is_published", on: "true", off: "false" },
    children: subcategories,
    empty: "No services yet. Add your first service and it will appear on the website as soon as it is published.",
    fields: [
      { kind: "text", name: "name", label: "Service name", required: true, max: 120, placeholder: "e.g. Customer Support", span: 2 },
      { kind: "slug", name: "slug", label: "Web address name (slug)", from: "name", help: "Used for in-page links. Lowercase letters, numbers and hyphens. Filled automatically from the name." },
      { kind: "text", name: "ray_label", label: "Short label", max: 40, help: "Used where space is tight (the hero rays). Leave empty to use the full name." },
      { kind: "combo", name: "group_label", label: "Group heading", max: 80, suggestions: ["Customer & revenue operations", "Business operations", "Digital growth"], help: "Services with the same heading are listed together." },
      { kind: "text", name: "tagline", label: "One-line description", max: 220, help: "Shown in the service list.", span: 2 },
      { kind: "textarea", name: "summary", label: "Summary", max: 600, rows: 3, help: "Shown when the service is open.", span: 2 },
      { kind: "textarea", name: "note", label: "Supporting note", max: 600, rows: 2, help: "Optional extra sentence under the summary.", span: 2 },
      { kind: "textarea", name: "detail", label: "Detailed description", max: 4000, rows: 6, help: "Optional longer text. Separate paragraphs with a blank line.", span: 2 },
      { kind: "select", name: "icon", label: "Icon", options: [{ value: "", label: "Built-in illustration / none" }, ...ICONS], help: "Used when the service has no built-in illustration." },
      { kind: "image", name: "image_path", label: "Service image", folder: "services", help: "Shown at the top of the service when it is opened on the website (wide pictures, about 16:9, work best).", span: 2 },
      { kind: "switch", name: "is_published", label: "Show on the website" },
    ],
    sections: [
      { title: "Basics", fields: ["name", "slug", "group_label", "ray_label"] },
      { title: "Descriptions", fields: ["tagline", "summary", "note", "detail"] },
      { title: "Icon & image", fields: ["icon", "image_path"] },
      { title: "Visibility", fields: ["is_published"] },
    ],
  },

  industries: {
    key: "industries",
    table: "industries",
    singular: "industry",
    plural: "industries",
    description: "Industries where Prism’s services may fit. These describe potential fit only. They are not client claims.",
    titleField: "name",
    subtitleField: "summary",
    imageField: "image_path",
    order: true,
    flag: { column: "is_published", on: "true", off: "false" },
    empty: "No industries yet.",
    fields: [
      { kind: "text", name: "name", label: "Industry", required: true, max: 120, span: 2, placeholder: "e.g. Real Estate" },
      { kind: "slug", name: "slug", label: "Web address name (slug)", from: "name" },
      { kind: "select", name: "scene", label: "Illustration", options: SCENES, help: "Which line drawing to show beside this industry." },
      { kind: "textarea", name: "summary", label: "Description", max: 600, rows: 3, span: 2 },
      { kind: "text", name: "note", label: "Compliance note", max: 400, span: 2, help: "Optional, e.g. “Subject to applicable regulatory and client controls.”" },
      { kind: "textarea", name: "detail", label: "Supporting details", max: 4000, rows: 5, span: 2 },
      { kind: "multi", name: "fits", label: "Services that fit", optionsFrom: "services", span: 2 },
      { kind: "image", name: "image_path", label: "Industry image", folder: "industries", help: "Replaces the line drawing at the top of the industry on the website (wide pictures, about 16:10, work best). Leave empty to keep the drawing.", span: 2 },
      { kind: "switch", name: "is_published", label: "Show on the website" },
    ],
    sections: [
      { title: "Basics", fields: ["name", "slug", "scene"] },
      { title: "Content", fields: ["summary", "note", "detail", "fits"] },
      { title: "Image", fields: ["image_path"] },
      { title: "Visibility", fields: ["is_published"] },
    ],
  },

  team: {
    key: "team",
    table: "team_members",
    singular: "team member",
    plural: "team members",
    description: "“Meet the People Behind Prism”. Only add real people and real photographs. Nothing is shown that you do not enter.",
    titleField: "name",
    subtitleField: "designation",
    imageField: "photo_path",
    order: true,
    flag: { column: "is_published", on: "true", off: "false" },
    empty: "No team profiles yet.",
    fields: [
      { kind: "text", name: "name", label: "Full name", required: true, max: 100, span: 2 },
      { kind: "text", name: "designation", label: "Designation", max: 120, span: 2, placeholder: "e.g. Operations Manager" },
      { kind: "image", name: "photo_path", label: "Photograph", folder: "team", help: "A portrait works best (it is shown at about 3:4)." },
      { kind: "textarea", name: "bio", label: "Biography", max: 2000, rows: 6, span: 2, help: "Separate paragraphs with a blank line." },
      { kind: "textarea", name: "extra_info", label: "Additional information", max: 1000, rows: 3, span: 2, help: "Optional." },
      { kind: "switch", name: "is_published", label: "Show on the website" },
    ],
    sections: [
      { title: "Profile", fields: ["name", "designation", "photo_path"] },
      { title: "About", fields: ["bio", "extra_info"] },
      { title: "Visibility", fields: ["is_published"] },
    ],
  },

  values: {
    key: "values",
    table: "core_values",
    singular: "value",
    plural: "core values",
    description: "Core values. Mark up to three as the guiding principles (Quality, Commitment, Performance); they also appear in the hero.",
    titleField: "word",
    subtitleField: "line",
    order: true,
    flag: { column: "is_published", on: "true", off: "false" },
    empty: "No values yet.",
    fields: [
      { kind: "text", name: "word", label: "Value", required: true, max: 60, placeholder: "e.g. Trust" },
      { kind: "switch", name: "is_principle", label: "One of the three guiding principles" },
      { kind: "textarea", name: "line", label: "Description", max: 400, rows: 3, span: 2 },
      { kind: "switch", name: "is_published", label: "Show on the website" },
    ],
  },

  why: {
    key: "why",
    table: "why_prism_items",
    singular: "reason",
    plural: "reasons",
    description: "The reasons shown around the animated ring. Any number works; eight is the original design.",
    titleField: "title",
    subtitleField: "text",
    order: true,
    flag: { column: "is_published", on: "true", off: "false" },
    empty: "No reasons yet.",
    fields: [
      { kind: "text", name: "title", label: "Title", required: true, max: 120, span: 2 },
      { kind: "textarea", name: "text", label: "Description", max: 500, rows: 3, span: 2 },
      { kind: "switch", name: "is_published", label: "Show on the website" },
    ],
  },

  approach: {
    key: "approach",
    table: "approach_steps",
    singular: "stage",
    plural: "stages",
    description: "The stages of “How we work”. Numbering (01, 02…) follows the order automatically.",
    titleField: "name",
    subtitleField: "text",
    order: true,
    flag: { column: "is_published", on: "true", off: "false" },
    empty: "No stages yet.",
    fields: [
      { kind: "text", name: "name", label: "Stage title", required: true, max: 80, placeholder: "e.g. Understand" },
      { kind: "textarea", name: "text", label: "Description", max: 500, rows: 3, span: 2 },
      { kind: "switch", name: "is_published", label: "Show on the website" },
    ],
  },

  testimonials: {
    key: "testimonials",
    table: "testimonials",
    singular: "review",
    plural: "testimonials & reviews",
    description: "Reviews sent by visitors arrive as Pending. Approve the genuine ones to publish them. You can also add a testimonial yourself, but only real ones.",
    titleField: "name",
    subtitleField: "text",
    order: true,
    quick: { status: ["pending", "published", "rejected"], is_featured: "boolean" },
    tabs: {
      column: "status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "published", label: "Published" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    defaults: { status: "published", source: "owner" },
    empty: "No reviews yet. When visitors use “Leave a review”, their submissions appear here for approval.",
    fields: [
      { kind: "text", name: "name", label: "Customer name", required: true, max: 80 },
      { kind: "text", name: "company", label: "Company", max: 80 },
      { kind: "text", name: "role", label: "Role / designation", max: 80 },
      { kind: "number", name: "rating", label: "Rating (1–5)", min: 1, max: 5, help: "Optional for testimonials you add yourself." },
      { kind: "textarea", name: "text", label: "Testimonial text", required: true, max: 800, rows: 5, span: 2 },
      { kind: "select", name: "status", label: "Status", options: [{ value: "pending", label: "Pending approval" }, { value: "published", label: "Published" }, { value: "rejected", label: "Rejected" }] },
      { kind: "switch", name: "is_featured", label: "Featured (shown first)" },
      { kind: "select", name: "source", label: "Source", options: [{ value: "owner", label: "Added by you" }, { value: "visitor", label: "Sent by a visitor" }] },
    ],
    sections: [
      { title: "Customer", fields: ["name", "company", "role"] },
      { title: "Review", fields: ["rating", "text"] },
      { title: "Publishing", fields: ["status", "is_featured", "source"] },
    ],
  },

  faqs: {
    key: "faqs",
    table: "faqs",
    singular: "FAQ",
    plural: "FAQs",
    description: "Questions visitors ask. Topics become the filter chips; questions with the same topic are grouped.",
    titleField: "question",
    subtitleField: "category",
    order: true,
    flag: { column: "is_published", on: "true", off: "false" },
    empty: "No FAQs yet.",
    fields: [
      { kind: "text", name: "question", label: "Question", required: true, max: 240, span: 2 },
      { kind: "textarea", name: "answer", label: "Answer", required: true, max: 3000, rows: 6, span: 2 },
      { kind: "combo", name: "category", label: "Topic", max: 40, suggestions: ["Services", "Working together", "Getting started"], required: true },
      { kind: "switch", name: "is_published", label: "Show on the website" },
    ],
  },

  announcements: {
    key: "announcements",
    table: "announcements",
    singular: "announcement",
    plural: "announcements",
    description: "A pop-up announcement shown on the public website. Only one appears at a time (highest priority first), and visitors are never interrupted repeatedly.",
    titleField: "title",
    subtitleField: "short_description",
    order: false,
    flag: { column: "is_enabled", on: "true", off: "false" },
    defaults: { is_enabled: false, show_on_load: true, is_dismissible: true, reappear_after_dismiss: false, frequency: "once_per_visitor" },
    empty: "No announcements yet.",
    fields: [
      { kind: "text", name: "title", label: "Title", required: true, max: 120, span: 2 },
      { kind: "textarea", name: "short_description", label: "Short description", max: 300, rows: 2, span: 2 },
      { kind: "textarea", name: "detail_description", label: "Detailed description", max: 3000, rows: 4, span: 2, help: "Optional. Shown under the short description." },
      { kind: "text", name: "cta_text", label: "Button text", max: 40, placeholder: "e.g. Learn more" },
      { kind: "url", name: "cta_url", label: "Button link", nullable: true, help: "A full web address (https://…), or /#contact for a place on this site.", span: 2 },
      { kind: "switch", name: "is_enabled", label: "Enabled (visible to visitors)" },
      { kind: "datetime", name: "starts_at", label: "Start (optional)", help: "Leave empty to start immediately." },
      { kind: "datetime", name: "ends_at", label: "End (optional)", help: "Leave empty to run until you disable it." },
      { kind: "number", name: "priority", label: "Priority (0–100)", min: 0, max: 100, default: 0, help: "If several are active, the highest priority is shown." },
      { kind: "switch", name: "show_on_load", label: "Show when the page first loads" },
      { kind: "number", name: "show_delay_seconds", label: "Delay before showing (seconds)", min: 0, max: 60, default: 2 },
      {
        kind: "select",
        name: "frequency",
        label: "How often to show it",
        options: [
          { value: "once_per_visitor", label: "Once per visitor (then again after the number of days below)" },
          { value: "once_per_session", label: "Once per browser session" },
          { value: "every_visit", label: "On every page load" },
        ],
        span: 2,
      },
      { kind: "number", name: "reappear_days", label: "Show again after (days)", min: 0, max: 365, default: 7, help: "Used by “once per visitor”. 0 = never show the same visitor again." },
      { kind: "switch", name: "is_dismissible", label: "Visitors can close it", help: "If off, there is no close button; it closes itself after 12 seconds." },
      { kind: "switch", name: "reappear_after_dismiss", label: "May appear again after being closed", help: "If off, a visitor who closes it will not see it again until you edit it." },
    ],
    sections: [
      { title: "Message", fields: ["title", "short_description", "detail_description"] },
      { title: "Button", fields: ["cta_text", "cta_url"] },
      { title: "Schedule", fields: ["is_enabled", "starts_at", "ends_at", "priority"] },
      { title: "Behaviour", fields: ["show_on_load", "show_delay_seconds", "frequency", "reappear_days", "is_dismissible", "reappear_after_dismiss"] },
    ],
  },

  social: {
    key: "social",
    table: "social_links",
    singular: "social link",
    plural: "other social links",
    description: "Extra social profiles shown in the footer and contact section (Instagram has its own setting above).",
    titleField: "platform",
    subtitleField: "url",
    order: true,
    flag: { column: "is_enabled", on: "true", off: "false" },
    defaults: { is_enabled: true },
    empty: "No other social links.",
    fields: [
      { kind: "combo", name: "platform", label: "Platform", required: true, max: 40, suggestions: ["Facebook", "X", "YouTube", "TikTok", "Pinterest"], help: "LinkedIn is intentionally not used on this site, but you may add it here if you ever want it." },
      { kind: "text", name: "label", label: "Accessible label", max: 60, help: "Read by screen readers, e.g. “Prism Solutions on Facebook”." },
      { kind: "url", name: "url", label: "Profile link", required: true, httpOnly: true, span: 2 },
      { kind: "switch", name: "is_enabled", label: "Show on the website" },
    ],
  },
};

/* ───────────────────────── singletons (one row each) ───────────────────────── */

export type SingletonDef = {
  key: string;
  /** `site_settings` / `mission_vision` are single rows; `site_sections` is one row per public section */
  table: "site_settings" | "mission_vision" | "site_sections";
  sectionKey?: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  sections?: FormSection[];
};

const eyebrowHeading = (heading = "Heading"): FieldDef[] => [
  { kind: "text", name: "eyebrow", label: "Small label above the heading", max: 80 },
  { kind: "text", name: "heading", label: heading, max: 200, required: true, span: 2 },
];

export const SINGLETONS: Record<string, SingletonDef> = {
  hero: {
    key: "hero", table: "site_sections", sectionKey: "hero", title: "Home page opening", description: "The first thing visitors read.",
    fields: [
      ...eyebrowHeading("Headline"),
      { kind: "textarea", name: "intro", label: "Supporting text", max: 1200, rows: 3, span: 2 },
      { kind: "text", name: "extra.primaryCta", label: "Main button", max: 60 },
      { kind: "text", name: "extra.secondaryCta", label: "Second button", max: 60 },
      { kind: "lines", name: "extra.accent", label: "Highlighted words", help: "Words of the headline shown in the accent colour, one per line.", maxItems: 6, rows: 2, span: 2 },
    ],
  },
  about: {
    key: "about", table: "site_sections", sectionKey: "about", title: "About Prism", description: "Company introduction and positioning.",
    fields: [
      ...eyebrowHeading("Section heading"),
      { kind: "paragraphs", name: "body", label: "Company introduction", help: "Separate paragraphs with a blank line.", maxItems: 6, max: 1200, rows: 8, span: 2 },
      { kind: "pairs", name: "extra.pillars", label: "Positioning points", titleLabel: "Title", textLabel: "Description", maxItems: 8, span: 2 },
      { kind: "textarea", name: "extra.principlesLine", label: "Principles statement", max: 600, rows: 3, span: 2 },
    ],
  },
  commitment: {
    key: "commitment", table: "site_sections", sectionKey: "commitment", title: "Our commitment", description: "The “Built on trust” statement above the footer.",
    fields: [
      ...eyebrowHeading(),
      { kind: "textarea", name: "intro", label: "Statement", max: 1200, rows: 4, span: 2 },
      { kind: "pairs", name: "extra.items", label: "Commitments", titleLabel: "Title", textLabel: "Description", maxItems: 8, span: 2 },
    ],
  },
  contactCopy: {
    key: "contactCopy", table: "site_sections", sectionKey: "contact", title: "Contact section text", description: "Text around the contact form.",
    fields: [
      ...eyebrowHeading(),
      { kind: "textarea", name: "intro", label: "Introduction", max: 1200, rows: 4, span: 2 },
      { kind: "text", name: "extra.button", label: "Footer button text", max: 60 },
      { kind: "textarea", name: "extra.fineprint", label: "Small print under the form", max: 600, rows: 3, span: 2 },
    ],
  },
  missionVision: {
    key: "missionVision", table: "mission_vision", title: "Mission & vision", description: "Two statements, each set as a full-screen scene. Highlighted phrases glow as they are read.",
    fields: [
      { kind: "text", name: "mission_label", label: "Mission heading", max: 80, required: true },
      { kind: "textarea", name: "mission_text", label: "Mission statement", max: 1200, rows: 5, span: 2, required: true },
      { kind: "lines", name: "mission_highlights", label: "Phrases to highlight", help: "Exact phrases from the statement, one per line.", maxItems: 6, rows: 3, span: 2 },
      { kind: "text", name: "vision_label", label: "Vision heading", max: 80, required: true },
      { kind: "textarea", name: "vision_text", label: "Vision statement", max: 1200, rows: 5, span: 2, required: true },
      { kind: "lines", name: "vision_highlights", label: "Phrases to highlight", maxItems: 6, rows: 3, span: 2 },
    ],
    sections: [
      { title: "Mission", fields: ["mission_label", "mission_text", "mission_highlights"] },
      { title: "Vision", fields: ["vision_label", "vision_text", "vision_highlights"] },
    ],
  },
  valuesCopy: { key: "valuesCopy", table: "site_sections", sectionKey: "values", title: "Section heading", fields: eyebrowHeading() },
  whyCopy: { key: "whyCopy", table: "site_sections", sectionKey: "why", title: "Section heading", fields: eyebrowHeading() },
  approachCopy: {
    key: "approachCopy", table: "site_sections", sectionKey: "approach", title: "Section heading",
    fields: [...eyebrowHeading(), { kind: "textarea", name: "intro", label: "Introductory text", max: 600, rows: 2, span: 2 }],
  },
  servicesCopy: {
    key: "servicesCopy", table: "site_sections", sectionKey: "services", title: "Section heading",
    fields: [...eyebrowHeading(), { kind: "textarea", name: "intro", label: "Introductory text", max: 1200, rows: 3, span: 2 }],
  },
  industriesCopy: {
    key: "industriesCopy", table: "site_sections", sectionKey: "industries", title: "Section heading",
    fields: [
      ...eyebrowHeading(),
      { kind: "textarea", name: "intro", label: "Introductory text", max: 1200, rows: 3, span: 2 },
      { kind: "textarea", name: "extra.disclaimer", label: "Disclaimer", max: 600, rows: 2, span: 2, help: "Shown under the industries." },
    ],
  },
  teamCopy: {
    key: "teamCopy", table: "site_sections", sectionKey: "team", title: "Section heading",
    fields: [...eyebrowHeading(), { kind: "textarea", name: "intro", label: "Introductory text", max: 1200, rows: 4, span: 2 }],
  },
  reviewsCopy: {
    key: "reviewsCopy", table: "site_sections", sectionKey: "reviews", title: "Reviews section text",
    fields: [...eyebrowHeading(), { kind: "textarea", name: "intro", label: "Introductory text", max: 1200, rows: 3, span: 2 }],
  },
  faqCopy: {
    key: "faqCopy", table: "site_sections", sectionKey: "faq", title: "Section heading",
    fields: [...eyebrowHeading(), { kind: "textarea", name: "intro", label: "Introductory text", max: 600, rows: 2, span: 2 }],
  },

  /* ── site_settings groups ── */
  contact: {
    key: "contact", table: "site_settings", title: "Contact details", description: "Shown in the contact section, the footer and the site’s structured data. Empty fields are simply not shown.",
    fields: [
      { kind: "email", name: "contact_email", label: "Business email", help: "Shown publicly on the website." },
      { kind: "phone", name: "contact_phone", label: "Phone number", placeholder: "+1 555 010 2030" },
      { kind: "text", name: "location_label", label: "Location label", max: 120, help: "Shown when no full address is set, e.g. “United States”." },
      { kind: "textarea", name: "contact_address", label: "Office address", max: 300, rows: 3, span: 2, help: "Only fill this in if you want your address published." },
      { kind: "textarea", name: "contact_extra", label: "Additional contact information", max: 500, rows: 3, span: 2, help: "Optional, e.g. business hours." },
    ],
  },
  whatsapp: {
    key: "whatsapp", table: "site_settings", title: "WhatsApp", description: "Controls the floating WhatsApp button and every WhatsApp link on the site.",
    fields: [
      { kind: "switch", name: "whatsapp_enabled", label: "Show the floating WhatsApp button" },
      { kind: "digits", name: "whatsapp_country_code", label: "Country code", max: 4, placeholder: "1", help: "Digits only, without +. For example 1 (US), 44 (UK), 92 (Pakistan)." },
      { kind: "digits", name: "whatsapp_number", label: "Phone number", max: 15, placeholder: "5550102030", help: "Digits only, without the country code." },
      { kind: "textarea", name: "whatsapp_message", label: "Pre-filled message", max: 300, rows: 3, span: 2, help: "The message a visitor starts with when they tap the button." },
    ],
  },
  instagram: {
    key: "instagram", table: "site_settings", title: "Instagram", description: "Leave the address empty and no Instagram icon is shown.",
    fields: [
      { kind: "switch", name: "instagram_enabled", label: "Show the Instagram icon" },
      { kind: "url", name: "instagram_url", label: "Profile address", httpOnly: true, placeholder: "https://www.instagram.com/yourname", span: 2 },
    ],
  },
  footer: {
    key: "footer", table: "site_settings", title: "Footer", description: "Contact details in the footer come from Contact & Social Settings.",
    fields: [
      { kind: "textarea", name: "footer_note", label: "Footer small print", max: 600, rows: 3, span: 2 },
      { kind: "lines", name: "footer_marquee", label: "Scrolling phrases", help: "One phrase per line (up to 12). They loop along the top of the footer.", maxItems: 12, max: 80, rows: 5, span: 2 },
      { kind: "switch", name: "footer_show_contact", label: "Show contact cards in the footer" },
    ],
  },
};

/**
 * PRISM ADAPTIVE — the curated mixed theme.
 *
 * In Light and Dark every section follows the chosen theme. In Prism Adaptive each section below keeps the tone
 * that suits its composition. These are deliberate design decisions, not a light/dark/light/dark rotation:
 *
 *  hero        dark   the prism's light-dispersion graphic reads as luminous on deep navy
 *  about       light  long-form reading and a fine-line diagram need a bright, quiet page
 *  direction   dark   mission & vision are set as large statements; words "light up" as you read
 *  values      dark   continues the same chapter, so mission → vision → values read as one scene
 *  team        light  portraits sit on a neutral, bright backdrop (client photos will vary)
 *  services    light  the densest content on the site; maximum legibility for the lists
 *  why         dark   the rotating ring and its beam are a spotlit stage
 *  industries  light  editorial index and multi-tone scenes keep their true colours on white
 *  approach    dark   five cinematic scenes in a pinned sequence
 *  faq         light  reading and scanning
 *  contact     dark   glow details and the form pop on navy
 *  footer      dark   shares the contact scene so the page ends on one closing composition
 *
 * To change a decision, edit one line here.
 */
export type Tone = "light" | "dark";

export const adaptiveTone = {
  hero: "dark",
  about: "light",
  direction: "dark",
  values: "dark",
  team: "light",
  services: "light",
  why: "dark",
  industries: "light",
  approach: "dark",
  testimonials: "light",
  faq: "light",
  contact: "dark",
  footer: "dark",
} as const satisfies Record<string, Tone>;

export type SectionKey = keyof typeof adaptiveTone;

/** Page order (used to find where the tone changes). */
const ORDER: SectionKey[] = [
  "hero",
  "about",
  "direction",
  "values",
  "team",
  "services",
  "why",
  "industries",
  "approach",
  "testimonials",
  "faq",
  "contact",
  "footer",
];

/**
 * Attributes for a section root. `data-adaptive` carries the tone; `data-sheet` marks sections where the tone
 * changes so they slide over the previous one with rounded corners (Prism Adaptive only).
 * `hidden` lists sections that are not rendered (e.g. testimonials until real ones exist).
 */
export function adaptiveProps(key: SectionKey, hidden: SectionKey[] = ["testimonials"]) {
  const order = ORDER.filter((k) => !hidden.includes(k) || k === key);
  const prev = order[order.indexOf(key) - 1];
  const tone: Tone = adaptiveTone[key];
  return prev && adaptiveTone[prev] !== tone ? { "data-adaptive": tone, "data-sheet": "" } : { "data-adaptive": tone };
}

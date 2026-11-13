/** "Working together" → "working-together". Used for derived ids (service groups, FAQ topics). */
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "other";

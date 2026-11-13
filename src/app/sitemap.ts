import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content/fetch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { settings } = await getSiteContent();
  if (!settings.seo.indexable) return [];
  const now = new Date();
  return ["", "/privacy", "/terms"].map((p) => ({
    url: `${settings.company.url}${p}`,
    lastModified: now,
    changeFrequency: p ? "yearly" : "monthly",
    priority: p ? 0.3 : 1,
  }));
}

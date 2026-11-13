import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["", "/privacy", "/terms"].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: p ? "yearly" : "monthly",
    priority: p ? 0.3 : 1,
  }));
}

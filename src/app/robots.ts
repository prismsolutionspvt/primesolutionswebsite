import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content/fetch";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { settings } = await getSiteContent();
  const url = settings.company.url;
  // "Search engine indexing" comes from site_settings.indexable (database). The admin area is never indexed.
  return {
    rules: settings.seo.indexable ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api/"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}

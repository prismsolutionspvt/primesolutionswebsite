import { getSiteContent } from "@/lib/content/fetch";
import { ContentProvider } from "@/components/providers/ContentProvider";

/** Public site: fetch the (cached) content once and hand it to every client component through context. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return <ContentProvider value={content}>{children}</ContentProvider>;
}

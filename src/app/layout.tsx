import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { getSiteContent } from "@/lib/content/fetch";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

/** Title, description, share image, favicon and indexing are all editable in Admin → Website Appearance. */
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  const { seo, company } = settings;
  const og = seo.ogImageUrl ? [{ url: seo.ogImageUrl, alt: company.name }] : undefined;
  return {
    metadataBase: new URL(company.url),
    title: { default: seo.title, template: `%s | ${company.name}` },
    description: seo.description,
    applicationName: company.name,
    alternates: { canonical: "/" },
    openGraph: { type: "website", url: "/", siteName: company.name, title: seo.title, description: seo.description, locale: "en_US", ...(og ? { images: og } : {}) },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, ...(og ? { images: og.map((i) => i.url) } : {}) },
    robots: seo.indexable ? { index: true, follow: true } : { index: false, follow: false },
    icons: settings.brand.faviconUrl
      ? { icon: [{ url: settings.brand.faviconUrl }], apple: "/apple-icon" }
      : { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon" },
  };
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before first paint: the owner's default theme for first-time visitors (a saved Light/Dark/Adaptive choice
 * wins), a "js" flag, and the first-visit preloader flag (public pages only; the admin has no preloader).
 * `fallback` is one of three fixed strings validated in the database and in the mapper, never free text.
 */
const bootScript = (fallback: string) => `(function(){var d=document.documentElement;d.classList.add('js');
var t='${fallback}';try{var s=localStorage.getItem('prism-theme');if(s==='dark'||s==='light'||s==='adaptive')t=s}catch(e){}
d.dataset.theme=t;
try{if(!/^\\/(admin|auth)/.test(location.pathname)&&!sessionStorage.getItem('prism-seen')){d.classList.add('is-preloading')}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteContent();
  const theme = settings.theme.defaultTheme;
  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript(theme) }} />
        <link rel="preload" as="image" href="/brand/prism-logo.jpg" />
        <noscript>
          <style>{`.preloader{display:none!important}html.is-preloading,html.is-preloading body{overflow:auto!important}`}</style>
        </noscript>
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { site } from "@/config/site";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const title = "Prism Solutions | BPO & Digital Services";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s | Prism Solutions" },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon" },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before first paint: Light by default for first-time visitors (a saved Light/Dark/Adaptive choice wins),
 * a "js" flag, and the first-visit preloader flag — so there is no flash of the wrong theme or content.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');
var t='light';try{var s=localStorage.getItem('prism-theme');if(s==='dark'||s==='light'||s==='adaptive')t=s}catch(e){}
d.dataset.theme=t;
try{if(!sessionStorage.getItem('prism-seen')){d.classList.add('is-preloading')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="preload" as="image" href="/brand/prism-logo.jpg" />
        <noscript>
          <style>{`.preloader{display:none!important}html.is-preloading,html.is-preloading body{overflow:auto!important}`}</style>
        </noscript>
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}

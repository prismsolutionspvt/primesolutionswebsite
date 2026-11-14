import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== "production";

/** Origin + hostname of the Supabase project (images from its public bucket, API calls). */
const supabase = (() => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
    const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    return { origin: u.origin, host: u.hostname, wss: `wss://${u.hostname}` };
  } catch {
    return null;
  }
})();

/**
 * Content-Security-Policy built from what this app ACTUALLY loads (no wildcards):
 *  • scripts: our own bundles plus the inline bootstrap Next.js emits and the tiny theme/preloader boot script.
 *    ('unsafe-inline' is needed because those inline scripts have no per-request nonce; a nonce would force every page to
 *    be rendered per request and lose caching. 'unsafe-eval' is added ONLY in development for hot reload.)
 *  • fonts: self-hosted by next/font, so 'self' only. No Google Fonts request is made at runtime.
 *  • images: self (incl. /_next/image), data/blob for tiny inline art, and the Supabase public bucket.
 *  • connect: self (Server Actions, /api/admin/session) and the Supabase project.
 *  • nothing may frame the site (frame-ancestors), no plugins (object-src), no foreign <base> or form targets.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabase ? ` ${supabase.origin}` : ""}`,
  "font-src 'self' data:",
  `connect-src 'self'${supabase ? ` ${supabase.origin} ${supabase.wss}` : ""}${dev ? " ws: http://localhost:*" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // HSTS only in production builds (browsers ignore it over plain http anyway). No includeSubDomains/preload: the client's
  // other subdomains are not ours to commit to HTTPS.
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: root,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabase ? [{ protocol: "https", hostname: supabase.host, pathname: "/storage/v1/object/public/**" }] : [],
  },
  experimental: {
    // admin image uploads are posted to a Server Action (hard limit 5 MB per file is enforced in the action and by the bucket)
    serverActions: { bodySizeLimit: "6mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

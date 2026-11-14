# Architecture

## Assessment of the existing frontend (what the backend was built around)

The site was a single-page Next.js 15 app (`/` plus two legal pages) whose copy lived in typed modules under `src/content/` and whose contact/company values lived in `src/config/site.ts`. Most sections were client components (GSAP pinning, scrubbing, hover scenes). Themes are a `data-theme` attribute on `<html>` (Light / Dark / Prism Adaptive) with per-section tones. The preloader animates the exact logo file. The contact form had one isolated handler. The WhatsApp widget and footer credit read from config.

Decisions that followed:

| Constraint | Consequence |
| --- | --- |
| Do not redesign or break approved animations | Components keep their markup and animation code. They only changed *where their data comes from* (a provider instead of an import). Counts that used to be hard-coded (7 rays, 8 reasons, 5 stages) are now derived from the data. |
| Content modules already had the right shapes | The database is mapped *back* to those shapes (`lib/content/map.ts`), so components needed almost no change. The old modules became the **starter content** (seed) and the **offline fallback**. |
| Preserve the three themes, preloader, WhatsApp robot, hover effects, footer credit | Untouched, except that the theme default, WhatsApp number/message/enabled, footer text, credit label/link are now settings. |
| Pinned (GSAP) scenes must keep working with any number of items | `Why`/`Approach` size their scroll range from the item count; the hero rays spread evenly; `ValueGlyph` cycles its five drawings. |

## Components that became data-driven

Hero (copy, principles), About (+ positioning), Mission & Vision, Core Values, Why Prism, Our Approach, Services (+ subcategories, groups, icon, image), Industries (+ fits), Team, Reviews/Testimonials, FAQ (topics derived from the questions), Contact (copy, details, WhatsApp, social), Footer (note, marquee, contact visibility, credit), Navbar (services menu, logo, theme-switcher flag, admin link), WhatsApp widget, Preloader credit, Announcements, page metadata/robots/sitemap/JSON-LD, default theme.

## Request flow

```
Visitor ──▶ (site)/page.tsx ──▶ getSiteContent() ──▶ cache (5 min, tag "site-content")
                                       │                     ▲
                                       ▼ miss                │ revalidateTag on every admin save
                              Supabase as role `anon` ───────┘   (only published rows exist for anon)
                                       │ any error
                                       ▼
                              built-in content (src/content)  → never a blank page

Owner ──▶ /admin/* ──▶ middleware (verified session?) ──▶ layout requireAdmin() (server)
                                  │
                                  ▼
                       page loads data with the owner's session ──▶ Server Action
                                  (re-check owner → validate → write as owner → RLS judges → clear cache)

Visitor forms ──▶ Server Action (public.ts) ──▶ honeypot + fill-time → rate limit → zod → INSERT as `anon`
                  → column grants + RLS policy + CHECK constraints + flood-guard trigger decide
```

## Why the cache is a single query round

`getSiteContent()` fetches 14 tables in parallel once per revalidation, not once per component. It runs in the root layout (metadata, default theme), the `(site)` layout (provider), the page and the server sections, but `unstable_cache` plus React's request memoisation mean the database is hit at most once per 5 minutes (or per admin save).

## Security layers (public data)

anon can only: `SELECT` published rows, `INSERT` a *pending* review, `INSERT` a *new* enquiry (column-level grants limit which columns it may set; policies force `status`). Everything else is denied by missing grants, then by RLS, then by CHECK constraints (lengths, URL schemes, image paths), then by the flood-guard trigger. See [DATABASE.md](DATABASE.md) and `supabase/tests/rls.test.mjs`.

## Left for the audit

See [SECURITY.md](SECURITY.md#not-covered--accepted-risks) for the current list of accepted risks and what is not covered (MFA, CAPTCHA, shared-store rate limiting, a nonce-based CSP, a third-party penetration test, dev-only lint-toolchain advisories). Not built by agreement: enquiry e-mail notifications, advanced SEO, analytics.

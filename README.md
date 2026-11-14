# Prism Solutions — Website

Marketing website for **Prism Solutions**, a US-based Business Process Outsourcing (BPO) and Digital Services company. Built with the Next.js App Router, TypeScript, Tailwind CSS and GSAP.

This repository now contains the **website, the Supabase backend and the owner's admin panel**. Every piece of public content (services, industries, team, values, FAQs, reviews, announcements, contact details, footer, WhatsApp, theme defaults…) is managed from `/admin` and stored in Supabase. The original text in `src/content/` is kept as the starter content and as the fallback if the database is unreachable.

**Read first:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (handover and what the client must configure), [docs/SECURITY.md](docs/SECURITY.md), [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) (what you must click in Supabase), [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md) (how the owner-only lock works), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (how it fits together), [docs/TESTING.md](docs/TESTING.md) (what was actually tested, and what was not).

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Editing content](#editing-content)
- [Themes: Light, Dark and Prism Adaptive](#themes-light-dark-and-prism-adaptive)
- [Design system](#design-system)
- [Animation architecture](#animation-architecture)
- [Interaction catalogue (hover effects)](#interaction-catalogue-hover-effects)
- [Component conventions](#component-conventions)
- [Backend and admin panel](#backend-and-admin-panel)
- [Building and deploying](#building-and-deploying)
- [Content integrity rules](#content-integrity-rules)

## Features

- **Preloader:** a pure-white screen that animates the *original logo file* in slices, shows an honest progress bar (capped by what has really loaded) with the brand star as its head, and the "Powered by FRX Technologies" credit. About 2.5 s, once per session; on exit the logo flies into the navigation bar.
- **Three themes** in one switcher: Light (default for first-time visitors), Dark, and **Prism Adaptive** — a curated mix of light and dark sections. The choice is remembered and switching is smooth (no re-render, no animation restarts).
- Hero with a custom prism-and-rays graphic (each ray links to its service).
- Sections: About (scroll-driven swoosh scene), Mission & Vision (words light up as you read), Core Values (expanding panels), Meet the People Behind Prism (three profile slots), Services (grouped list with one-line descriptions + animated stage), Why Prism (pinned rotating ring on desktop, connected story on mobile), Industries, Approach (pinned five-scene process on desktop, vertical sequence on mobile), FAQ, Contact, and a closing-scene footer.
- Floating WhatsApp assistant: a robot-and-telephone scene that opens on hover (desktop) or tap (touch), with an optional telephone sound (off by default, never autoplays).
- Responsive navigation with an adaptive tone, services dropdown, and an animated mobile menu.
- Contact form with client-side validation, loading, error and success states, and one isolated submission handler.
- SEO: metadata, Open Graph / Twitter images built from the exact logo, favicon, sitemap, robots, JSON-LD (Organization, FAQ).
- Accessibility: semantic landmarks, keyboard-operable menus, tabs and accordions, visible focus, `prefers-reduced-motion` support.
- **Leave a review:** an interactive section (star-burst rating, a face that changes mood, a live preview, a confetti finish). Reviews arrive as *pending* and appear only after the owner approves them.
- **Announcements:** an animated pop-up (a bottom sheet on phones) with scheduling, priority and "how often" rules, managed from the admin.
- **Admin panel** at `/admin`: owner-only (email + password, with an emailed one-time link as backup), with 15 modules (content, services with subcategories, industries, team with photographs, service and industry images, reviews, FAQs, announcements, enquiries inbox, contact & social incl. footer text, settings).

## Tech stack

| Concern    | Choice                                                          |
| ---------- | --------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router), React 19                               |
| Language   | TypeScript (strict)                                             |
| Styling    | Tailwind CSS 3.4 with CSS-variable design tokens                |
| Animation  | GSAP + ScrollTrigger (scroll/timeline), Framer Motion (UI transitions) |
| Icons      | Lucide React (plus a few inline SVG brand icons)                |
| Fonts      | `next/font/google` — Bricolage Grotesque, Manrope, JetBrains Mono |
| Backend    | Supabase (PostgreSQL, Auth, Storage, Row Level Security) via `@supabase/ssr` |
| Validation | Zod (public forms) + a shared field engine for the admin forms |
| Quality    | ESLint (`next/core-web-vitals`, `next/typescript`), `tsc`, a Postgres security test suite |

> **Version pins that matter:** `typescript` is pinned to 5.9 (TypeScript 7 is not supported by Next 15), and Tailwind to 3.4 (v4 relies on native binaries that some locked-down Windows setups block). Do not bump either without testing a production build.

## Getting started

Requirements: **Node.js 20+** and npm.

```bash
git clone https://github.com/prismsolutionspvt/primesolutionswebsite.git
cd primesolutionswebsite
npm install
cp .env.example .env.local   # then fill in values (all optional for local dev)
npm run dev
```

The dev server runs at <http://localhost:5200>. The first load in a session shows the preloader; clear `sessionStorage` (or open a new tab) to replay it. Fonts are fetched from Google at build/dev time, so an internet connection is required.

## Environment variables

Copy `.env.example` to `.env.local`. **Never commit `.env*` files** (git-ignored; only `.env.example` is tracked).

| Variable | Where it is used | Notes |
| -------- | ---------------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Your project URL. Public. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser + server | The *publishable* (anon) key. Designed to be public: what it can do is decided by Row Level Security. |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap | Only a fallback: a site address stored in `site_settings.site_url` takes precedence. |
| `ADMIN_OWNER_EMAIL` | server only, optional | Only decides **to whom** the sign-in page sends a link. It never grants access. Defaults to `prismsolutions.pvt@gmail.com`. |

There is **no service-role key** anywhere: the app never needs one and must never be given one. Unset Supabase variables are safe: the site renders its built-in content and the admin shows "not configured". Contact details, WhatsApp number, Instagram etc. are now edited in the admin, not in environment variables.

## Scripts

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Start the dev server on port 5200                    |
| `npm run build`     | Production build                                     |
| `npm start`         | Serve the production build on port 5200              |
| `npm run typecheck` | `tsc --noEmit`                                       |
| `npm run lint`      | ESLint via `next lint`                               |
| `npm run check`     | Typecheck + lint + build (run before opening a PR)   |
| `npm test`          | Unit tests (32) + database tests (73). The database tests run every migration + the seed in an in-process Postgres, attack the access rules and drive every admin module end to end |
| `npm run security:check` | With the production server running: attack the running site and your Supabase project as a visitor; every attack must be refused |
| `npm run audit:links` | With the production server running: check every link and button on the rendered public pages |
| `npm run db:seed:generate` | Rebuild `supabase/seed.sql` from `src/content` |
| `npm run db:bundle` | Concatenate migrations + seed into one pasteable file (`supabase/_bundle.sql`) |

## Project structure

```
src/
├── app/
│   ├── layout.tsx            # Fonts, metadata from settings, pre-paint theme script
│   ├── (site)/               # PUBLIC site (page.tsx, privacy, terms) wrapped in <ContentProvider>
│   ├── admin/                # login/ and (panel)/<module>/page.tsx: the owner's panel
│   ├── auth/callback/        # one-time e-mail link landing; signs out anyone who is not the owner
│   ├── api/admin/session/    # tells the public site whether to show the Admin link (boolean only)
│   ├── actions/public.ts     # Server Actions for the public forms (review, enquiry)
│   └── sitemap.ts robots.ts opengraph-image.tsx apple-icon.tsx icon.svg
├── admin/                    # Admin engine: fields.ts (form definitions), registry.ts (every module), parse.ts (server validation),
│   │                         #   data.ts (loaders), actions/ (content, media, enquiries, auth: all re-check the owner)
├── components/
│   ├── admin/                # Shell, forms, drawer, image picker, enquiry controls
│   ├── layout/ motion/ sections/ ui/ providers/
├── config/                   # site.ts (defaults), owner.ts (who gets a sign-in link), adaptive.ts (Prism Adaptive tones)
├── content/                  # Built-in starter content: seed source and offline fallback
├── lib/
│   ├── supabase/             # env, browser / server / anon clients, middleware helper
│   ├── auth/admin.ts         # THE server-side owner check
│   ├── content/              # types, defaults, mapper, cached fetcher (one query round per revalidation)
│   └── validation/ rate-limit.ts slug.ts icons.tsx enquiry.ts theme.ts gsap.ts …
├── middleware.ts             # first gate for /admin (defence in depth)
├── styles/globals.css        # Tokens, the three theme palettes, shared utilities
└── types/
supabase/
├── migrations/               # 01 core+owner lock · 02 content · 03 enquiries+media+anti-spam · 04 storage · 05 owner bootstrap
├── seed.sql                  # starter content (generated from src/content)
└── tests/rls.test.mjs        # the security suite
public/brand/prism-logo.jpg   # the EXACT logo from the company portfolio
docs/                         # setup + architecture + testing guides; the portfolio DOCX (git-ignored)
```

Each folder under `components/sections/` holds a section and anything used only by it, for example `services/Services.tsx` + `ServiceDetail.tsx` + `ServiceGlyph.tsx`. Sections are re-exported from `components/sections/index.ts`.

## Editing content

**Day to day, use the admin panel** (`/admin`). It is the only thing the owner needs. The files in `src/content/` are the *starter* content: they are loaded into the database once by `supabase/seed.sql`, and shown if Supabase cannot be reached. After the seed has run, editing those files no longer changes the live site; change content in the admin, or re-generate the seed for a new database with `npm run db:seed:generate`.

**Source of truth for wording:** the company portfolio (`docs/Prism_Solutions_Company_Portfolio.docx`, kept locally, not committed). Use its wording and US spelling. Never add services, claims, clients, statistics or certifications it does not contain.

## Themes: Light, Dark and Prism Adaptive

One switcher offers three options; the choice is stored in `localStorage` (`prism-theme`) and applied before first paint by a boot script in `app/layout.tsx`. First-time visitors always get **Light**.

- **Light / Dark** — every section follows the chosen palette.
- **Prism Adaptive** — a curated mix. The root palette is light; sections marked `data-adaptive="dark"` switch to the dark palette. Which section gets which tone is decided in **`src/config/adaptive.ts`**, one line per section, with the design reasoning next to it (this is deliberately not a light/dark rotation). Where the tone changes, the incoming section slides over the previous one with rounded corners (`data-sheet`). The navigation bar takes the tone of whatever section is beneath it (`useToneUnderHeader`).

Implementation notes:

- All colours are CSS variables in `styles/globals.css`. The dark palette is declared once and shared by the Dark theme, adaptive dark sections and the nav-over-dark state.
- Switching changes one attribute on `<html>`. No React state is shared, so nothing re-renders or remounts and no GSAP animation restarts. Where the View Transitions API exists it provides a circular-reveal crossfade (`lib/theme.ts`); elsewhere the switch is instant. No per-element CSS transitions are used, so there is no lag.
- The "chalk" lines in the hero and scenes use `--chalk`, which is a dark blue in dark tones.
- The preloader always uses the light palette (`.surface-day`) so it stays pure white in every theme.

## Design system

Tokens are CSS variables in `src/styles/globals.css`, exposed to Tailwind in `tailwind.config.ts` (`bg-bg`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, …). Brand colours were taken from the supplied logo: navy `#0B1F4B`, orange `#F28A1E`, amber `#F7A83B`.

- Typography roles: `font-display` (headlines), `font-sans` (body), `font-mono` (labels). Utility classes `.wrap`, `.eyebrow`, `.h-display`, `.btn`, `.btn-primary`, `.btn-ghost`, `.link-u` are defined once in the globals.
- To re-skin the site, change the variables, not individual components.
- The logo is the **exact original file** (`public/brand/prism-logo.jpg`), rendered by `components/ui/BrandLogo.tsx` (never cropped or recreated; in dark tones it sits on a white plate because the artwork has a white background). The preloader animates the same file by clipping it into regions (`motion/Preloader.tsx`), so if the logo artwork ever changes, re-measure those regions.

## Animation architecture

- **One registration point.** `src/lib/gsap.ts` registers ScrollTrigger once and exports `registerGsap()`. Always get `gsap`/`ScrollTrigger` from it.
- **Shared scroll vocabulary** lives in `components/motion/MotionRoot.tsx`, mounted once. It animates by data attribute: `[data-split]` (word-mask headline reveal, from `ui/Split`), `[data-fade]` (IntersectionObserver fade-up), `[data-clip]` (wipe reveal), `[data-parallax]` (desktop only), `[data-draw-on-view]` (SVG swoosh that draws itself). It also tracks the pointer for the button spotlight.
- **Section choreography** (hero rays, about scene, mission path, why ring, approach scenes, etc.) stays inside that section's component, wrapped in `gsap.context(...)` and reverted in the effect cleanup.
- **Pinned sections** (Why Prism, Approach) are sized from the viewport height (`svh` units and `min-h-0` grids) so the whole composition fits on any desktop screen, and they scroll for only 1.5 screens. Below 1024px they become unpinned, mobile-first layouts. They are created inside `gsap.matchMedia`.
- **Preloader gating.** `motion/Preloader.tsx` sets `html.is-preloading` before paint (boot script) and fires `prism:ready` when the logo lands in the nav. Reveal animations call `whenReady()` from `lib/gsap.ts`, so nothing animates behind the loader.
- **Hidden initial states are CSS, not JS**, and only apply when `html.js` is present, so content stays visible without JavaScript.
- **Performance rules:** animate `transform`/`opacity`; no always-on timelines (looping effects are CSS and pause off-screen or on hover); ScrollTriggers are killed on unmount; pointer effects use rAF-throttled CSS variables.
- **Reduced motion:** `prefersReducedMotion()` (`lib/motion.ts`) and CSS `@media (prefers-reduced-motion)` disable motion and show final states.

## Interaction catalogue (hover effects)

Where hover/pointer interactions live, so they can be reviewed or reused:

| Where | Effect |
| ----- | ------ |
| All buttons (`.btn`) | A soft spotlight follows the cursor inside the button; primary buttons also get a sheen sweep; hero and footer CTAs have a magnetic pull |
| Navigation links | A sliding pill follows the pointer, plus an underline that grows from the centre |
| Navigation logo | A warm sheen sweeps across the artwork |
| Theme switcher | Sliding accent thumb with glow |
| Service rows | A tint sweeps in from the left, the title slides, the "+" chip recolours; the stage updates |
| Service capabilities | Title slides right and the "+" rotates; details expand in place |
| Industry service chips | Chip lifts and fills with the accent, an arrow slides in, and a click jumps to that service |
| Core value panels | The hovered panel opens, its line-graphic redraws, and a light follows the cursor inside it |
| Why Prism ring nodes | Node swells and lights up; native tooltip shows the reason |
| FAQ topic chips and rows | Sliding indicator; rows get a sweeping tint, accent bar, shifting question and a ring that draws on open |
| Contact cards | Icon chip fills and tilts, card lifts with glow, copy button fades in |
| Team portraits | The portrait tilts toward the cursor with a moving glare and a swoosh draws around it |
| Footer navigation | Hovering one link dims the others; the link slides, an underline draws, a hint and arrow appear |
| Footer marquee | Pauses on hover; the phrase under the cursor turns accent |
| Footer commitments | A line draws across the top and a glow blooms |
| Footer social icons | Magnetic pull and a brand-colour fill with glow |
| "Powered by FRX Technologies" | Lift, brighter glow, sheen sweep, arrow nudge |
| WhatsApp button | Icon tilts and swells, halo glow grows; the robot scene opens |

## Component conventions

- Server Components by default. Add `"use client"` only when a component needs state, effects, or browser APIs.
- One component per file, named export, file named after the component (`PascalCase.tsx`). Hooks are `useCamelCase.ts`.
- Import with the `@/` alias (`@/components/...`, `@/content`, `@/config/...`, `@/types`); use relative imports only within a section folder.
- Shared types live in `src/types`; do not declare data types inside content files.
- Content and copy belong in `src/content`, never inline in JSX (short UI labels are fine). Contact/company values come from `config/site.ts`.
- Every homepage section root spreads `{...adaptiveProps("<key>")}` (from `config/adaptive.ts`) so it participates in Prism Adaptive.
- Use design tokens (`text-ink`, `bg-surface`, `border-line`) rather than raw colours so all three themes work. Raw hex is acceptable only for third-party brand colours (e.g. WhatsApp green) and the always-white preloader.
- Touch targets are at least 44px; every interactive element needs a visible focus state and an accessible name.
- Anchors that jump to sections on the home page use plain `<a href="/#id">` on purpose (the matching ESLint rule is disabled in `.eslintrc.json`).
- Do not invent content: no fake clients, reviews, statistics, certifications, addresses, team names or contact details.

## Backend and admin panel

- **Data flow (public site):** `getSiteContent()` reads every public table once (parallel queries, as the anonymous role, so only published rows are visible), maps rows to the same shapes the components always used, and caches the result for 5 minutes. Every admin save clears the cache (`revalidateTag`), so changes appear immediately. If any read fails, the built-in content is shown instead and the failure is not cached.
- **Data flow (admin):** pages load with the owner's own session; every change goes through a Server Action that (1) re-verifies the owner, (2) validates on the server, (3) writes with the owner's session so Row Level Security is the final judge, (4) clears the public cache.
- **One engine for every module:** a module is one entry in `src/admin/registry.ts` (fields, sections, order, publish column). The list, editor, validation, reordering and publish toggle are shared.
- **Adding a field or module:** add the column in a new migration, add the field to `registry.ts` (and to `lib/content/map.ts` + the component if it is public). See [docs/DATABASE.md](docs/DATABASE.md).
- **Email:** enquiries are saved and shown in Admin → Enquiries. **Nothing is e-mailed** until a mail provider is connected (isolate it behind `app/actions/public.ts`); the admin says so.
- **Not done on purpose:** a rich-text editor (plain text with paragraphs is used, so there is nothing to sanitise), drag-and-drop ordering (Up/Down buttons are reliable and accessible), CAPTCHA, a CSP and dependency audit (reserved for the dedicated security/SEO audit, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#left-for-the-audit)).

## Building and deploying

```bash
npm run check    # typecheck + lint + production build
npm start        # serve the production build locally
```

The app needs a Next-capable host with Server Actions and middleware (Vercel, Netlify with its Next runtime, or any Node host running `npm start`). Set the environment variables above in the host dashboard, then follow [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) (add the production URL to Supabase's redirect list, connect a mail sender for sign-in links).

Before launch, enter in the admin: the phone number, WhatsApp number, Instagram URL, the three team profiles (real names, roles, photographs), and have the Privacy Policy and Terms written (the pages are placeholders; the privacy page now describes how forms are stored). A vector or transparent logo would improve the dark themes.

## Content integrity rules

This site must not publish unverified claims. Headquarters city/state, office address, phone number, registrations, certifications, client names, statistics, reviews and team identities stay empty or clearly labelled as placeholders until the client confirms them. See [CONTRIBUTING.md](CONTRIBUTING.md).

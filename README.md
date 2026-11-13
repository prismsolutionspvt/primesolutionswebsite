# Prism Solutions — Website

Marketing website for **Prism Solutions**, an integrated digital marketing, sales, customer support and BPO partner. Built with the Next.js App Router, TypeScript, Tailwind CSS and GSAP.

This repository is the **frontend phase**. There is no database, authentication or admin panel yet; the code is structured so those can be added without rewriting the site (see [Preparing for the backend](#preparing-for-the-backend-and-admin-panel)).

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Editing content](#editing-content)
- [Design system](#design-system)
- [Animation architecture](#animation-architecture)
- [Component conventions](#component-conventions)
- [Preparing for the backend and admin panel](#preparing-for-the-backend-and-admin-panel)
- [Building and deploying](#building-and-deploying)
- [Content integrity rules](#content-integrity-rules)

## Features

- Pure-white preloader that animates the **original logo file** in slices (once per session; progress follows real font/page readiness).
- Hero with a custom prism-and-rays motion graphic (each ray links to its service) and scroll-linked transitions.
- Sections: About (scroll-driven swoosh scene, mission/vision/values), Founder (hidden until supplied), Services (grouped interactive explorer), Why Prism (pinned rotating ring on desktop, connected story on mobile), Industries (editorial index + animated scenes), Approach (pinned five-scene process on desktop, vertical sequence on mobile), FAQ (topic filters), Contact, and a closing scene footer.
- Light theme by default, with a designed dark theme. The preference is persisted (no flash on load) and every section follows it.
- Floating WhatsApp assistant: a robot-and-telephone scene that opens on hover (desktop) or tap (touch), with an optional, opt-in telephone sound (off by default, never autoplays).
- Responsive navigation: services dropdown on desktop, animated full-screen menu on mobile.
- Contact form with client-side validation, loading, error and success states. Submission goes through one isolated handler.
- SEO: metadata, Open Graph / Twitter images, favicon, sitemap, robots, JSON-LD (Organization, FAQ).
- Accessibility: semantic landmarks, keyboard-operable menus and accordions, visible focus, `prefers-reduced-motion` support.
- Testimonials and an announcement popup are built but **hidden until real content is supplied**.

## Tech stack

| Concern    | Choice                                                          |
| ---------- | --------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router), React 19                               |
| Language   | TypeScript (strict)                                             |
| Styling    | Tailwind CSS 3.4 with CSS-variable design tokens                |
| Animation  | GSAP + ScrollTrigger (scroll/timeline), Framer Motion (UI transitions) |
| Icons      | Lucide React (plus a few inline SVG brand icons)                |
| Fonts      | `next/font/google` — Bricolage Grotesque, Manrope, JetBrains Mono |
| Quality    | ESLint (`next/core-web-vitals`, `next/typescript`), `tsc`        |

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

The dev server runs at <http://localhost:5200>. The first load in a session shows the preloader; clear `sessionStorage` (or open a new tab) to replay it.

Fonts are fetched from Google at build/dev time, so an internet connection is required.

## Environment variables

Copy `.env.example` to `.env.local`. Every variable is optional; unset values render as "To be confirmed" placeholders. **Never commit `.env*` files** (they are git-ignored; only `.env.example` is tracked).

| Variable                       | Purpose                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Canonical origin (no trailing slash). Drives canonical URLs, sitemap, Open Graph.          |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | Overrides the confirmed default (`prismsolutions.pvt@gmail.com`) in `config/site.ts`.      |
| `NEXT_PUBLIC_CONTACT_PHONE`    | Shown in contact section and footer.                                                      |
| `NEXT_PUBLIC_CONTACT_ADDRESS`  | Office address. Leave blank until the client confirms a location.                          |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`  | Digits only, international format. Blank = WhatsApp opens with a contact chooser.          |
| `NEXT_PUBLIC_INSTAGRAM_URL`    | Instagram profile link. Blank = no Instagram link is shown.                               |
| `NEXT_PUBLIC_ENQUIRY_ENDPOINT` | URL that receives enquiry POSTs. Blank = form runs in **preview mode** (nothing is sent). |

`NEXT_PUBLIC_*` values are embedded in the client bundle and are therefore public. Put real secrets (API keys, database URLs) in **non-prefixed** variables and read them only in server code.

## Scripts

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Start the dev server on port 5200                    |
| `npm run build`     | Production build                                     |
| `npm start`         | Serve the production build on port 5200              |
| `npm run typecheck` | `tsc --noEmit`                                       |
| `npm run lint`      | ESLint via `next lint`                               |
| `npm run check`     | Typecheck + lint + build (run before opening a PR)   |

## Project structure

```
src/
├── app/                      # Routes, layout, metadata files (App Router)
│   ├── layout.tsx            # Fonts, global metadata, pre-paint boot script (theme, preloader flag)
│   ├── page.tsx              # Homepage: composes sections in order
│   ├── privacy/ terms/       # Placeholder legal pages
│   ├── sitemap.ts robots.ts  # SEO files
│   ├── opengraph-image.tsx   # 1200×630 social preview (also used for Twitter)
│   ├── apple-icon.tsx        # Apple touch icon
│   └── icon.svg              # Favicon
├── components/
│   ├── layout/               # Site chrome: Navbar, Footer (closing scene), WhatsAppWidget + RobotScene, AnnouncementModal, LegalShell
│   ├── motion/               # Animation infrastructure: Preloader, MotionRoot, Magnetic
│   ├── sections/             # One folder per homepage section (see below)
│   └── ui/                   # Small reusable primitives: BrandLogo (exact logo), Split, ThemeToggle, SocialIcons
├── config/site.ts            # CENTRAL SETTINGS: company, contact, social, WhatsApp (env-driven; admin-ready shape)
├── content/                  # All editable copy and data, one file per topic (CMS-ready)
├── hooks/                    # Reusable React hooks (useNavScroll, useEscapeKey, useActiveSection)
├── lib/                      # enquiry handler, gsap setup, motion helpers, ring sound
├── styles/globals.css        # Design tokens (CSS variables), base styles, shared utilities
└── types/                    # Shared TypeScript types (content, enquiry)
public/brand/                 # prism-logo.jpg = the EXACT logo from the company portfolio (do not edit or re-export)
docs/                         # Source documents (company portfolio DOCX — the source of truth for content)
```

Each folder under `components/sections/` holds a section and anything used only by it, for example `services/Services.tsx` + `services/ServiceGlyph.tsx`. Sections are re-exported from `components/sections/index.ts`.

## Editing content

Copy lives in `src/content/` and is imported through `@/content`. Components never contain marketing copy of their own, so a CMS or admin API can later replace these modules with fetched data.

| File                                | Controls                                                          |
| ----------------------------------- | ----------------------------------------------------------------- |
| `hero.ts`                           | Hero headline, supporting text, CTAs                              |
| `about.ts`                          | Overview, mission, vision, four positioning pillars, core values  |
| `services.ts`                       | The seven services, their groups, summaries and capabilities      |
| `why.ts` `approach.ts`              | The eight reasons and the five-stage delivery process             |
| `industries.ts`                     | Industries (potential fit only) and compliance notes              |
| `faq.ts`                            | FAQ topics and questions                                          |
| `cta.ts`                            | Contact headline and the five service commitments (closing scene) |
| `founder.ts`                        | Founder name, designation, message, photo. **Section stays hidden until name and message are filled in** |
| `testimonials.ts`                   | Approved testimonials. Empty array = section hidden                |
| `announcement.ts`                   | Announcement popup. `enabled: false` by default                   |

**Source of truth:** the company portfolio in `docs/Prism_Solutions_Company_Portfolio.docx`. Content must match it; do not add services, claims, clients, statistics or certifications that it does not contain.

Company, contact and social values live in **one place**: `src/config/site.ts` (the `settings` object, typed as `SiteSettings`). It is built from confirmed defaults plus `NEXT_PUBLIC_*` overrides, and is the shape the admin panel will manage later (email, phone, office address, WhatsApp number, Instagram URL). Components never hardcode these values.


## Design system

Tokens are CSS variables in `src/styles/globals.css`, exposed to Tailwind in `tailwind.config.ts` (`bg-bg`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, …). Brand colours were taken from the supplied logo:

- Navy `#0B1F4B` (wordmark), orange `#F28A1E` (arc), amber `#F7A83B` (star).
- `:root` defines the light theme; `:root[data-theme="dark"]` the dark theme.
- Light is the default theme (a saved preference wins). Every section uses the tokens, so both themes are designed rather than inverted. `.surface-day` forces the light palette (used only by the white preloader).
- Typography roles: `font-display` (headlines), `font-sans` (body), `font-mono` (labels). Utility classes `.wrap`, `.eyebrow`, `.h-display`, `.btn`, `.btn-primary`, `.btn-ghost`, `.link-u` are defined once in the globals.

To re-skin the site, change the variables, not individual components. The logo is the **exact original file** from the company portfolio (`public/brand/prism-logo.jpg`), rendered by `components/ui/BrandLogo.tsx` (never cropped or recreated; in dark mode it sits on a white plate because the artwork has a white background). The preloader animates the same file by clipping it into regions (`motion/Preloader.tsx`), so if the logo artwork ever changes, re-measure those regions.

## Animation architecture

- **One registration point.** `src/lib/gsap.ts` registers ScrollTrigger once and exports `registerGsap()`. Always get `gsap`/`ScrollTrigger` from it.
- **Shared scroll vocabulary** lives in `components/motion/MotionRoot.tsx`, mounted once on the page. It animates by data attribute: `[data-split]` (word-mask headline reveal, produced by `ui/Split`), `[data-fade]` (IntersectionObserver fade-up), `[data-clip]` (wipe reveal), `[data-parallax]` (desktop only).
- **Section choreography** (hero rays, approach beam, about network, etc.) stays inside that section's component, wrapped in `gsap.context(...)` and reverted in the effect cleanup.
- **Preloader gating.** The preloader (`motion/Preloader.tsx`) sets `html.is-preloading` before paint (boot script in `layout.tsx`) and fires a `prism:ready` event when it leaves. Reveal animations call `whenReady()` from `lib/gsap.ts`, so nothing animates behind the loader.
- **Hidden initial states are CSS, not JS**, and only apply when `html.js` is present, so content stays visible without JavaScript. Split words use the individual `translate` property so GSAP's `transform` takes over cleanly.
- **Performance rules:** animate `transform`/`opacity` only; no always-on timelines (the hero's looping ray pulses are CSS and pause off-screen); `ScrollTrigger` instances are always killed on unmount; pinned/parallax effects are limited to `(min-width: 1024px)` via `gsap.matchMedia`.
- **Reduced motion:** `prefersReducedMotion()` (`lib/motion.ts`) and a CSS `@media (prefers-reduced-motion)` block disable motion and show final states.

## Component conventions

- Server Components by default. Add `"use client"` only when a component needs state, effects, or browser APIs.
- One component per file, named export, file named after the component (`PascalCase.tsx`). Hooks are `useCamelCase.ts`.
- Import with the `@/` alias (`@/components/...`, `@/content`, `@/types`); use relative imports only within a section folder.
- Shared types live in `src/types`; do not declare data types inside content files.
- Content and copy belong in `src/content`, never inline in JSX (short UI labels are fine).
- Prefer design tokens (`text-ink`, `bg-surface`) over raw colours so both themes work. Raw hex is acceptable only for third-party brand colours (e.g. WhatsApp green) and deliberately fixed brand panels.
- Touch targets are at least 44px; every interactive element needs a visible focus state and an accessible name.
- Anchors that jump to sections on the home page use plain `<a href="/#id">` on purpose (the matching ESLint rule is disabled in `.eslintrc.json`).
- Do not invent content: no fake clients, reviews, statistics, certifications, addresses or contact details.

## Preparing for the backend and admin panel

The frontend is built so these can be added later without refactoring components:

- **Enquiries:** `src/lib/enquiry.ts` is the only code that talks to a backend. Today, with no endpoint set, it runs in preview mode and the success message says nothing was sent. Point `NEXT_PUBLIC_ENQUIRY_ENDPOINT` at an API, or replace `submitEnquiry` with a Server Action / route handler. Add server-side validation and spam protection there; client validation is for UX only.
- **Admin-managed content:** every module in `src/content/` has a matching type in `src/types`. Swap the static exports for data fetched from your CMS/DB (e.g. in server components) and keep the shapes.
- **Testimonials:** only entries with `status: "published"` render; `featured` entries sort first.
- **Announcements:** `AnnouncementModal` already supports heading, text, image, enable flag, show-on-load and dismissal period.
- **Authentication:** none is implemented. When added, protect `/admin` routes server-side (session/JWT checked in middleware and route handlers). Never rely on hidden buttons or client-side passwords. `robots.ts` already disallows `/admin` and `/api/`.

## Building and deploying

```bash
npm run check    # typecheck + lint + production build
npm start        # serve the production build locally
```

The app is a standard Next.js app with no server-only requirements today, so it deploys to any Next-capable host. On **Vercel** or **Netlify**, import the repository, keep the default build command (`npm run build`), and set the environment variables above in the host dashboard. Set `NEXT_PUBLIC_SITE_URL` to the real domain so canonical URLs, the sitemap and Open Graph images are correct (WhatsApp/Instagram previews need absolute URLs).

Before launch, confirm with the client: the logo file in `public/brand/prism-logo.jpg` (a vector/transparent version would be ideal), the office city/state and phone number, WhatsApp number, social URLs, the founder name, designation, photo and message (the section stays hidden until supplied), and final Privacy Policy and Terms (the current pages are placeholders).

## Content integrity rules

This site must not publish unverified claims. Headquarters location, office address, phone number, registrations, certifications, client names, statistics and reviews stay empty or clearly labelled as placeholders until the client confirms them. See [CONTRIBUTING.md](CONTRIBUTING.md).

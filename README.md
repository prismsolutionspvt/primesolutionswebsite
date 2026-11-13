# Prism Solutions — Website

Marketing website for **Prism Solutions**, a US-based Business Process Outsourcing (BPO) and Digital Services company. Built with the Next.js App Router, TypeScript, Tailwind CSS and GSAP.

This repository is the **frontend phase**. There is no database, authentication or admin panel yet; the code is structured so those can be added without rewriting the site (see [Preparing for the backend and admin panel](#preparing-for-the-backend-and-admin-panel)).

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
- [Preparing for the backend and admin panel](#preparing-for-the-backend-and-admin-panel)
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
- Testimonials and the announcement popup are built but **hidden until real content is supplied**.

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

The dev server runs at <http://localhost:5200>. The first load in a session shows the preloader; clear `sessionStorage` (or open a new tab) to replay it. Fonts are fetched from Google at build/dev time, so an internet connection is required.

## Environment variables

Copy `.env.example` to `.env.local`. Every variable is optional; unset values render as clear placeholders. **Never commit `.env*` files** (they are git-ignored; only `.env.example` is tracked).

| Variable                       | Purpose                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Canonical origin (no trailing slash). Drives canonical URLs, sitemap, Open Graph.          |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | Overrides the confirmed default (`prismsolutions.pvt@gmail.com`) in `config/site.ts`.      |
| `NEXT_PUBLIC_CONTACT_PHONE`    | Phone number. Blank shows "Phone number coming soon".                                     |
| `NEXT_PUBLIC_CONTACT_ADDRESS`  | Office address. Blank shows the confirmed location label ("United States").                |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`  | Digits only, international format. Blank = WhatsApp opens with a contact chooser.          |
| `NEXT_PUBLIC_INSTAGRAM_URL`    | Instagram profile link. Blank = no Instagram link is shown.                               |
| `NEXT_PUBLIC_ENQUIRY_ENDPOINT` | URL that receives inquiry POSTs. Blank = form runs in **preview mode** (nothing is sent). |

`NEXT_PUBLIC_*` values are embedded in the client bundle and are therefore public. Put real secrets in **non-prefixed** variables and read them only in server code.

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
│   ├── layout.tsx            # Fonts, metadata, pre-paint boot script (theme, preloader flag)
│   ├── page.tsx              # Homepage: composes sections in order
│   ├── privacy/ terms/       # Placeholder legal pages
│   ├── sitemap.ts robots.ts  # SEO files
│   ├── opengraph-image.tsx   # 1200×630 social preview: the exact logo on white (also used for Twitter)
│   ├── apple-icon.tsx        # Apple touch icon
│   └── icon.svg              # Favicon
├── components/
│   ├── layout/               # Site chrome: Navbar, Footer (+ marquee, commitments, glow), WhatsAppWidget + RobotScene, AnnouncementModal, LegalShell
│   ├── motion/               # Animation infrastructure: Preloader, MotionRoot, ScrollProgress, Magnetic
│   ├── sections/             # One folder per homepage section (hero, about, direction, values, team, services, why, industries, approach, testimonials, faq, contact)
│   └── ui/                   # Reusable primitives: BrandLogo, Split, ScrollWords, ThemeSwitcher, PoweredBy, ContactCard, CopyButton, SocialIcons
├── config/
│   ├── site.ts               # CENTRAL SETTINGS: company, contact, social, WhatsApp, credit link (admin-ready shape)
│   └── adaptive.ts           # Prism Adaptive: which tone each section takes (with the reasoning)
├── content/                  # All editable copy and data, one file per topic (CMS-ready)
├── hooks/                    # useNavScroll, useEscapeKey, useActiveSection, useToneUnderHeader
├── lib/                      # theme engine, enquiry handler, gsap setup, motion helpers, ring sound
├── styles/globals.css        # Design tokens (CSS variables), the three theme palettes, shared utilities
└── types/                    # Shared TypeScript types (content, settings, enquiry)
public/brand/prism-logo.jpg   # The EXACT logo from the company portfolio (never edit, crop or re-export)
docs/                         # Source documents (company portfolio DOCX — the source of truth for content)
```

Each folder under `components/sections/` holds a section and anything used only by it, for example `services/Services.tsx` + `ServiceDetail.tsx` + `ServiceGlyph.tsx`. Sections are re-exported from `components/sections/index.ts`.

## Editing content

Copy lives in `src/content/` and is imported through `@/content`. Components never contain marketing copy of their own, so a CMS or admin API can later replace these modules with fetched data.

| File               | Controls                                                                         |
| ------------------ | -------------------------------------------------------------------------------- |
| `hero.ts`          | Hero headline, supporting text, CTAs                                              |
| `about.ts`         | Overview, mission, vision, positioning pillars, core values                       |
| `services.ts`      | The seven services: groups, one-line descriptions, summaries, capabilities        |
| `why.ts`           | The eight reasons to choose Prism                                                 |
| `industries.ts`    | Industries (potential fit only), the portfolio's sentence for each, policy notes  |
| `approach.ts`      | The five-stage process                                                            |
| `team.ts`          | The three "Meet the People Behind Prism" profile slots (name, designation, description, photo) |
| `faq.ts`           | FAQ topics and questions                                                          |
| `cta.ts`           | Contact headline/text and the five service commitments (footer)                   |
| `footer.ts`        | Footer marquee phrases, navigation links, legal links, small print                |
| `testimonials.ts`  | Approved testimonials. Empty array = section hidden                               |
| `announcement.ts`  | Announcement popup. `enabled: false` by default                                   |

**Source of truth:** the company portfolio in `docs/Prism_Solutions_Company_Portfolio.docx` (kept locally, not committed). Wording follows the portfolio, including its US spelling (organization, optimization, inquiry). Do not add services, claims, clients, statistics or certifications that it does not contain.

Company, contact and social values live in **one place**: `src/config/site.ts` (the `settings` object, typed as `SiteSettings`). It is built from confirmed defaults plus `NEXT_PUBLIC_*` overrides. Components never hardcode these values.

### Team photos

Put images in `public/team/` (e.g. `member-1.jpg`, portrait 4:5 works best) and set `photoUrl: "/team/member-1.jpg"` in `src/content/team.ts` along with the name, designation and description. Until then each slot shows an upload-style placeholder; nothing is invented.

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

## Preparing for the backend and admin panel

The frontend is structured so these can be added without refactoring components. Everything the admin panel will manage already has a typed home:

| Admin-managed item | Where it lives today | Type |
| ------------------ | -------------------- | ---- |
| Team profiles: name, designation, description, photograph (3 slots) | `content/team.ts` → `team` | `TeamMember` |
| Phone, email, office location, WhatsApp number | `config/site.ts` → `settings.contact` | `SiteSettings` |
| Instagram URL | `config/site.ts` → `settings.social` | `SiteSettings` |
| Company name, tagline, location label, description | `config/site.ts` → `settings.company` | `SiteSettings` |
| Mission and vision | `content/about.ts` → `direction` | — |
| Core values, overview, positioning pillars | `content/about.ts` | `Value`, `PositioningPillar` |
| Services and descriptions | `content/services.ts` | `Service`, `ServiceItem` |
| Industries and descriptions | `content/industries.ts` | `Industry` |
| FAQs | `content/faq.ts` | `Faq` |
| Footer content | `content/footer.ts` | `FooterContent` |
| Announcements | `content/announcement.ts` | `Announcement` |
| Testimonials and reviews | `content/testimonials.ts` (only `status: "published"` render) | `Testimonial` |
| Contact inquiries (submissions) | `lib/enquiry.ts` (`submitEnquiry`) | `Enquiry` |

- **Inquiries:** `src/lib/enquiry.ts` is the only code that talks to a backend. With no endpoint set it runs in preview mode and the success message says nothing was sent. Point `NEXT_PUBLIC_ENQUIRY_ENDPOINT` at an API, or replace `submitEnquiry` with a Server Action / route handler. Add server-side validation and spam protection there; client validation is for UX only.
- **Swapping static data for an API:** each content module exports plain typed objects. Replace the export with data fetched in a server component and keep the shape.
- **Authentication:** none is implemented. When added, protect `/admin` routes server-side (session/JWT checked in middleware and route handlers). Never rely on hidden buttons or client-side passwords. `robots.ts` already disallows `/admin` and `/api/`.

## Building and deploying

```bash
npm run check    # typecheck + lint + production build
npm start        # serve the production build locally
```

The app is a standard Next.js app with no server-only requirements today, so it deploys to any Next-capable host. On **Vercel** or **Netlify**, import the repository, keep the default build command (`npm run build`), and set the environment variables above in the host dashboard. Set `NEXT_PUBLIC_SITE_URL` to the real domain so canonical URLs, the sitemap and Open Graph images are correct (WhatsApp/Instagram previews need absolute URLs).

Before launch, confirm with the client: the logo file in `public/brand/prism-logo.jpg` (a vector/transparent version would be ideal), the office city/state and phone number, WhatsApp number, Instagram URL, the three team profiles (names, designations, descriptions, photographs), and final Privacy Policy and Terms (the current pages are placeholders).

## Content integrity rules

This site must not publish unverified claims. Headquarters city/state, office address, phone number, registrations, certifications, client names, statistics, reviews and team identities stay empty or clearly labelled as placeholders until the client confirms them. See [CONTRIBUTING.md](CONTRIBUTING.md).

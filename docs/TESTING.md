# Testing: what was actually run, and what was not

Run everything: `npm run check` (types + lint + build), `npm test` (unit + database), and, with the production server running, `npm run security:check` and `npm run audit:links`.

## Executed and passing

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `next lint` | no warnings or errors |
| `next build` (production) | succeeds; all routes compile; the build works with an empty Supabase project (falls back to the built-in content) |
| `npm run db:test`: **73 tests** against the real migrations + seed in an in-process PostgreSQL (PGlite), Supabase's roles/grants stubbed: 30 security (`rls.test.mjs`) + 32 admin end-to-end (`admin-flow.test.mjs`) + 11 hardening (`hardening.test.mjs`) | all pass (below) |
| `npm run test:unit`: **23 tests** | all pass (below) |
| Secret scan | no service-role/secret key in the browser bundle or in git; `.env.local` is git-ignored |
| Browser (production build, then dev) | unauthenticated `/admin`, `/admin/enquiries` → sign-in; `/api/admin/session` → `{"admin":false}`; forged `/auth/callback?code=…` → rejected; sign-in form gives the neutral reply for a non-owner address; public site renders all sections incl. Reviews with no horizontal overflow at 390 px; star rating, mood face, live preview and burst work; review validation messages; a review submission reaches Supabase and shows a friendly error (tables not created yet); admin shell, forms, editor drawer with subcategories render; a save with no session is refused by the server ("Your session has expired"); the password form answers a wrong email/password with the one neutral message |

### Database security suite (what it proves)

- Only the owner is the owner: a stranger, an **unconfirmed account with the owner's address**, a **forged JWT email claim** and a **token for a user that does not exist** are all refused; anonymous callers cannot even call the check; `owner_lock` is unreadable and unwritable through the API (even by the owner).
- Public visitors see **only published** rows (services, subcategories of unpublished services, announcements that are disabled/expired, disabled social links); they cannot create, change or delete content or settings; a signed-in stranger has no more power than a visitor.
- Enquiries: visitors can submit but **cannot read** any; cannot choose status/id/timestamps; validation (email, length) lives in the database; a retried submission cannot create a duplicate; the **flood guard** stops the 41st enquiry in 10 minutes and never blocks the owner; the owner can read, set status, add notes, delete.
- Reviews: a visitor review can only arrive **pending** (cannot self-publish, feature, claim to be the owner, or rate outside 1–5), is invisible until the owner approves it, and then is public.
- Stored links can never be `javascript:`, `data:` or protocol-relative (`//host`, `/\host`); image paths cannot contain `..` or start with `/`.
- Storage: only the owner can write to `site-media`; the bucket is public-read, 5 MB, image types only, **no SVG**.
- Every public table has RLS enabled; the seed loads 7 services / 36 subcategories / 6 industries / 5 values / 8 reasons / 5 stages / 10 FAQs / 3 empty team slots and **no reviews or testimonials**; it is idempotent.

### Unit suite (what it proves)

Owner password rules, server-side form validation (trim/control characters, required/length, URL schemes, image paths, lines/paragraphs, numbers, selects, multi-selects, dates, email/phone/digits/slug, pairs; every admin module's definition is internally consistent), the public review and enquiry validators (honeypot, minimum fill time, rating, lengths), the database→website **mapper** (numbering, derived groups, industry `fits` filtering, subcategories, FAQ topics, WhatsApp digits, Instagram toggle, theme/logo, hidden sections, expired announcements), and the **announcement rules** (schedule window, once per visitor/session/every visit, dismissal, "edited = new", highest priority only).

## NOT tested (be clear about these)

| Not tested | Why / what to do |
| --- | --- |
| **A real sign-in (password or email link) as the owner** | Needs the owner user and a password only you know; the code never handles it. Only the failure path (wrong credentials) was exercised. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) §6. |
| **Every admin create / edit / delete through the real browser against the hosted database** | I cannot hold the owner session. The SQL, validation, field-to-column mapping and public result of every module are tested (see Final audit), and one real save is proven by the live data, but the click-through of each module on the hosted project is yours to run (smoke test below). |
| **Image upload to hosted Storage** | Needs the owner session and the bucket created by migration 04. The sniffing/validation logic and the policies are tested; the upload itself is not. |
| **RLS on hosted Supabase itself** | Tested on real PostgreSQL via PGlite with Supabase's grants emulated. Supabase-specific objects (`auth.users`, `auth.uid()`, `storage.objects`) are stubs. Re-run a smoke test on the hosted project after migrating. |
| **Enquiry submission saved to the hosted database** | Tables did not exist when tested (the failure path was verified). After running the SQL, submit a test enquiry and a test review. |
| **Real-device and real-60fps performance** | The browser pane renders about 1 frame per second; animations were checked in their final states. No Lighthouse or device-lab run. |
| **Session expiry over time, MFA, CAPTCHA, CSP, shared-store rate limiting, email notifications** | Not built / not claimed. See [ARCHITECTURE.md](ARCHITECTURE.md#left-for-the-audit). |
| **Server-rendered admin pages that need live data** (Overview, Enquiries list and detail, Admin Settings) at phone/tablet width | They need the owner session, so they were reviewed in code (wrapping rows, collapsing grids) but not rendered. The shared list, editor drawer and forms were rendered and measured. |

## How to smoke-test after setup (10 minutes)

1. Sign in; the Overview loads and shows your numbers.
2. Contact & Social → set a phone number → reload the public site; it appears.
3. Services → add a service → it appears (and its animation stage works); hide it → it disappears.
4. Public site → send a test enquiry and a test review → both appear in the admin (the review under *Pending*); approve the review → it appears on the site.
5. Announcements → create one, enable it, open the site in a private window → it appears once.
6. Media → upload a PNG → use it as a team photo → try deleting it (refused while in use).
7. Sign out → `/admin` redirects to sign-in. In a private window, `/admin/enquiries` redirects to sign-in.

## Final audit (this round)

**Admin ↔ database end to end (`supabase/tests/admin-flow.test.mjs`).** For every admin module the test takes the module's own form definitions, builds a valid submission, runs it through the real server-side validator, writes it with the same statements the Server Actions issue, as the owner, and checks: it is saved and reads back exactly; it is visible to visitors only while published/enabled; edit persists; hiding removes it from visitors but keeps it for the owner; re-ordering works; delete works; the change history records it. It also proves every form field is a real database column and every required column has a form field (so no module can fail on save), subcategories hide with an unpublished service and cascade on delete, duplicate web-address names are refused, every one-row form (all 17: page copy, mission & vision, contact, WhatsApp, Instagram, footer) saves and reads back, and the real public mapper turns the saved data into a complete page.

**Server Actions.** A static test asserts every exported admin action verifies the owner before touching data, public actions can only use the anonymous client, no file references a privileged key, and raw HTML is rendered only in the three audited places (escaped JSON-LD and the fixed theme script).

**Live security probes against your hosted project** (read-only except the attempts that must fail): signed out, all 18 admin routes redirect to sign-in; forged sign-in callbacks (even with a hostile `next`) are rejected; the session endpoint answers `{"admin":false}`; an anonymous visitor cannot upload to, list or delete from the bucket (RLS violation / empty list), cannot publish or feature their own review, set an enquiry's status, write the media register, delete a service, edit settings, or read pending reviews; no privileged key is in the browser bundle.

**Live forms.** One labelled test enquiry and one labelled test review were submitted through the real forms and saved (the review stays pending and invisible). Both rows are marked "QA TEST": delete them in Admin → Enquiries / Testimonials.

**Browser checks (production build).** Fresh-visitor load with an empty cache: no console output at all on `/` and `/privacy`; theme switcher (Light/Dark/Adaptive: attribute and saved choice change, page nodes are not re-created, the temporary animation spike of the circular reveal returns to baseline); FAQ open/close and topic filters; services stage; industries tabs; WhatsApp panel and link (uses the number saved in the admin); mobile menu (links, closes on navigation and on Escape); contact form validation and a successful save; review composer (arrow-key rating, live preview, validation, save); the announcement pop-up with a sample announcement (opens, labelled, focus moves in, Tab is trapped, Escape closes and page scrolling is restored; the "no close button" variant ignores Escape and closes itself after about 12 s; an external button link opens in a new tab with `rel="noopener noreferrer"`).

**Responsive.** Public site: measured at 320, 375, 390, 768, 1024 and 1440 px: no horizontal page overflow at any width. Admin (rendered with sample data): measured at 375, 768 and 1280 px: no page overflow, the editor drawer fits and has no inner horizontal scroll, and a real defect was found and fixed (list-row titles were squeezed to 7 px at phone width).

**Animation hygiene.** Every file that creates GSAP timelines or ScrollTriggers also reverts/kills them on cleanup; reduced-motion is honoured across the hero, scenes, preloader, reviews and announcements.

### Real evidence from the hosted project

The hosted database shows the owner has already signed in and saved settings through the admin panel (`site_settings.updated_by` is the owner's email and the WhatsApp number was written by the admin and now drives every WhatsApp link). That proves sign-in, a save, the database write and the public display work together on the hosted project at least once. It is not a substitute for the smoke test below.

## Final hardening round

| Check | Result |
| --- | --- |
| `npm audit --omit=dev` | **0 vulnerabilities** (Next's nested PostCSS fixed with an `overrides` entry; verified with a clean build) |
| `npm audit` (all) | 6 moderate, **dev-only** (lint toolchain, `minimatch`); the automatic fix breaks the linter, so it was not applied. Never shipped |
| `npm run security:check` against the running production build and your hosted Supabase project (visitor's-eye attacks, 38 checks) | 36 pass; **2 fail until migration 06 is applied to the hosted project** (they correctly detect that `site_settings.updated_by` is still publicly readable and that the new subcategory function does not exist yet). HSTS check skipped on http://localhost |
| Hardening tests (inventory of executable functions: visitors can run none; signed-in users only the four intended; exactly four SECURITY DEFINER functions, each with a pinned search_path; atomic all-or-nothing subcategory save; mass-assignment attempts; no administrator-identity column readable by visitors) | 11 / 11 pass |
| Unit tests added: error screens leak nothing, JSON-LD escaping, `rel=noopener` on every new-tab link, unknown form fields dropped, hostile text stays text, production CSP content | pass |
| Browser, production build, strict CSP + HSTS + frame protection: fresh load, theme switcher, review composer, WhatsApp panel, FAQ, sign-in failure message, branded 404 | no CSP violation, no console output, all interactions work |
| Responsive, real viewport emulation, home page: 320, 375, 390, 768, 1024, 1280, 1440, **1920** px; sign-in, privacy and 404 pages at 320 px | no horizontal overflow anywhere |
| Admin panel at 375 / 768 / 1280 px (previous round, sample data; the new frame protection blocks the iframe method, so the admin was **not re-rendered** this round) | no overflow, drawers fit |

### Still NOT tested (needs you)

- **Owner sign-in, session expiry and sign-out with the real account.** I never use the owner's credentials. Do the smoke test below.
- **Password reset / sign-in link e-mail delivery** (depends on the Supabase mail configuration).
- **Migration 06 on the hosted project** (see [DEPLOYMENT.md](DEPLOYMENT.md)); after applying, re-run `npm run security:check`: it must show 0 failures.
- **Real-device performance**, a staging deployment, and HSTS over real HTTPS.
- **Image upload through the browser to hosted Storage** with the owner session.

### The two QA records from the previous audit

Created through the public forms and **not deletable without the owner session**. Identify them precisely before deleting:

- Enquiry: name `QA Tester`, company `QA TEST`, e-mail `qa-test@example.com`, message begins `QA TEST ENQUIRY from the automated site audit`.
- Review (status Pending): name `QA TEST`, company `Site audit`, text begins `QA TEST REVIEW from the automated site audit`.

Delete them in Admin → Enquiries and Admin → Testimonials. Do not delete anything else.

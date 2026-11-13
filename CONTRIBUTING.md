# Contributing

Thanks for working on the Prism Solutions website. This guide covers the day-to-day workflow; architecture and conventions are in [README.md](README.md).

## Workflow

1. Create a branch from `main`: `feature/<short-name>` or `fix/<short-name>`.
2. Make focused changes. Keep components small; extract when a file grows unwieldy.
3. Run `npm run check` (typecheck + lint + production build) **and** `npm test` (unit + database security suites). Both must pass.
4. Open a pull request into `main` describing what changed and, for visual changes, include screenshots at desktop and mobile widths in both themes.

Use clear, imperative commit messages (`Add testimonials admin types`, `Fix mobile menu focus trap`).

## Before you open a PR

- [ ] `npm run typecheck`, `npm run lint`, `npm run build` and `npm test` pass.
- [ ] Any database change is a **new** migration (never edit an applied one), keeps Row Level Security on, grants explicitly, and has a case in `supabase/tests/rls.test.mjs`.
- [ ] Checked at ~390px, ~768px and ≥1280px in **all three themes** (Light, Dark, Prism Adaptive); no horizontal overflow; pinned sections fit the viewport.
- [ ] Keyboard-only navigation still works; focus is visible.
- [ ] Animations respect `prefers-reduced-motion` and clean up (`gsap.context(...).revert()`, killed ScrollTriggers).
- [ ] No `console.log`/debug code, no unused files or dependencies.
- [ ] No secrets or personal data committed. `.env*` files stay local; only `.env.example` (placeholder names) is tracked.

## Content rules (non-negotiable)

The company portfolio (`docs/`, kept locally) is the source of truth. Use its wording and its US spelling (organization, optimization, inquiry). Check new copy against it before committing.

Do not add invented clients, testimonials, statistics, certifications, office locations or contact details. Unconfirmed information stays empty in the admin (Contact & Social, Team…) and renders as a clear placeholder. Reviews are never seeded: they come only from real visitors and are approved by the owner.

## Adding things

- **A new homepage section:** create `src/components/sections/<name>/<Name>.tsx` (read data with `useContent()` in a client component, or `await getSiteContent()` in a server one), export it from `sections/index.ts`, place it in `src/app/(site)/page.tsx`, and make its content editable (new migration + an entry in `src/admin/registry.ts` + the mapper in `src/lib/content/map.ts`; see [docs/DATABASE.md](docs/DATABASE.md)). Give the root `<section>` an `id` if it needs a nav anchor, and spread `{...adaptiveProps("<key>")}` on it after adding the key and its tone (with a one-line reason) to `src/config/adaptive.ts`, so it takes part in Prism Adaptive.
- **A new service or industry:** use the admin panel (Services / Industries). A service with no hand-drawn illustration automatically gets rings plus the icon chosen in the admin; a bespoke drawing can be added to `sections/services/ServiceGlyph.tsx`, keyed by the service slug. The files in `src/content/` are only the starter content and offline fallback.
- **A new environment variable:** add it to `.env.example` and the README table. Anything an owner should control belongs in the admin (a column in `site_settings`), not in an environment variable.
- **A new animation:** prefer the shared data attributes handled by `MotionRoot`. For bespoke choreography use `registerGsap()` inside `gsap.context` and clean up on unmount.

## Security

- Never commit real credentials. If a secret is committed by mistake, rotate it immediately — deleting it from a later commit is not enough.
- Anything prefixed `NEXT_PUBLIC_` is visible to every visitor.
- Admin functionality is protected by real server-side authorisation **and** database Row Level Security. Every new Server Action must call `authorise()` first and write with the owner's session (`createServerSupabase()`); never use or add a service-role key. Never rely on a hidden button or a client-side check. See [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md).
- Anything that renders owner- or visitor-written text must render it as text (React escapes it). Never use `dangerouslySetInnerHTML` for such content; JSON-LD is escaped (`<` → `\u003c`).

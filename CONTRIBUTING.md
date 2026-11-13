# Contributing

Thanks for working on the Prism Solutions website. This guide covers the day-to-day workflow; architecture and conventions are in [README.md](README.md).

## Workflow

1. Create a branch from `main`: `feature/<short-name>` or `fix/<short-name>`.
2. Make focused changes. Keep components small; extract when a file grows unwieldy.
3. Run `npm run check` (typecheck + lint + production build). It must pass.
4. Open a pull request into `main` describing what changed and, for visual changes, include screenshots at desktop and mobile widths in both themes.

Use clear, imperative commit messages (`Add testimonials admin types`, `Fix mobile menu focus trap`).

## Before you open a PR

- [ ] `npm run typecheck`, `npm run lint` and `npm run build` pass.
- [ ] Checked at ~390px, ~768px and ≥1280px in **all three themes** (Light, Dark, Prism Adaptive); no horizontal overflow; pinned sections fit the viewport.
- [ ] Keyboard-only navigation still works; focus is visible.
- [ ] Animations respect `prefers-reduced-motion` and clean up (`gsap.context(...).revert()`, killed ScrollTriggers).
- [ ] No `console.log`/debug code, no unused files or dependencies.
- [ ] No secrets or personal data committed. `.env*` files stay local; only `.env.example` (placeholder names) is tracked.

## Content rules (non-negotiable)

The company portfolio (`docs/`, kept locally) is the source of truth. Use its wording and its US spelling (organization, optimization, inquiry). Check new copy against it before committing.

Do not add invented clients, testimonials, statistics, certifications, office locations or contact details. Unconfirmed information stays configurable (environment variables or `src/content`) and renders as a clear placeholder.

## Adding things

- **A new homepage section:** create `src/components/sections/<name>/<Name>.tsx`, export it from `sections/index.ts`, add its copy to `src/content/<name>.ts` and types to `src/types`, then place it in `src/app/page.tsx`. Give the root `<section>` an `id` if it needs a nav anchor, and spread `{...adaptiveProps("<key>")}` on it after adding the key and its tone (with a one-line reason) to `src/config/adaptive.ts`, so it takes part in Prism Adaptive.
- **A new service or industry:** edit `src/content/services.ts` or `industries.ts`. Services also need a drawing in `sections/services/ServiceGlyph.tsx` (keyed by service `id`).
- **A new environment variable:** add it to `src/config/site.ts`, `.env.example` and the README table.
- **A new animation:** prefer the shared data attributes handled by `MotionRoot`. For bespoke choreography use `registerGsap()` inside `gsap.context` and clean up on unmount.

## Security

- Never commit real credentials. If a secret is committed by mistake, rotate it immediately — deleting it from a later commit is not enough.
- Anything prefixed `NEXT_PUBLIC_` is visible to every visitor.
- Admin functionality must be protected by real server-side authentication; do not add hidden routes or front-end-only passwords.

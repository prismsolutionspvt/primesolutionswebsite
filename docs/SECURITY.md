# Security overview

Honest scope: this describes the controls that exist and how each was verified. No website is "100% secure"; the list of what is **not** covered is at the end. Report problems to the project owner, not publicly.

## Who can do what

| Actor | Can | Cannot |
| --- | --- | --- |
| Visitor | read published content; submit **one pending review** and **one new enquiry** (rate-limited) | read enquiries, reviews that are pending/rejected, drafts, settings columns that identify an administrator, the admin area, the image bucket's file list; publish, feature, edit or delete anything; upload files |
| Any other signed-in account | exactly the same as a visitor | sign-ups are disabled, and the database ignores everyone except the owner |
| The owner (one address) | everything in the admin | change the owner lock through the API (only the Supabase project holder can, in SQL) |

## Layers (a request must pass all of them)

1. **Edge:** `src/middleware.ts` sends signed-out visitors away from `/admin/*`, refreshes the session, marks admin responses `no-store` and `noindex`.
2. **Server pages and actions:** every admin page calls `requireAdmin()`; every admin Server Action calls `authorise()`/`guard()` **before** touching data (a unit test enforces this for every exported action). Public actions can only use the anonymous client (also tested).
3. **Validation:** form definitions in `src/admin/fields.ts` are validated again on the server (`src/admin/parse.ts`: trimming, control characters, lengths, URL schemes, image paths, whitelisted options). Unknown fields are dropped (no mass assignment). Public forms use Zod plus a honeypot, a minimum fill time, an idempotency token and rate limits.
4. **Database (the decisive layer):** Row Level Security on every table; `public.is_owner()` decides who is the owner from `auth.users` + the locked address; visitors get column-level `INSERT` grants only; CHECK constraints cap lengths and forbid `javascript:` / `//host` links and `..` paths; a flood-guard trigger limits scripted inserts. Every function visitors could reach is denied (a test lists them).
5. **Storage:** the bucket is public-read for known URLs only, no listing, owner-only writes, 5 MB, image types only, **no SVG**; the app also reads the file's real type from its first bytes.

## Browser protections (`next.config.mjs`)

Content-Security-Policy built from what the app really loads (self-hosted fonts, own scripts, the Supabase origin; no wildcards; no `eval` in production; nothing may frame the site; no plugins; no foreign `<base>` or form targets), `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Strict-Transport-Security` (production only, no `includeSubDomains`/`preload`). **Known trade-off:** `script-src` contains `'unsafe-inline'` because Next.js and the tiny theme/preloader boot script are inline and there is no per-request nonce; a nonce would force every page to be rendered per request and remove caching. The risk this leaves is limited because no raw HTML from stored content is ever rendered (see below).

## Rendering of stored and visitor text

React escapes all strings. The only raw-HTML sinks are the theme boot script (a fixed string with a value limited to `light|dark|adaptive` by a database CHECK and the mapper) and two JSON-LD blocks whose `<` is escaped. A unit test fails if any other file uses `dangerouslySetInnerHTML`. There is deliberately no rich-text editor.

## Secrets

Only the public Supabase URL and the **publishable** key are used, and only as `NEXT_PUBLIC_*`. No service-role/secret key exists in the code, the bundle or git (scanned: source, built JavaScript, tracked files). `.env*` is git-ignored; `.env.example` lists names only. **If a Supabase secret key was ever pasted anywhere, rotate it.**

## Findings and fixes from the audits

| # | Finding | Severity | Status |
| - | ------- | -------- | ------ |
| 1 | `//evil.com` accepted as a "site link" in validators and the database | Medium | Fixed (code + `safe_url` domain), tested |
| 2 | `site_settings.updated_by` (an administrator's e-mail) readable by visitors | Low–Medium | Fixed in migration 06 (column removed from public grants, value cleared). **Live project: apply migration 06** |
| 3 | Trigger helper functions executable by API roles | Low | Fixed in migration 06 |
| 4 | Subcategory save not atomic (a failure left a half-saved list) | Medium (data integrity) | Fixed: one database call, all-or-nothing (migration 06). **Live project: apply migration 06** |
| 5 | `reorder_rows` ran as SECURITY DEFINER | Low | Now SECURITY INVOKER |
| 6 | Missing CSP/HSTS/COOP, `X-Frame-Options: SAMEORIGIN` | Medium | Fixed |
| 7 | Next's nested PostCSS 8.4.31 (2 advisories) | High (build-time tool) | Fixed with an `overrides` entry; `npm audit --omit=dev` = 0 |
| 8 | Logo preloaded on pages that never show it | Info | Fixed |
| 9 | Site address fell back to `https://example.com` | Medium (wrong canonical URLs) | Fixed: env → host variable → local |
| 10 | No branded 404/error/loading screens | Low | Added; no technical detail shown |

## Not covered / accepted risks

No multi-factor authentication; no CAPTCHA on the sign-in or public forms (honeypot + rate limits only); rate limiting is per server instance (the database flood guard is global); `script-src 'unsafe-inline'` (above); six moderate advisories in the **dev-only** lint toolchain (`minimatch` via `typescript-eslint`) remain because the automatic fix downgrades the linter to a version incompatible with ESLint 9 (they never ship to production); the Supabase project's own configuration (backups, MFA, SMTP, leaked-password protection, network restrictions) is outside this repository; no penetration test by a third party; sign-in e-mail delivery depends on Supabase mail settings.

## Re-running the checks

```bash
npm test                      # 32 unit + 73 database tests
npm run build && npm start    # then, in another terminal:
npm run security:check        # visitor-eye attacks on the running site and your Supabase project (all must be refused)
npm run audit:links           # every link and button
npm audit --omit=dev          # dependency advisories (production)
```

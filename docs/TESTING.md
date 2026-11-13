# Testing: what was actually run, and what was not

Run everything: `npm run check` (types + lint + build) and `npm test` (unit + database security).

## Executed and passing

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `next lint` | no warnings or errors |
| `next build` (production) | succeeds; all routes compile; the build works with an empty Supabase project (falls back to the built-in content) |
| `npm run db:test`: **30 tests**, run against the real migrations + seed in an in-process PostgreSQL (PGlite) with Supabase's roles/grants stubbed | all pass (below) |
| `npm run test:unit`: **22 tests** | all pass (below) |
| Secret scan | no service-role/secret key in the browser bundle or in git; `.env.local` is git-ignored |
| Browser (production build, then dev) | unauthenticated `/admin`, `/admin/enquiries` → sign-in; `/api/admin/session` → `{"admin":false}`; forged `/auth/callback?code=…` → rejected; sign-in form gives the neutral reply for a non-owner address; public site renders all sections incl. Reviews with no horizontal overflow at 390 px; star rating, mood face, live preview and burst work; review validation messages; a review submission reaches Supabase and shows a friendly error (tables not created yet); admin shell, forms, editor drawer with subcategories render; a save with no session is refused by the server ("Your session has expired") |

### Database security suite (what it proves)

- Only the owner is the owner: a stranger, an **unconfirmed account with the owner's address**, a **forged JWT email claim** and a **token for a user that does not exist** are all refused; anonymous callers cannot even call the check; `owner_lock` is unreadable and unwritable through the API (even by the owner).
- Public visitors see **only published** rows (services, subcategories of unpublished services, announcements that are disabled/expired, disabled social links); they cannot create, change or delete content or settings; a signed-in stranger has no more power than a visitor.
- Enquiries: visitors can submit but **cannot read** any; cannot choose status/id/timestamps; validation (email, length) lives in the database; a retried submission cannot create a duplicate; the **flood guard** stops the 41st enquiry in 10 minutes and never blocks the owner; the owner can read, set status, add notes, delete.
- Reviews: a visitor review can only arrive **pending** (cannot self-publish, feature, claim to be the owner, or rate outside 1–5), is invisible until the owner approves it, and then is public.
- Stored links can never be `javascript:`, `data:` or protocol-relative (`//host`, `/\host`); image paths cannot contain `..` or start with `/`.
- Storage: only the owner can write to `site-media`; the bucket is public-read, 5 MB, image types only, **no SVG**.
- Every public table has RLS enabled; the seed loads 7 services / 36 subcategories / 6 industries / 5 values / 8 reasons / 5 stages / 10 FAQs / 3 empty team slots and **no reviews or testimonials**; it is idempotent.

### Unit suite (what it proves)

Server-side form validation (trim/control characters, required/length, URL schemes, image paths, lines/paragraphs, numbers, selects, multi-selects, dates, email/phone/digits/slug, pairs; every admin module's definition is internally consistent), the public review and enquiry validators (honeypot, minimum fill time, rating, lengths), the database→website **mapper** (numbering, derived groups, industry `fits` filtering, subcategories, FAQ topics, WhatsApp digits, Instagram toggle, theme/logo, hidden sections, expired announcements), and the **announcement rules** (schedule window, once per visitor/session/every visit, dismissal, "edited = new", highest priority only).

## NOT tested (be clear about these)

| Not tested | Why / what to do |
| --- | --- |
| **The real sign-in email and link on your Supabase project** | The owner user does not exist yet and a link email must reach your inbox. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) §6, then tell me what you see. |
| **Admin create / edit / delete against the hosted database** | Needs the owner session. The same code paths are covered only indirectly: the SQL by the Postgres suite, the validation by unit tests, the UI by the visual harness. A first real run is required. |
| **Image upload to hosted Storage** | Needs the owner session and the bucket created by migration 04. The sniffing/validation logic and the policies are tested; the upload itself is not. |
| **RLS on hosted Supabase itself** | Tested on real PostgreSQL via PGlite with Supabase's grants emulated. Supabase-specific objects (`auth.users`, `auth.uid()`, `storage.objects`) are stubs. Re-run a smoke test on the hosted project after migrating. |
| **Enquiry submission saved to the hosted database** | Tables did not exist when tested (the failure path was verified). After running the SQL, submit a test enquiry and a test review. |
| **Real-device and real-60fps performance** | The browser pane renders about 1 frame per second; animations were checked in their final states. No Lighthouse or device-lab run. |
| **Session expiry over time, MFA, CAPTCHA, CSP, shared-store rate limiting, email notifications** | Not built / not claimed. See [ARCHITECTURE.md](ARCHITECTURE.md#left-for-the-audit). |
| **Tablet layout of the admin panel** | Desktop and a 390 px phone width were inspected for the public site; the admin was inspected at desktop width only. |

## How to smoke-test after setup (10 minutes)

1. Sign in; the Overview loads and shows your numbers.
2. Contact & Social → set a phone number → reload the public site; it appears.
3. Services → add a service → it appears (and its animation stage works); hide it → it disappears.
4. Public site → send a test enquiry and a test review → both appear in the admin (the review under *Pending*); approve the review → it appears on the site.
5. Announcements → create one, enable it, open the site in a private window → it appears once.
6. Media → upload a PNG → use it as a team photo → try deleting it (refused while in use).
7. Sign out → `/admin` redirects to sign-in. In a private window, `/admin/enquiries` redirects to sign-in.

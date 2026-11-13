# Authentication: the one-owner lock

Only **prismsolutions.pvt@gmail.com** can manage the website. There are no other roles, no registration and no passwords in the code.

## How a sign-in works

1. The owner opens `/admin` (it is not linked anywhere public) and enters their email.
2. The server action (`src/admin/actions/auth.ts`) sends a **one-time sign-in link** with Supabase Auth, **only** if the address equals the owner's (`src/config/owner.ts`), and never creates a user. The page shows the *same* message whether or not the address is the owner's, so it cannot be used to find out who is authorised. It is rate-limited per visitor and per address.
3. The owner opens the link **in the same browser**. `/auth/callback` exchanges it for a session (PKCE).
4. The callback then asks the **database** whether this session is the owner. If not, it signs the session straight out. Only a verified owner is sent to `/admin`.

## The locks (all must hold; the last one cannot be bypassed from the app)

| # | Lock | Where |
| - | ---- | ----- |
| 1 | Sign-ups are OFF in Supabase, and the owner user is added by hand, so no other address can receive a link. | Supabase dashboard |
| 2 | The sign-in form only sends to the owner's address. | `actions/auth.ts` |
| 3 | `/admin/*` redirects to sign-in without a verified session (the token is validated by Supabase Auth, never trusted from the cookie). | `src/middleware.ts` |
| 4 | Every admin page and every Server Action re-checks the owner on the server. | `lib/auth/admin.ts` (`getAdmin`, `requireAdmin`, `authorise`) |
| 5 | **The database decides.** `public.is_owner()` is true only if the session's auth user exists with a *confirmed* email equal to the single address in `public.owner_lock`. Every Row Level Security and Storage policy calls it. | `supabase/migrations/…0100_core_auth.sql` |

Why lock 5 matters: the publishable key is public by design, so anyone can call the database API directly. The app's checks protect the *pages*; lock 5 protects the *data*. A stranger who signs in, forges a token claiming the owner's email, or calls the REST API directly gets nothing. Each of these is a test in `supabase/tests/rls.test.mjs`.

`public.owner_lock` has **no policies and no privileges**: not even the owner can read or change it through the API. The address is set by the migration `…0500_owner_bootstrap.sql`.

## The admin button on the public site

`AdminEntry` renders nothing unless a Supabase cookie exists in the browser, and then only after `/api/admin/session` (server-side check) answers `{"admin":true}`. That is a convenience; it exposes no data and grants nothing.

## Changing the owner

Only the person who controls the Supabase project can do this, in the SQL editor:

```sql
update public.owner_lock set email = 'new.owner@example.com' where id = 1;
```

Then add that user in **Authentication → Users**, and update `ADMIN_OWNER_EMAIL` (or `src/config/owner.ts`). Sign the old owner's user out/delete it in the dashboard.

## Future roles

Every policy goes through the single function `public.is_owner()`, so Administrator / Content Manager roles can be added later by replacing the `owner_lock` row with a small allow-list table and widening that one function (plus a role column for finer rules). This was deliberately **not** built now: the requirement is a lock on one email.

## Threat notes

- **Passwords.** The owner user may have a password because the dashboard asks for one. If it leaks, someone could sign in with it through the API, because the database checks *who* the user is, not *how* they signed in. Use a long random password you never keep, or use **Add user → Send invitation** instead. Do not reuse a password.
- **Same-browser links.** Links created with PKCE only work in the browser that requested them. This is a security feature.
- **Mail delivery** is a Supabase matter; see [SUPABASE_SETUP.md](SUPABASE_SETUP.md#4-make-sure-the-sign-in-email-can-actually-be-delivered).
- **Session expiry** is handled by Supabase (refresh tokens) and by the middleware refreshing on each admin request; an expired session sends the owner back to sign-in, and a Server Action returns "Your session has expired".
- **Not yet done** (reserved for the dedicated security audit): MFA, CAPTCHA on the sign-in form, a Content-Security-Policy, shared-store rate limiting, audit-log retention.

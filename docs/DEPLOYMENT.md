# Deployment and handover

**Scope boundary.** FRX Technologies builds and prepares the website. Buying the domain, owning the registrar account and managing **DNS** belong to the client (or their domain manager). Nothing in this repository changes DNS, and **the site has not been deployed to the client's domain**. This page says exactly what each party must do.

## What the code already handles

- The production build succeeds (`npm run check`).
- No code change is needed to set the production address: it comes from `NEXT_PUBLIC_SITE_URL`, else `URL` (Netlify) or `VERCEL_PROJECT_PRODUCTION_URL`, else `http://localhost:5200` for local work. Canonical links, the sitemap, `robots.txt` and Open Graph use it.
- The only hard-coded origins in `src/` are the FRX credit default and the WhatsApp/`wa.me` link format. No localhost URL is used in production-critical code.
- Sign-in e-mail links and the OAuth-style callback use the **request's own origin**, so they work on whatever domain serves the site, provided Supabase allows that domain (below).

## Hosting requirements

A host that runs Next.js 15 **with Server Actions and middleware**: Vercel, Netlify (with its Next.js runtime), or any Node 20+ server running `npm run build && npm start`. Plain static or shared PHP hosting **will not work** (the admin, forms and sign-in need a server).

## FRX checklist (before handing over)

1. **Apply every migration** in `supabase/migrations/` to the production Supabase project, in order, then `supabase/seed.sql` once (`npm run db:bundle` creates one file for a **new** project; for an existing project run only the migrations it has not had, currently `20261114000100_hardening.sql`). **Apply migration 06 before deploying this version of the code**: saving a service's subcategories calls a function that migration creates.
2. Supabase → Authentication → Sign In / Providers: **"Allow new users to sign up" OFF**; the Email provider ON; no other provider.
3. Supabase → Authentication → Users: the owner user exists, e-mail confirmed.
4. Supabase → Authentication → Emails → SMTP: connect a sender so sign-in/reset e-mails reach the owner (the built-in sender only delivers to members of your Supabase organization and is rate-limited).
5. Hosting environment variables (copy names from `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (the final `https://…` address), optional `ADMIN_OWNER_EMAIL`. **Never** set a service-role/secret key.
6. Deploy to the host's own URL first (a staging address) and run `npm run security:check https://<staging-address>` and `npm run audit:links https://<staging-address>`; all must pass.
7. Sign in as the owner on staging and run the smoke test in [TESTING.md](TESTING.md).
8. Delete the two QA test records (see TESTING.md) if they still exist.
9. Confirm the owner has set a strong password (Admin → Admin Settings → Password).

## Client / domain-manager checklist (after the domain is bought)

1. Point the domain at the host using the hosting provider's DNS instructions (the host shows the exact records). FRX does not touch DNS.
2. Tell FRX the final address (for example `https://www.example.com`), or set `NEXT_PUBLIC_SITE_URL` on the host and redeploy.
3. In Supabase → Authentication → URL Configuration: set **Site URL** to the final address and add `https://<final-address>/auth/callback` to **Redirect URLs** (keep the staging address too if wanted).
4. Make sure HTTPS is active (hosts provide certificates automatically); the site then sends HSTS.
5. Provide or approve the final **Privacy Policy** and **Terms** text. The current pages are placeholders and are not legally approved.
6. Enter the phone number, WhatsApp number, Instagram link and the team's real names and photographs in the admin (nothing is shown until entered).

## Server Actions behind a proxy

Next.js checks the `Origin` header of Server Actions against the site's host. If a reverse proxy or CDN rewrites the host, set `experimental.serverActions.allowedOrigins` in `next.config.mjs` to the public domain. Standard Vercel/Netlify deployments need nothing.

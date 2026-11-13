# Supabase setup: exactly what to do

Your project: `https://zlujppdxogexreebdppu.supabase.co`. The code is ready, but **nothing in the database exists until you run the SQL below**, and sign-in will not work until you add the owner user. Each step says where to click.

> At the time of writing the project was reachable and the publishable key valid, but it was empty (no tables) and email sign-ups were switched on. Both are fixed by the steps below.

## 1. Create the database (one time)

1. Run `npm run db:bundle`. It creates `supabase/_bundle.sql` (all 5 migrations + the starter content, in order).
2. Supabase dashboard → **SQL Editor → New query** → paste the whole file → **Run**.
   - It must finish without errors. If you run it twice it will stop with "already exists"; that is expected, do not re-run.
   - Prefer the CLI? `supabase link` then `supabase db push` runs the files in `supabase/migrations/`; then run `supabase/seed.sql` in the SQL editor.
3. Check **Table Editor**: you should see `site_settings`, `services` (7 rows), `faqs` (10 rows), `enquiries`, `testimonials`, and so on, each with the RLS shield on.
4. Check **Storage**: a public bucket named `site-media`.

What this created is described in [DATABASE.md](DATABASE.md) and [STORAGE.md](STORAGE.md).

## 2. Lock sign-ups and add the owner (one time)

1. **Authentication → Sign In / Providers → User Signups** → switch **Allow new users to sign up** **OFF**. (Keep the *Email* provider itself ON; the sign-in link uses it.)
2. **Authentication → Users → Add user**:
   - Email: `prismsolutions.pvt@gmail.com`
   - Tick **Auto Confirm User**.
   - It asks for a password: choose a long one (12+ characters, a short sentence of unrelated words works well) that you use nowhere else. This is the password you will sign in with. You can change it later in **Admin → Admin Settings → Password**. (See the note in [AUTH_SETUP.md](AUTH_SETUP.md#threat-notes).)
3. Do **not** enable Google or any other provider; they are not used.

## 3. Tell Supabase where the site lives

**Authentication → URL Configuration**

- **Site URL:** your production address (for now `http://localhost:5200`).
- **Redirect URLs** (add each):
  - `http://localhost:5200/auth/callback`
  - `https://YOUR-PRODUCTION-DOMAIN/auth/callback`

If a link in the email lands on a different address than these, Supabase refuses to redirect and sign-in fails.

## 4. Make sure the sign-in email can actually be delivered

Supabase's **built-in mail sender is for testing**. It is heavily rate-limited, and **it only delivers to addresses that belong to members of your Supabase organization**. So either:

- make sure `prismsolutions.pvt@gmail.com` is a member of the Supabase organization that owns this project (**Organization → Team → Invite**), or
- before launch, connect a real sender: **Authentication → Emails → SMTP Settings** (any provider: Resend, SendGrid, Postmark, Google Workspace…).

Without one of these, the link email may never arrive. That is a Supabase limitation, not a bug in the site.

## 5. Environment variables

Local development: `.env.local` (already created, git-ignored) contains the URL and publishable key. For production set, in your host's dashboard:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zlujppdxogexreebdppu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the **publishable** key from **Project Settings → API Keys** |
| `NEXT_PUBLIC_SITE_URL` | your final site address |
| `ADMIN_OWNER_EMAIL` | optional; only if the owner address ever changes |

**Never** add a service-role / secret key. The app does not use one and does not need one. If you ever paste one into the browser-visible `NEXT_PUBLIC_` variables, rotate it immediately.

## 6. Check it works

1. `npm run dev`, open `http://localhost:5200/admin`. You are sent to the sign-in page.
2. Enter `prismsolutions.pvt@gmail.com` and your password → you land in the dashboard. (Forgot it? Choose "Email me a sign-in link" and open the link **in the same browser**.)
3. The home page now shows a small **Admin panel** button in the header (only for you).
4. Edit anything (for example the phone number in **Contact & Social**). Reload the public site: it changes at once.

## 7. After changing the database or the starter content

The public site caches content for 5 minutes. Every save in the admin clears that cache immediately. If you edit rows directly in the Supabase dashboard instead, either wait up to 5 minutes or save anything in the admin.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| The site shows the built-in text and the admin says "Built-in defaults" | The SQL has not been run, or `seed.sql` was skipped (`content_seeded` is false). |
| "Your session has expired" when saving | You are signed out, or signed in as someone who is not the owner. |
| The link email never arrives | Step 4: organization membership / SMTP; also check spam. |
| The link opens but you land back on the sign-in page | Opened in a different browser than where you requested it, or the redirect URL is missing (step 3). |
| Images do not appear | `next.config.mjs` reads `NEXT_PUBLIC_SUPABASE_URL` at build time: rebuild after setting it. |

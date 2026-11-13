-- ════════════════════════════════════════════════════════════════════════════
-- 05 · FIRST-TIME OWNER SETUP
--
-- This is the ONLY way the owner address is set: a trusted database migration, run by whoever holds the Supabase
-- project. There is no sign-up form, no API and no environment variable that can change it.
--
-- Two things must both be true for someone to administer the site:
--   1. a user with this e-mail exists in Supabase Auth (you add it by hand: Authentication → Users → Add user,
--      with "Auto Confirm User" ticked), and
--   2. they signed in with a one-time link sent to that address.
--
-- To hand the project to a different owner, edit the e-mail below BEFORE running this migration (or update the
-- single owner_lock row in the SQL editor later; it is deliberately not editable through the API).
-- ════════════════════════════════════════════════════════════════════════════

insert into public.owner_lock (id, email)
values (1, 'prismsolutions.pvt@gmail.com')
on conflict (id) do nothing;

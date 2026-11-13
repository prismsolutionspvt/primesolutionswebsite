/**
 * The e-mail address that is allowed to administer the website.
 *
 * IMPORTANT — what this value does and does not do:
 *  • It only decides to WHOM the sign-in page will send a one-time link (so strangers cannot make Supabase mail
 *    arbitrary addresses through our form).
 *  • It does NOT grant access. Access is decided by the DATABASE (public.owner_lock + public.is_owner(), which every
 *    Row Level Security policy uses). Keep this in sync with the address in supabase/migrations/…_owner_bootstrap.sql.
 *  • Override per environment with ADMIN_OWNER_EMAIL (server-side variable, not exposed to the browser).
 */
export const OWNER_EMAIL = (process.env.ADMIN_OWNER_EMAIL || "prismsolutions.pvt@gmail.com").trim().toLowerCase();

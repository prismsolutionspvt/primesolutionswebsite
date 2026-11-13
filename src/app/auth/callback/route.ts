import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAdmin } from "@/lib/auth/admin";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Landing point of the one-time e-mail link. Exchanges the link for a session, then asks the DATABASE whether that
 * session belongs to the locked owner. Any other session is signed straight back out, and the visitor is told nothing
 * about which address is authorised.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const fail = (reason: string) => NextResponse.redirect(`${origin}/admin/login?error=${reason}`);

  if (!rateLimit(`auth:${await clientKey()}`, 20, 60_000)) return fail("rate_limited");
  if (searchParams.get("error") || searchParams.get("error_code")) return fail("link_failed");

  const supabase = await createServerSupabase();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let error: unknown = null;
  if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code)); // PKCE: link opened in the same browser
  else if (tokenHash && type) ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })); // custom e-mail template
  else return fail("link_failed");
  if (error) return fail("link_failed");

  const admin = await getAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    return fail("link_failed");
  }
  // only same-site /admin destinations are honoured (no open redirect)
  const next = searchParams.get("next");
  const dest = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  return NextResponse.redirect(`${origin}${dest}`);
}

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * First gate for /admin/*: no verified session → sign-in page. This is defence in depth only — the real
 * authorisation (is this user an admin, and which role?) is enforced again in the admin layout, in every Server
 * Action, and by Row Level Security in the database.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLogin = path === "/admin/login";

  let response = NextResponse.next({ request });
  if (isSupabaseConfigured) {
    const { response: refreshed, user } = await updateSession(request);
    response = refreshed;
    if (!user && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  } else if (!isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };

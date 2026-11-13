import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseKey, supabaseUrl } from "./env";

/**
 * Server client bound to the CURRENT USER'S session cookies. Every query runs as that user, so Row Level Security
 * applies exactly as it would from the browser: the server never gains extra power.
 */
export async function createServerSupabase() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component: cookies are refreshed by the middleware instead
        }
      },
    },
  });
}

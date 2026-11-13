import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Every admin page passes through here: no verified owner session → the sign-in page (checked on the server, per request). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const sb = await createServerSupabase();
  const [enq, rev] = await Promise.all([
    sb.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    sb.from("testimonials").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return (
    <AdminProviders>
      <AdminShell email={admin.email} badges={{ enquiries: enq.count ?? 0, testimonials: rev.count ?? 0 }}>
        {children}
      </AdminShell>
    </AdminProviders>
  );
}

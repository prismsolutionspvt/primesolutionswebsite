import { Database, KeyRound, LogOut, MailCheck, ShieldCheck } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAdmin } from "@/lib/auth/admin";
import { getSiteContent } from "@/lib/content/fetch";
import { signOutAction } from "@/admin/actions/auth";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Admin Settings" };

export default async function SettingsPage() {
  const admin = await getAdmin();
  const sb = await createServerSupabase();
  const [content, seeded, media, log] = await Promise.all([
    getSiteContent(),
    sb.from("site_settings").select("content_seeded").eq("id", 1).maybeSingle(),
    sb.from("media_assets").select("*", { count: "exact", head: true }),
    sb.from("activity_log").select("id,at,table_name,action,label").order("at", { ascending: false }).limit(25),
  ]);

  return (
    <>
      <PageHeader eyebrow="Site" title="Admin Settings" description="How access to this panel works, and the health of your setup." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-bg p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold"><ShieldCheck className="h-5 w-5 text-accent-text" aria-hidden /> Who can sign in</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted">Signed in as</dt><dd className="font-semibold">{admin?.email}</dd></div>
            <div><dt className="text-muted">Role</dt><dd className="font-semibold">Owner</dd></div>
            <div><dt className="text-muted">Sign-in method</dt><dd className="font-semibold">One-time email link (no password)</dd></div>
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Only this one address can manage the website. The lock is enforced by the database itself, not only by this page, so no other account can read or change anything here, even if it signs in. To hand the site to someone else, the project owner changes the address in Supabase (see docs/AUTH_SETUP.md).
          </p>
          <form action={signOutAction} className="mt-5">
            <button type="submit" className="btn btn-ghost !min-h-[44px]"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button>
          </form>
        </section>

        <section className="rounded-3xl border border-line bg-bg p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold"><Database className="h-5 w-5 text-accent-text" aria-hidden /> Setup status</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start justify-between gap-3"><span>Website content source</span><b className={content.source === "database" ? "text-[#2F8071]" : "text-accent-text"}>{content.source === "database" ? "Your database" : "Built-in defaults"}</b></li>
            <li className="flex items-start justify-between gap-3"><span>Starter content loaded</span><b className={seeded.data?.content_seeded ? "text-[#2F8071]" : "text-accent-text"}>{seeded.data?.content_seeded ? "Yes" : "Not yet (run seed.sql)"}</b></li>
            <li className="flex items-start justify-between gap-3"><span>Images in the library</span><b>{media.count ?? 0}</b></li>
            <li className="flex items-start justify-between gap-3"><span>Enquiry email notifications</span><b className="text-muted">Not configured</b></li>
          </ul>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Enquiries are saved in the database and shown in Enquiries. They are not emailed to you until an email service is connected.
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-line bg-bg p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold"><KeyRound className="h-5 w-5 text-accent-text" aria-hidden /> Change history</h2>
        {log.data?.length ? (
          <ul className="divide-y divide-line text-sm">
            {log.data.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span><b>{a.table_name.replace(/_/g, " ")}</b> {({ insert: "added", update: "updated", delete: "deleted" } as Record<string, string>)[a.action] ?? a.action}{a.label ? <span className="text-muted"> · {a.label}</span> : null}</span>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">{new Date(a.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No changes recorded yet.</p>
        )}
      </section>
    </>
  );
}

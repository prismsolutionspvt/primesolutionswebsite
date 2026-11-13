import { AlertCircle, ArrowUpRight, CheckCircle2, Inbox, Layers, MessageSquareQuote, Megaphone, PlusCircle, UserPlus, Users2, HelpCircle, Pencil } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAdmin } from "@/lib/auth/admin";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusChip } from "@/components/admin/StatusChip";

export const metadata = { title: "Overview" };

const TABLE_LABEL: Record<string, string> = {
  services: "Service", service_subcategories: "Subcategory", industries: "Industry", team_members: "Team member", core_values: "Core value", why_prism_items: "Why Prism item",
  approach_steps: "Approach stage", faqs: "FAQ", announcements: "Announcement", testimonials: "Review", social_links: "Social link", site_settings: "Site settings",
  site_sections: "Page text", mission_vision: "Mission & vision", enquiries: "Enquiry", media_assets: "Image",
};
const VERB = { insert: "added", update: "updated", delete: "deleted" } as const;
const ago = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" });
};

export default async function Overview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  await searchParams;
  const admin = await getAdmin();
  const sb = await createServerSupabase();
  const count = async (table: string, f?: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
    const { count: n } = await (f ? f(base(table)) : base(table));
    return n ?? 0;
  };
  const base = (table: string) => sb.from(table).select("*", { count: "exact", head: true });

  const [total, isNew, followUp, resolved, reviews, pendingReviews, services, faqs, liveAnn, latest, activity, settings, emptyTeam] = await Promise.all([
    count("enquiries"),
    count("enquiries", (q) => q.eq("status", "new")),
    count("enquiries", (q) => q.in("status", ["contacted", "in_progress"])),
    count("enquiries", (q) => q.in("status", ["converted", "closed"])),
    count("testimonials", (q) => q.eq("status", "published")),
    count("testimonials", (q) => q.eq("status", "pending")),
    count("services", (q) => q.eq("is_published", true)),
    count("faqs", (q) => q.eq("is_published", true)),
    count("announcements", (q) => q.eq("is_enabled", true)),
    sb.from("enquiries").select("id,name,email,service,status,created_at").order("created_at", { ascending: false }).limit(5),
    sb.from("activity_log").select("id,at,table_name,action,label").order("at", { ascending: false }).limit(8),
    sb.from("site_settings").select("content_seeded,contact_phone,whatsapp_number,contact_email").eq("id", 1).maybeSingle(),
    count("team_members", (q) => q.eq("name", "")),
  ]);

  const s = settings.data;
  const todo: { text: string; href: string }[] = [];
  if (s && !s.content_seeded) todo.push({ text: "The starter content has not been loaded into the database yet, so the website is showing its built-in text. Run supabase/seed.sql once (see docs/SUPABASE_SETUP.md).", href: "/admin/settings" });
  if (pendingReviews) todo.push({ text: `${pendingReviews} review${pendingReviews > 1 ? "s are" : " is"} waiting for your approval.`, href: "/admin/testimonials" });
  if (isNew) todo.push({ text: `${isNew} new enquir${isNew > 1 ? "ies" : "y"} to read.`, href: "/admin/enquiries?status=new" });
  if (s && !s.contact_phone) todo.push({ text: "Add your business phone number so visitors can call you.", href: "/admin/contact" });
  if (s && !s.whatsapp_number) todo.push({ text: "Add your WhatsApp number so the WhatsApp button connects to you.", href: "/admin/contact" });
  if (emptyTeam) todo.push({ text: `${emptyTeam} team profile${emptyTeam > 1 ? "s are" : " is"} still empty. Add the real name, role and photo.`, href: "/admin/team" });

  const card = (href: string, label: string, value: number, hint: string, Icon: typeof Inbox, hot = false) => (
    <a key={label} href={href} className={`group relative overflow-hidden rounded-3xl border bg-bg p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${hot ? "border-accent/60" : "border-line hover:border-accent/50"}`}>
      <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/0 blur-2xl transition-colors duration-500 group-hover:bg-accent/25" />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-muted">{label}</span>
        <Icon className="h-4 w-4 text-accent-text" aria-hidden />
      </div>
      <p className="relative mt-3 font-display text-4xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="relative mt-1 text-xs text-muted">{hint}</p>
    </a>
  );

  return (
    <>
      <PageHeader eyebrow="Welcome" title="Overview" description={`Signed in as ${admin?.email}. Everything here is live data from your database.`} />

      {todo.length > 0 ? (
        <section aria-label="Needs attention" className="mb-8 rounded-3xl border border-accent/40 bg-accent/[0.07] p-5 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
            <AlertCircle className="h-5 w-5 text-accent-text" aria-hidden /> Needs your attention
          </h2>
          <ul className="space-y-2">
            {todo.map((t) => (
              <li key={t.text}>
                <a href={t.href} className="group flex items-start justify-between gap-3 rounded-xl px-3 py-2 text-[0.93rem] transition hover:bg-bg/70">
                  <span>{t.text}</span>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted transition group-hover:text-accent-text" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mb-8 flex items-center gap-2 rounded-2xl border border-line bg-bg px-5 py-4 text-sm text-muted">
          <CheckCircle2 className="h-5 w-5 text-[#2F8071]" aria-hidden /> Nothing needs your attention right now.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {card("/admin/enquiries", "Total enquiries", total, "All time", Inbox)}
        {card("/admin/enquiries?status=new", "New", isNew, "Not yet read", Inbox, isNew > 0)}
        {card("/admin/enquiries", "Pending follow-up", followUp, "Contacted or in progress", Inbox)}
        {card("/admin/enquiries", "Reviewed", resolved, "Converted or closed", Inbox)}
        {card("/admin/testimonials", "Published reviews", reviews, pendingReviews ? `${pendingReviews} awaiting approval` : "Approved by you", MessageSquareQuote, pendingReviews > 0)}
        {card("/admin/services", "Published services", services, "Visible on the website", Layers)}
        {card("/admin/faqs", "Published FAQs", faqs, "Visible on the website", HelpCircle)}
        {card("/admin/announcements", "Live announcements", liveAnn, "Currently enabled", Megaphone)}
      </div>

      <section className="mt-10" aria-label="Quick actions">
        <h2 className="mb-3 font-display text-xl font-semibold">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/services?new=1", label: "Add service", Icon: PlusCircle },
            { href: "/admin/team?new=1", label: "Add team member", Icon: UserPlus },
            { href: "/admin/announcements?new=1", label: "Add announcement", Icon: Megaphone },
            { href: "/admin/enquiries", label: "View enquiries", Icon: Inbox },
            { href: "/admin/company", label: "Edit website content", Icon: Pencil },
            { href: "/admin/media", label: "Upload images", Icon: Users2 },
          ].map(({ href, label, Icon }) => (
            <a key={label} href={href} className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-line bg-bg px-5 text-sm font-semibold transition hover:border-accent hover:shadow-md">
              <Icon className="h-4 w-4 text-accent-text" aria-hidden /> {label}
            </a>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-bg p-5 sm:p-6" aria-label="Latest enquiries">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Latest enquiries</h2>
            <a href="/admin/enquiries" className="link-u text-sm text-muted">View all</a>
          </div>
          {latest.data?.length ? (
            <ul className="divide-y divide-line">
              {latest.data.map((e) => (
                <li key={e.id}>
                  <a href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-3 py-3 transition hover:text-accent-text">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{e.name}</span>
                      <span className="block truncate text-sm text-muted">{e.service || e.email} · {ago(e.created_at)}</span>
                    </span>
                    <StatusChip status={e.status} />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">No enquiries yet. They will appear here as visitors write to you.</p>
          )}
        </section>

        <section className="rounded-3xl border border-line bg-bg p-5 sm:p-6" aria-label="Recent content updates">
          <h2 className="mb-4 font-display text-xl font-semibold">Recent content updates</h2>
          {activity.data?.length ? (
            <ul className="space-y-3">
              {activity.data.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{TABLE_LABEL[a.table_name] ?? a.table_name}</span> {VERB[a.action as keyof typeof VERB]}
                    {a.label ? <span className="text-muted"> · {a.label}</span> : null}
                  </span>
                  <span className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">{ago(a.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">No changes recorded yet.</p>
          )}
        </section>
      </div>
    </>
  );
}

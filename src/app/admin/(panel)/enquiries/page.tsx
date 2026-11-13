import { ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { ENQUIRY_STATUSES, STATUS_LABEL } from "@/admin/constants";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusChip } from "@/components/admin/StatusChip";

export const metadata = { title: "Enquiries" };
const PAGE = 20;
const field = "min-h-[46px] w-full rounded-xl border border-line bg-bg px-3 text-[0.92rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16)]";
type SP = { q?: string; status?: string; from?: string; to?: string; sort?: string; page?: string };

const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const sb = await createServerSupabase();
  const page = Math.max(0, Number.parseInt(sp.page ?? "0", 10) || 0);
  const status = (ENQUIRY_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "";
  const sort = sp.sort === "old" ? "old" : "new";
  // keep only letters, digits and a few safe symbols, so a search can never alter the structure of the database filter
  const q = (sp.q ?? "").replace(/[^\p{L}\p{N}@._+\- ]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const dateOk = (d?: string) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "");
  const from = dateOk(sp.from);
  const to = dateOk(sp.to);

  let query = sb.from("enquiries").select("id,name,email,company,service,status,message,created_at", { count: "exact" });
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%,message.ilike.%${q}%,service.ilike.%${q}%`);
  if (from) query = query.gte("created_at", `${from}T00:00:00Z`);
  if (to) query = query.lt("created_at", new Date(Date.parse(`${to}T00:00:00Z`) + 864e5).toISOString());
  const { data, count, error } = await query.order("created_at", { ascending: sort === "old" }).range(page * PAGE, page * PAGE + PAGE - 1);

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const link = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (status) u.set("status", status);
    if (from) u.set("from", from);
    if (to) u.set("to", to);
    if (sort === "old") u.set("sort", "old");
    if (p) u.set("page", String(p));
    const s = u.toString();
    return `/admin/enquiries${s ? `?${s}` : ""}`;
  };
  const filtered = Boolean(q || status || from || to);

  return (
    <>
      <PageHeader eyebrow="Visitors" title="Enquiries" description="Messages sent through the contact form on your website. They are saved here only. No email is sent automatically, so check this page regularly." />

      <form method="get" className="mb-6 grid gap-3 rounded-3xl border border-line bg-bg p-4 sm:grid-cols-2 lg:grid-cols-6" role="search" aria-label="Search enquiries">
        <label className="relative sm:col-span-2 lg:col-span-2">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Search name, email, company…" className={`${field} pl-9`} />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select name="status" defaultValue={status} className={field}>
            <option value="">All statuses</option>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">From date</span>
          <input type="date" name="from" defaultValue={from} aria-label="From date" className={field} />
        </label>
        <label>
          <span className="sr-only">To date</span>
          <input type="date" name="to" defaultValue={to} aria-label="To date" className={field} />
        </label>
        <label>
          <span className="sr-only">Sort</span>
          <select name="sort" defaultValue={sort} className={field}>
            <option value="new">Newest first</option>
            <option value="old">Oldest first</option>
          </select>
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button type="submit" className="btn btn-primary !min-h-[44px]">
            Apply
          </button>
          {filtered && (
            <a href="/admin/enquiries" className="btn btn-ghost !min-h-[44px]">
              Clear filters
            </a>
          )}
          <p className="ml-auto self-center text-sm text-muted">
            {total} {total === 1 ? "enquiry" : "enquiries"}
          </p>
        </div>
      </form>

      {error ? (
        <p role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          The enquiries could not be loaded. Please refresh the page.
        </p>
      ) : !data?.length ? (
        <div className="rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
          <Inbox className="mx-auto h-9 w-9 text-muted" aria-hidden />
          <p className="mt-4 font-semibold">{filtered ? "No enquiries match your filters." : "No enquiries yet."}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{filtered ? "Try clearing a filter." : "When a visitor sends a message through the contact form, it will appear here."}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((e) => (
            <li key={e.id}>
              <a href={`/admin/enquiries/${e.id}`} className="group block rounded-2xl border border-line bg-bg p-4 transition hover:border-accent/60 hover:shadow-md sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-3">
                    <span className="truncate font-semibold">{e.name}</span>
                    {e.company && <span className="truncate text-sm text-muted">· {e.company}</span>}
                  </p>
                  <StatusChip status={e.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {e.email}
                  {e.service ? ` · ${e.service}` : ""}
                </p>
                <p className="mt-2 line-clamp-2 text-[0.93rem] leading-relaxed">{e.message}</p>
                <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">{fmt(e.created_at)}</p>
              </a>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="mt-8 flex items-center justify-between" aria-label="Pagination">
          {page > 0 ? (
            <a href={link(page - 1)} className="btn btn-ghost !min-h-[44px]">
              <ChevronLeft className="h-4 w-4" aria-hidden /> Newer
            </a>
          ) : (
            <span />
          )}
          <p className="text-sm text-muted">
            Page {page + 1} of {pages}
          </p>
          {page + 1 < pages ? (
            <a href={link(page + 1)} className="btn btn-ghost !min-h-[44px]">
              Older <ChevronRight className="h-4 w-4" aria-hidden />
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

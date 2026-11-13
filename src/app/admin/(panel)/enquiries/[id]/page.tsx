import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail, MessageSquare, Phone, Tag, type LucideIcon } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusChip } from "@/components/admin/StatusChip";
import { CopyButton } from "@/components/ui/CopyButton";
import { DeleteEnquiryButton, DeleteNoteButton, NoteForm, StatusSelect } from "@/components/admin/EnquiryControls";

export const metadata = { title: "Enquiry" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

function Detail({ icon: Icon, label, value, href }: { icon: LucideIcon; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-line py-3 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted">{label}</p>
        <p className="mt-0.5 break-words font-medium">
          {value ? href ? <a href={href} className="link-u">{value}</a> : value : <span className="font-normal text-muted">Not provided</span>}
        </p>
      </div>
      {value && <CopyButton value={value} label={label.toLowerCase()} />}
    </div>
  );
}

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const sb = await createServerSupabase();
  const [{ data: e }, { data: notes }] = await Promise.all([
    sb.from("enquiries").select("*").eq("id", id).maybeSingle(),
    sb.from("enquiry_notes").select("*").eq("enquiry_id", id).order("created_at", { ascending: true }),
  ]);
  if (!e) notFound();

  return (
    <>
      <a href="/admin/enquiries" className="link-u mb-4 inline-flex min-h-[40px] items-center gap-2 text-sm text-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All enquiries
      </a>
      <PageHeader eyebrow="Enquiry" title={e.name} description={`Received ${fmt(e.created_at)}`} actions={<StatusChip status={e.status} />} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-bg p-5 sm:p-7">
            <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
              <MessageSquare className="h-4 w-4 text-accent-text" aria-hidden /> Message
            </h2>
            <p className="whitespace-pre-line break-words text-[1rem] leading-relaxed">{e.message}</p>
          </section>

          <section className="rounded-3xl border border-line bg-bg p-5 sm:p-7">
            <h2 className="mb-4 font-display text-lg font-semibold">Internal notes</h2>
            {notes?.length ? (
              <ul className="mb-6 space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-2xl bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-pre-line break-words text-[0.95rem] leading-relaxed">{n.note}</p>
                      <DeleteNoteButton noteId={n.id} enquiryId={e.id} />
                    </div>
                    <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">{fmt(n.created_at)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-6 text-sm text-muted">No notes yet.</p>
            )}
            <NoteForm id={e.id} />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-line bg-bg p-5">
            <StatusSelect id={e.id} status={e.status} />
          </section>
          <section className="rounded-3xl border border-line bg-bg p-5">
            <h2 className="mb-1 font-display text-lg font-semibold">Contact details</h2>
            <Detail icon={Mail} label="Email" value={e.email} href={`mailto:${e.email}`} />
            <Detail icon={Phone} label="Phone" value={e.phone} href={e.phone ? `tel:${e.phone.replace(/[^\d+]/g, "")}` : undefined} />
            <Detail icon={Building2} label="Company" value={e.company} />
            <Detail icon={Tag} label="Service of interest" value={e.service} />
          </section>
          <DeleteEnquiryButton id={e.id} name={e.name} />
        </aside>
      </div>
    </>
  );
}

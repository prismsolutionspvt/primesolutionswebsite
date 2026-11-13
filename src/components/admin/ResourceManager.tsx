"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Check, ImageIcon, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import type { ChildDef, FormValues, ResourceDef } from "@/admin/fields";
import { deleteRecord, reorderRecords, saveRecord, setFlag } from "@/admin/actions/content";
import { mediaUrl } from "@/lib/supabase/env";
import { useAdmin } from "./AdminProviders";
import { Drawer } from "./Drawer";
import { FormBody, initialValues, serialize, useForm, type OptionSets } from "./FormFields";

type Row = Record<string, unknown> & { id: string };
type ChildItem = FormValues & { id?: string };

const statusTone: Record<string, string> = {
  published: "bg-[#2F8071]/15 text-[#1F6154] dark:text-[#7FD3C0]",
  pending: "bg-[#F28A1E]/15 text-[#B05800] dark:text-[#F7A83B]",
  rejected: "bg-ink/10 text-muted",
};

/**
 * One list + editor for every managed collection (services, industries, team, values, FAQs, announcements…).
 * The list shows order, image, status and quick actions; the editor opens in a side sheet with sectioned fields,
 * field-level errors and a discard-changes guard. All saving goes through the server actions in admin/actions/content.ts.
 */
export function ResourceManager({ def, rows, childRows = {}, options = {} }: { def: ResourceDef; rows: Row[]; childRows?: Record<string, Row[]>; options?: OptionSets }) {
  const router = useRouter();
  const { toast, confirm } = useAdmin();
  const [pending, start] = useTransition();
  const [list, setList] = useState(rows);
  useEffect(() => setList(rows), [rows]);

  const [tab, setTab] = useState<string>(() => (def.tabs && rows.some((r) => r[def.tabs!.column] === "pending") ? "pending" : "all"));
  // quick actions on the overview link here with ?new=1 to open the "add" form straight away
  const params = useSearchParams();
  const [editing, setEditing] = useState<Row | "new" | null>(() => (params.get("new") === "1" ? "new" : null));

  const visible = useMemo(() => (def.tabs && tab !== "all" ? list.filter((r) => r[def.tabs!.column] === tab) : list), [list, tab, def.tabs]);
  const counts = useMemo(() => Object.fromEntries((def.tabs?.options ?? []).map((o) => [o.value, list.filter((r) => r[def.tabs!.column] === o.value).length])), [list, def.tabs]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) return toast("error", r.error ?? "That did not work. Please try again.");
      if (okMsg) toast("ok", okMsg);
      router.refresh();
    });

  const move = (id: string, dir: -1 | 1) => {
    const ids = list.map((r) => r.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setList(ids.map((x) => list.find((r) => r.id === x)!)); // instant feedback; the server is the source of truth on refresh
    run(() => reorderRecords(def.key, ids));
  };

  const remove = async (r: Row) => {
    const ok = await confirm({ title: `Delete this ${def.singular}?`, body: <>“{String(r[def.titleField] || "Untitled")}” will be removed from the website and cannot be recovered.</>, confirmLabel: "Delete", danger: true });
    if (ok) run(() => deleteRecord(def.key, r.id), `${cap(def.singular)} deleted.`);
  };

  const toggle = (r: Row) => def.flag && run(() => setFlag(def.key, r.id, def.flag!.column, !r[def.flag!.column]), r[def.flag.column] ? "Hidden from the website." : "Now showing on the website.");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {list.length} {list.length === 1 ? def.singular : def.plural}
        </p>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary !min-h-[46px]">
          <Plus className="h-[18px] w-[18px]" aria-hidden /> Add {def.singular}
        </button>
      </div>

      {def.tabs && (
        <div role="tablist" aria-label="Filter" className="mt-5 flex flex-wrap gap-2">
          {[{ value: "all", label: "All" }, ...def.tabs.options].map((o) => (
            <button key={o.value} role="tab" type="button" aria-selected={tab === o.value} onClick={() => setTab(o.value)} className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${tab === o.value ? "bg-ink text-bg" : "border border-line text-muted hover:text-ink"}`}>
              {o.label}
              <span className={`rounded-full px-2 py-0.5 font-mono text-[0.65rem] ${tab === o.value ? "bg-bg/20" : "bg-surface2"} ${o.value === "pending" && counts.pending ? "!bg-accent !text-[#0B1F4B]" : ""}`}>{o.value === "all" ? list.length : counts[o.value] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">{tab !== "all" ? "Nothing here." : def.empty}</p>
          {tab === "all" && (
            <button type="button" onClick={() => setEditing("new")} className="btn btn-primary mt-5 !min-h-[44px]">
              <Plus className="h-[18px] w-[18px]" aria-hidden /> Add {def.singular}
            </button>
          )}
        </div>
      ) : (
        <ul className={`mt-6 space-y-3 transition-opacity ${pending ? "opacity-70" : ""}`}>
          {visible.map((r, idx) => {
            const on = def.flag ? Boolean(r[def.flag.column]) : true;
            const status = def.tabs ? String(r[def.tabs.column]) : "";
            const img = def.imageField && typeof r[def.imageField] === "string" && r[def.imageField] ? mediaUrl(String(r[def.imageField])) : "";
            const title = String(r[def.titleField] ?? "").trim();
            return (
              <li key={r.id} className={`group flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border bg-bg p-3 transition hover:border-accent/50 hover:shadow-md sm:flex-nowrap sm:p-4 ${on ? "border-line" : "border-dashed border-line opacity-80"}`}>
                {def.imageField && (
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted" aria-hidden />
                    )}
                  </span>
                )}
                <button type="button" onClick={() => setEditing(r)} className="min-w-0 flex-1 text-left">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold">{title || <span className="font-normal italic text-muted">Empty slot</span>}</span>
                    {def.tabs && <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold capitalize ${statusTone[status] ?? "bg-surface2"}`}>{status}</span>}
                    {Boolean(r.is_featured) && <Star className="h-4 w-4 shrink-0 fill-accent text-accent" aria-label="Featured" />}
                    {key(def) === "announcements" && Boolean(r.is_enabled) && <span className="shrink-0 rounded-full bg-[#2F8071]/15 px-2.5 py-0.5 text-[0.68rem] font-semibold text-[#1F6154] dark:text-[#7FD3C0]">Live</span>}
                  </span>
                  {def.subtitleField && <span className="mt-0.5 block truncate text-sm text-muted">{String(r[def.subtitleField] ?? "")}</span>}
                </button>

                <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  {def.tabs && status === "pending" && (
                    <>
                      <button type="button" onClick={() => run(() => setFlag(def.key, r.id, "status", "published"), "Approved and published.")} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#2F8071] px-4 text-sm font-semibold text-white hover:brightness-110">
                        <Check className="h-4 w-4" aria-hidden /> Approve
                      </button>
                      <button type="button" onClick={() => run(() => setFlag(def.key, r.id, "status", "rejected"), "Rejected.")} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold text-muted hover:border-red-500 hover:text-red-600">
                        <X className="h-4 w-4" aria-hidden /> Reject
                      </button>
                    </>
                  )}
                  {def.quick?.is_featured && status === "published" && (
                    <button type="button" aria-pressed={Boolean(r.is_featured)} aria-label={r.is_featured ? "Remove from featured" : "Feature this review"} onClick={() => run(() => setFlag(def.key, r.id, "is_featured", !r.is_featured))} className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:text-accent">
                      <Star className={`h-4 w-4 ${r.is_featured ? "fill-accent text-accent" : ""}`} />
                    </button>
                  )}
                  {def.flag && (
                    <button type="button" role="switch" aria-checked={on} aria-label={`${on ? "Hide" : "Show"} ${title || def.singular} on the website`} onClick={() => toggle(r)} className="flex min-h-[40px] items-center gap-2 rounded-full border border-line px-3 text-xs font-semibold text-muted transition hover:text-ink">
                      <span aria-hidden className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-accent" : "bg-ink/20"}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                      </span>
                      {key(def) === "announcements" ? (on ? "Enabled" : "Disabled") : on ? "Visible" : "Hidden"}
                    </button>
                  )}
                  {def.order && !def.tabs && (
                    <span className="flex">
                      <button type="button" disabled={idx === 0 || pending} onClick={() => move(r.id, -1)} aria-label={`Move ${title || def.singular} up`} className="grid h-10 w-10 place-items-center rounded-l-full border border-line text-muted hover:text-ink disabled:opacity-30">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" disabled={idx === visible.length - 1 || pending} onClick={() => move(r.id, 1)} aria-label={`Move ${title || def.singular} down`} className="-ml-px grid h-10 w-10 place-items-center rounded-r-full border border-line text-muted hover:text-ink disabled:opacity-30">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </span>
                  )}
                  <button type="button" onClick={() => setEditing(r)} aria-label={`Edit ${title || def.singular}`} className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:border-accent hover:text-ink">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => remove(r)} aria-label={`Delete ${title || def.singular}`} className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:border-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && <Editor key={editing === "new" ? "new" : editing.id} def={def} row={editing === "new" ? null : editing} kidRows={editing === "new" ? [] : childRows[editing.id] ?? []} options={options} onClose={() => setEditing(null)} onSaved={() => (setEditing(null), router.refresh())} />}
    </div>
  );
}

const key = (d: ResourceDef) => d.key;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ───────────────────────────── editor ───────────────────────────── */

function Editor({ def, row, kidRows, options, onClose, onSaved }: { def: ResourceDef; row: Row | null; kidRows: Row[]; options: OptionSets; onClose: () => void; onSaved: () => void }) {
  const { toast, confirm } = useAdmin();
  const isNew = !row;
  const form = useForm(def.fields, initialValues(def.fields, row, def.defaults), isNew);
  const [kids, setKids] = useState<ChildItem[]>(() => kidRows.map((c) => ({ id: c.id, ...initialValues(def.children!.fields, c) })));
  const [kidsDirty, setKidsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, start] = useTransition();

  const dirty = form.dirty || kidsDirty;
  const close = async () => {
    if (dirty && !(await confirm({ title: "Discard your changes?", body: "You have unsaved changes in this form.", confirmLabel: "Discard" }))) return;
    onClose();
  };

  const save = () =>
    start(async () => {
      setErrors({});
      const payload = serialize(def.fields, form.values);
      const childPayload = def.children ? kids.map((k) => ({ ...(k.id ? { id: k.id } : {}), ...serialize(def.children!.fields, k) })) : undefined;
      const r = await saveRecord(def.key, row?.id ?? null, payload, childPayload);
      if (r.ok) {
        toast("ok", isNew ? `${cap(def.singular)} added.` : "Changes saved.");
        return onSaved();
      }
      setErrors(r.fieldErrors ?? {});
      toast("error", r.error);
      if (r.fieldErrors) document.getElementById(`ed-${Object.keys(r.fieldErrors)[0]?.replace(/\W+/g, "-")}`)?.focus();
    });

  return (
    <Drawer
      open
      onClose={close}
      title={isNew ? `Add ${def.singular}` : `Edit ${def.singular}`}
      subtitle={isNew ? def.description : String(row?.[def.titleField] ?? "")}
      footer={
        <>
          <button type="button" onClick={close} className="btn btn-ghost !min-h-[46px]">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy} className="btn btn-primary !min-h-[46px] disabled:opacity-70">
            {busy && <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />}
            {busy ? "Saving…" : isNew ? `Add ${def.singular}` : "Save changes"}
          </button>
        </>
      }
    >
      <form onSubmit={(e) => (e.preventDefault(), save())} noValidate className="space-y-9">
        <FormBody fields={def.fields} sections={def.sections} values={form.values} set={form.set} errors={errors} options={options} idPrefix="ed" />
        {key(def) === "announcements" && <AnnouncementPreview values={form.values} />}
        {def.children && <ChildEditor ch={def.children} items={kids} onChange={(v) => (setKids(v), setKidsDirty(true))} error={errors.__children} />}
        <button type="submit" className="sr-only">
          Save
        </button>
      </form>
    </Drawer>
  );
}

/** Subcategories (or any child list): add, edit, hide, re-order and delete inside the parent's editor. */
function ChildEditor({ ch, items, onChange, error }: { ch: ChildDef; items: ChildItem[]; onChange: (v: ChildItem[]) => void; error?: string }) {
  const update = (i: number, name: string, v: unknown) => onChange(items.map((it, j) => (j === i ? { ...it, [name]: v } : it)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset>
      <legend className="mb-4 w-full border-b border-line pb-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent-text">{ch.plural}</legend>
      <p className="-mt-2 mb-4 text-sm text-muted">The items listed inside this service. Saved together with the service.</p>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={it.id ?? `n${i}`} className={`rounded-xl border bg-bg p-3 ${it.is_published === false ? "border-dashed border-line opacity-75" : "border-line"}`}>
            <div className="flex items-start gap-2">
              <span className="mt-3 w-6 shrink-0 text-center font-mono text-xs text-muted">{i + 1}</span>
              <div className="grid flex-1 gap-2">
                <input aria-label={`${ch.singular} ${i + 1} title`} value={String(it.title ?? "")} maxLength={160} placeholder="Title" onChange={(e) => update(i, "title", e.target.value)} className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-[0.95rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16)]" />
                <textarea aria-label={`${ch.singular} ${i + 1} supporting sentence`} value={String(it.detail ?? "")} rows={2} maxLength={600} placeholder="Supporting sentence (optional)" onChange={(e) => update(i, "detail", e.target.value)} className="w-full resize-y rounded-xl border border-line bg-bg px-4 py-2.5 text-[0.95rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16)]" />
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-muted">
                  <input type="checkbox" checked={it.is_published !== false} onChange={(e) => update(i, "is_published", e.target.checked)} className="h-4 w-4 accent-[#F28A1E]" /> Show on the website
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${i + 1} up`} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-ink disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${i + 1} down`} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-ink disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Delete ${i + 1}`} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...items, { title: "", detail: "", is_published: true }])} className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-dashed border-line px-5 text-sm font-semibold text-muted transition hover:border-accent hover:text-ink">
        <Plus className="h-4 w-4" aria-hidden /> Add {ch.singular.toLowerCase()}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}

/** A quick look at how the announcement will read (the real pop-up adds the animation). */
function AnnouncementPreview({ values }: { values: FormValues }) {
  const img = typeof values.image_path === "string" && values.image_path ? mediaUrl(values.image_path) : "";
  return (
    <fieldset>
      <legend className="mb-4 w-full border-b border-line pb-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent-text">Preview</legend>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface sm:grid sm:grid-cols-2">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="h-40 w-full object-cover sm:h-full" />
        )}
        <div className={`p-5 ${img ? "" : "sm:col-span-2"}`}>
          <p className="font-display text-xl font-semibold leading-tight">{String(values.title || "Your announcement title")}</p>
          {values.short_description ? <p className="mt-2 text-sm text-muted">{String(values.short_description)}</p> : null}
          {values.cta_text ? <span className="btn btn-primary mt-4 !min-h-[40px] text-sm">{String(values.cta_text)}</span> : null}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">On the website this appears as an animated pop-up (a bottom sheet on phones).</p>
    </fieldset>
  );
}

"use client";
import { useCallback, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from "lucide-react";
import type { FieldDef, FormSection, FormValues, Opt, Pair } from "@/admin/fields";
import { mediaUrl } from "@/lib/supabase/env";
import { slugify } from "@/lib/slug";
import { ImagePicker } from "./ImagePicker";

/* ───────────── values: database row ⇄ form state ⇄ server payload ───────────── */

const toLocalInput = (iso: unknown) => {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Turn a database row (or nothing, for a new record) into editable form state. */
export function initialValues(fields: FieldDef[], row?: Record<string, unknown> | null, defaults: Record<string, unknown> = {}): FormValues {
  const out: FormValues = {};
  for (const f of fields) {
    const raw = row ? row[f.name] : undefined;
    switch (f.kind) {
      case "switch":
        out[f.name] = row ? Boolean(raw) : (defaults[f.name] as boolean | undefined) ?? f.name === "is_published";
        break;
      case "number":
        out[f.name] = row ? (raw === null || raw === undefined ? "" : String(raw)) : String((defaults[f.name] as number | undefined) ?? f.default ?? "");
        break;
      case "lines":
        out[f.name] = Array.isArray(raw) ? raw.join("\n") : "";
        break;
      case "paragraphs":
        out[f.name] = Array.isArray(raw) ? raw.join("\n\n") : "";
        break;
      case "datetime":
        out[f.name] = toLocalInput(raw);
        break;
      case "multi":
        out[f.name] = Array.isArray(raw) ? raw : [];
        break;
      case "pairs":
        out[f.name] = Array.isArray(raw) ? (raw as Pair[]).map((p) => ({ title: p.title ?? "", text: p.text ?? "" })) : [];
        break;
      case "select":
        out[f.name] = (row ? (raw as string | null) : (defaults[f.name] as string | undefined)) ?? f.options[0]?.value ?? "";
        break;
      default:
        out[f.name] = (raw as string | null | undefined) ?? (defaults[f.name] as string | undefined) ?? "";
    }
  }
  return out;
}

/** The payload sent to the Server Action (dates become ISO strings; everything else is already in shape). */
export function serialize(fields: FieldDef[], values: FormValues): FormValues {
  const out: FormValues = { ...values };
  for (const f of fields) {
    if (f.kind === "datetime") {
      const v = values[f.name];
      out[f.name] = typeof v === "string" && v ? new Date(v).toISOString() : "";
    }
  }
  return out;
}

/** Form state with automatic web-address (slug) suggestions that stop once the owner edits the slug by hand. */
export function useForm(fields: FieldDef[], initial: FormValues, isNew: boolean) {
  const [values, setValues] = useState<FormValues>(initial);
  const [dirty, setDirty] = useState(false);
  const touched = useRef(new Set<string>());
  const set = useCallback(
    (name: string, v: unknown) => {
      setDirty(true);
      if (fields.some((f) => f.kind === "slug" && f.name === name)) touched.current.add(name);
      setValues((cur) => {
        const next = { ...cur, [name]: v };
        for (const f of fields) if (f.kind === "slug" && f.from === name && isNew && !touched.current.has(f.name)) next[f.name] = slugify(String(v));
        return next;
      });
    },
    [fields, isNew],
  );
  return { values, set, dirty, reset: (v: FormValues) => (setValues(v), setDirty(false), touched.current.clear()) };
}

/* ───────────── rendering ───────────── */

const input =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted/60 outline-none transition focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16)] aria-[invalid=true]:border-red-500 disabled:opacity-60";

export type OptionSets = Record<string, Opt[]>;

function Wrap({ f, error, children, id }: { f: FieldDef; error?: string; children: React.ReactNode; id: string }) {
  return (
    <div className={f.span === 2 ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {f.label}
        {f.required && <span className="ml-1 text-accent-text" aria-hidden>*</span>}
      </label>
      {children}
      {f.help && !error && <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-muted">{f.help}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function FieldRenderer({ f, value, onChange, error, options, idPrefix = "f" }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void; error?: string; options?: OptionSets; idPrefix?: string }) {
  const id = `${idPrefix}-${f.name.replace(/\W+/g, "-")}`;
  const a11y = { id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-err` : f.help ? `${id}-help` : undefined } as const;
  const str = typeof value === "string" ? value : "";

  switch (f.kind) {
    case "text":
    case "email":
    case "phone":
    case "digits":
    case "slug":
    case "url":
    case "combo": {
      const type = f.kind === "email" ? "email" : f.kind === "phone" ? "tel" : f.kind === "url" ? "url" : "text";
      return (
        <Wrap f={f} error={error} id={id}>
          <input {...a11y} type={type} inputMode={f.kind === "digits" ? "numeric" : undefined} value={str} placeholder={f.placeholder} maxLength={"max" in f && f.max ? f.max : f.kind === "url" ? 500 : 200} list={f.kind === "combo" ? `${id}-list` : undefined} onChange={(e) => onChange(f.kind === "digits" ? e.target.value.replace(/\D/g, "") : e.target.value)} className={input} autoComplete="off" />
          {f.kind === "combo" && (
            <datalist id={`${id}-list`}>
              {f.suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </Wrap>
      );
    }
    case "textarea":
    case "paragraphs":
    case "lines":
      return (
        <Wrap f={f} error={error} id={id}>
          <textarea {...a11y} rows={f.rows ?? 4} value={str} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={`${input} resize-y leading-relaxed`} />
          {f.kind === "textarea" && f.max ? <p className="mt-1 text-right font-mono text-[0.65rem] tabular-nums text-muted">{str.length}/{f.max}</p> : null}
        </Wrap>
      );
    case "number":
      return (
        <Wrap f={f} error={error} id={id}>
          <input {...a11y} type="number" inputMode="numeric" min={f.min} max={f.max} value={str} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={input} />
        </Wrap>
      );
    case "datetime":
      return (
        <Wrap f={f} error={error} id={id}>
          <input {...a11y} type="datetime-local" value={str} onChange={(e) => onChange(e.target.value)} className={input} />
        </Wrap>
      );
    case "select":
      return (
        <Wrap f={f} error={error} id={id}>
          <select {...a11y} value={str} onChange={(e) => onChange(e.target.value)} className={input}>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Wrap>
      );
    case "switch": {
      const on = value === true;
      return (
        <div className={f.span === 2 ? "sm:col-span-2" : ""}>
          <button type="button" role="switch" aria-checked={on} aria-labelledby={`${id}-l`} aria-describedby={f.help ? `${id}-help` : undefined} id={id} onClick={() => onChange(!on)} className="flex min-h-[48px] w-full items-center justify-between gap-4 rounded-xl border border-line bg-bg px-4 py-2.5 text-left transition hover:border-accent/60">
            <span>
              <span id={`${id}-l`} className="block text-sm font-semibold">{f.label}</span>
              {f.help && <span id={`${id}-help`} className="mt-0.5 block text-xs leading-relaxed text-muted">{f.help}</span>}
            </span>
            <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-ink/20"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
            </span>
          </button>
        </div>
      );
    }
    case "multi": {
      const opts = options?.[f.optionsFrom] ?? [];
      const sel = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className={f.span === 2 ? "sm:col-span-2" : ""}>
          <p id={`${id}-l`} className="mb-1.5 text-sm font-semibold">{f.label}</p>
          {opts.length === 0 ? (
            <p className="text-sm text-muted">Nothing to choose from yet.</p>
          ) : (
            <div role="group" aria-labelledby={`${id}-l`} className="flex flex-wrap gap-2">
              {opts.map((o) => {
                const on = sel.includes(o.value);
                return (
                  <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(on ? sel.filter((s) => s !== o.value) : [...sel, o.value])} className={`min-h-[40px] rounded-full border px-4 text-sm font-semibold transition ${on ? "border-accent bg-accent text-[#0B1F4B]" : "border-line text-muted hover:text-ink"}`}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}
          {error && <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>
      );
    }
    case "image":
      return <ImageField f={f} id={id} value={str} onChange={onChange} error={error} />;
    case "pairs":
      return <PairsField f={f} id={id} value={Array.isArray(value) ? (value as Pair[]) : []} onChange={onChange} error={error} />;
  }
}

function ImageField({ f, id, value, onChange, error }: { f: Extract<FieldDef, { kind: "image" }>; id: string; value: string; onChange: (v: unknown) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={f.span === 2 ? "sm:col-span-2" : ""}>
      <p id={`${id}-l`} className="mb-1.5 text-sm font-semibold">{f.label}</p>
      <div className="flex items-center gap-4 rounded-xl border border-line bg-bg p-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted">{value ? value.split("/").pop() : "No image selected"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" id={id} aria-labelledby={`${id}-l`} onClick={() => setOpen(true)} className="btn btn-ghost !min-h-[40px] !px-4 text-sm">
              {value ? "Change image" : "Choose image"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:text-red-600">
                <X className="h-4 w-4" aria-hidden /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
      {f.help && !error && <p className="mt-1.5 text-xs leading-relaxed text-muted">{f.help}</p>}
      {error && <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
      <ImagePicker open={open} onClose={() => setOpen(false)} onPick={(p) => onChange(p)} folder={f.folder} />
    </div>
  );
}

function PairsField({ f, id, value, onChange, error }: { f: Extract<FieldDef, { kind: "pairs" }>; id: string; value: Pair[]; onChange: (v: unknown) => void; error?: string }) {
  const max = f.maxItems ?? 12;
  const update = (i: number, patch: Partial<Pair>) => onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className={f.span === 2 ? "sm:col-span-2" : ""}>
      <p id={`${id}-l`} className="mb-1.5 text-sm font-semibold">{f.label}</p>
      <ul className="space-y-3">
        {value.map((p, i) => (
          <li key={i} className="rounded-xl border border-line bg-bg p-3">
            <div className="flex items-start gap-2">
              <div className="grid flex-1 gap-2">
                <input aria-label={`${f.titleLabel ?? "Title"} ${i + 1}`} value={p.title} maxLength={160} placeholder={f.titleLabel ?? "Title"} onChange={(e) => update(i, { title: e.target.value })} className={input} />
                <textarea aria-label={`${f.textLabel ?? "Text"} ${i + 1}`} value={p.text} rows={2} maxLength={600} placeholder={f.textLabel ?? "Text"} onChange={(e) => update(i, { text: e.target.value })} className={`${input} resize-y`} />
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${i + 1} up`} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-ink disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move ${i + 1} down`} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-ink disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${i + 1}`} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {value.length < max && (
        <button type="button" onClick={() => onChange([...value, { title: "", text: "" }])} className="mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-dashed border-line px-4 text-sm font-semibold text-muted transition hover:border-accent hover:text-ink">
          <Plus className="h-4 w-4" aria-hidden /> Add
        </button>
      )}
      {f.help && !error && <p className="mt-1.5 text-xs text-muted">{f.help}</p>}
      {error && <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/** A whole form body, optionally broken into titled sections. */
export function FormBody({ fields, sections, values, set, errors, options, idPrefix }: { fields: FieldDef[]; sections?: FormSection[]; values: FormValues; set: (n: string, v: unknown) => void; errors: Record<string, string>; options?: OptionSets; idPrefix?: string }) {
  const byName = new Map(fields.map((f) => [f.name, f]));
  const render = (list: FieldDef[]) => (
    <div className="grid gap-5 sm:grid-cols-2">
      {list.map((f) => (
        <FieldRenderer key={f.name} f={f} value={values[f.name]} onChange={(v) => set(f.name, v)} error={errors[f.name]} options={options} idPrefix={idPrefix} />
      ))}
    </div>
  );
  if (!sections) return render(fields);
  return (
    <div className="space-y-9">
      {sections.map((s) => (
        <fieldset key={s.title}>
          <legend className="mb-4 w-full border-b border-line pb-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent-text">{s.title}</legend>
          {s.description && <p className="-mt-2 mb-4 text-sm text-muted">{s.description}</p>}
          {render(s.fields.map((n) => byName.get(n)).filter((f): f is FieldDef => !!f))}
        </fieldset>
      ))}
    </div>
  );
}

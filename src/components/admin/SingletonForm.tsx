"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { saveSingleton } from "@/admin/actions/content";
import type { SingletonDef } from "@/admin/registry";
import { useAdmin } from "./AdminProviders";
import { FormBody, initialValues, serialize, useForm, type OptionSets } from "./FormFields";

/** A one-row settings form (contact details, WhatsApp, a section's heading…). Saving updates the website immediately. */
export function SingletonForm({ def, row, options, bare = false }: { def: SingletonDef; row: Record<string, unknown>; options?: OptionSets; bare?: boolean }) {
  const router = useRouter();
  const { toast } = useAdmin();
  const form = useForm(def.fields, initialValues(def.fields, row), false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [busy, start] = useTransition();

  const save = () =>
    start(async () => {
      setErrors({});
      setSaved(false);
      const r = await saveSingleton(def.key, serialize(def.fields, form.values));
      if (r.ok) {
        toast("ok", "Saved. The website has been updated.");
        setSaved(true);
        form.reset(form.values);
        return router.refresh();
      }
      setErrors(r.fieldErrors ?? {});
      toast("error", r.error);
    });

  return (
    <form onSubmit={(e) => (e.preventDefault(), save())} noValidate className={bare ? "" : "rounded-3xl border border-line bg-bg p-5 shadow-sm sm:p-7"} aria-label={def.title}>
      {!bare && (
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold">{def.title}</h2>
          {def.description && <p className="mt-1 text-sm leading-relaxed text-muted">{def.description}</p>}
        </div>
      )}
      <FormBody fields={def.fields} sections={def.sections} values={form.values} set={(n, v) => (setSaved(false), form.set(n, v))} errors={errors} options={options} idPrefix={`s-${def.key}`} />
      <div className="mt-7 flex items-center gap-4">
        <button type="submit" disabled={busy || !form.dirty} className="btn btn-primary !min-h-[46px] disabled:opacity-50">
          {busy && <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />}
          {busy ? "Saving…" : "Save changes"}
        </button>
        {saved && !form.dirty && (
          <span className="inline-flex items-center gap-2 text-sm text-[#2F8071]" role="status">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

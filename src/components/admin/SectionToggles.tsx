"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSectionVisible } from "@/admin/actions/content";
import { SECTION_TOGGLES } from "@/admin/registry";
import { useAdmin } from "./AdminProviders";

/** Show or hide whole sections of the public website. Hidden sections simply do not render; their content is kept. */
export function SectionToggles({ visible }: { visible: Record<string, boolean> }) {
  const router = useRouter();
  const { toast } = useAdmin();
  const [state, setState] = useState(visible);
  const [, start] = useTransition();

  const flip = (key: string) => {
    const next = !state[key];
    setState((s) => ({ ...s, [key]: next }));
    start(async () => {
      const r = await setSectionVisible(key, next);
      if (!r.ok) {
        setState((s) => ({ ...s, [key]: !next }));
        return toast("error", r.error);
      }
      toast("ok", next ? "Section is now visible." : "Section hidden from the website.");
      router.refresh();
    });
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {SECTION_TOGGLES.map((s) => {
        const on = state[s.key] !== false;
        return (
          <li key={s.key}>
            <button type="button" role="switch" aria-checked={on} onClick={() => flip(s.key)} className="flex min-h-[52px] w-full items-center justify-between gap-4 rounded-xl border border-line bg-bg px-4 py-2.5 text-left transition hover:border-accent/60">
              <span className="text-sm font-semibold">{s.label}</span>
              <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-ink/20"}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

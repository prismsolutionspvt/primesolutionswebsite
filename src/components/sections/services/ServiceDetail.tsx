"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Plus } from "lucide-react";
import type { Service } from "@/types";

/** Summary, optional portfolio note, expandable capabilities and a CTA for one service. Remount (key) to reset the open item. */
export function ServiceDetail({ s, twoColumns = false }: { s: Service; twoColumns?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div data-stage-in>
      {s.imageUrl && (
        <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-2xl bg-surface2">
          <Image src={s.imageUrl} alt="" fill sizes="(max-width: 1024px) 90vw, 520px" className="object-cover" />
        </div>
      )}
      <p className="max-w-[46ch] text-[1.03rem] leading-relaxed text-ink">{s.summary}</p>
      {s.note && <p className="mt-3 max-w-[46ch] border-l-2 border-accent pl-4 text-[0.92rem] leading-relaxed text-muted">{s.note}</p>}

      <p className="mb-2 mt-6 flex items-center justify-between font-mono text-[0.66rem] uppercase tracking-[0.2em] text-accent-text">
        <span>What it covers</span>
        <span className="text-muted">{s.items.length} capabilities</span>
      </p>
      <ul className={`items-start border-t border-line ${twoColumns ? "sm:grid sm:grid-cols-2 sm:gap-x-6" : ""}`}>
        {s.items.map((it, i) => {
          const expandable = !!it.detail;
          const on = open === i;
          return (
            <li key={it.title} className="border-b border-line">
              {expandable ? (
                <>
                  <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : i)} className="group flex min-h-[46px] w-full items-center justify-between gap-3 py-2 text-left">
                    <span className={`text-[0.93rem] font-medium leading-snug transition-all duration-300 ${on ? "translate-x-1 text-ink" : "text-ink/85 group-hover:translate-x-1 group-hover:text-ink"}`}>{it.title}</span>
                    <Plus className={`h-4 w-4 shrink-0 text-accent-text transition-transform duration-300 ${on ? "rotate-45" : "group-hover:rotate-90"}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <p className="overflow-hidden pr-6 text-[0.88rem] leading-relaxed text-muted">
                      <span className="block pb-3">{it.detail}</span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="flex min-h-[46px] items-center py-2 text-[0.93rem] font-medium leading-snug text-ink/85">{it.title}</p>
              )}
            </li>
          );
        })}
      </ul>

      <a
        href="#contact"
        onClick={() => window.dispatchEvent(new CustomEvent("prism:service-interest", { detail: s.id }))}
        className="btn btn-ghost group mt-6 !min-h-[44px]"
      >
        Ask about {s.name}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

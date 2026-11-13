"use client";
import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import type { Service } from "@/types";

/** Summary, expandable capabilities and a CTA for one service. Remount (key) to reset the open item. */
export function ServiceDetail({ s }: { s: Service }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div data-stage-in>
      <p className="max-w-[44ch] text-[1.05rem] leading-relaxed text-ink">{s.summary}</p>

      <p className="mb-2 mt-7 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-accent-text">What it covers</p>
      <ul className="border-t border-line">
        {s.items.map((it, i) => {
          const expandable = !!it.detail;
          const on = open === i;
          return (
            <li key={it.title} className="border-b border-line">
              {expandable ? (
                <>
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setOpen(on ? null : i)}
                    className="group flex min-h-[48px] w-full items-center justify-between gap-4 py-2.5 text-left"
                  >
                    <span className={`text-[0.97rem] font-medium transition-colors ${on ? "text-ink" : "text-ink/85 group-hover:text-ink"}`}>{it.title}</span>
                    <Plus className={`h-4 w-4 shrink-0 text-accent-text transition-transform duration-300 ${on ? "rotate-45" : ""}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <p className="overflow-hidden pr-8 text-[0.92rem] leading-relaxed text-muted">
                      <span className="block pb-3">{it.detail}</span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="flex min-h-[48px] items-center py-2.5 text-[0.97rem] font-medium text-ink/85">{it.title}</p>
              )}
            </li>
          );
        })}
      </ul>

      <a
        href="#contact"
        onClick={() => window.dispatchEvent(new CustomEvent("prism:service-interest", { detail: s.id }))}
        className="btn btn-ghost group mt-7 !min-h-[44px]"
      >
        Ask about {s.name}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

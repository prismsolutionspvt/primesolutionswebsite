"use client";
import { useState } from "react";
import { commitment } from "@/content";

/** Five service commitments as a hover/tap-reactive index. Hovering (or tapping) a row opens it and tints it with a sweep. */
export function CommitmentList() {
  const [open, setOpen] = useState<number>(0);
  return (
    <ul className="border-t border-line" onMouseLeave={() => undefined}>
      {commitment.items.map((c, i) => {
        const on = open === i;
        return (
          <li key={c.title} className="border-b border-line">
            <button
              type="button"
              aria-expanded={on}
              onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setOpen(i)}
              onFocus={() => setOpen(i)}
              onClick={() => setOpen(i)}
              className="group relative flex w-full items-center gap-5 overflow-hidden py-5 text-left sm:gap-8 sm:py-6"
            >
              <span aria-hidden className={`absolute inset-0 -z-10 origin-left bg-accent/10 transition-transform duration-700 ease-out ${on ? "scale-x-100" : "scale-x-0"}`} />
              <span className={`font-mono text-xs tabular-nums transition-colors ${on ? "text-accent-text" : "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={`flex-1 font-display text-[clamp(1.5rem,4.4vw,2.6rem)] font-semibold tracking-tight transition-all duration-500 ease-out ${on ? "translate-x-3 text-ink" : "text-ink/40 group-hover:text-ink/70"}`}>{c.title}</span>
              <span aria-hidden className={`mr-1 h-2.5 w-2.5 rounded-full bg-accent transition-all duration-500 ${on ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
            </button>
            <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <p className="overflow-hidden pl-[calc(0.75rem+1.4rem)] pr-4 text-[1rem] leading-relaxed text-muted sm:pl-[4.9rem]">
                <span className="block max-w-[56ch] pb-6">{c.text}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

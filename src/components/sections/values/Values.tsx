"use client";
import { useState, type PointerEvent } from "react";
import { Plus } from "lucide-react";
import { adaptiveProps } from "@/config/adaptive";
import { useContent } from "@/components/providers/ContentProvider";
import { Split } from "@/components/ui/Split";
import { ValueGlyph } from "./ValueGlyph";

const glow = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/**
 * Core values as expanding panels (desktop) or a connected accordion (mobile). Hover/tap a value and it opens:
 * its line-graphic redraws, the word enlarges and a light follows the pointer. Strictly the portfolio's five values.
 */
export function Values() {
  const { values, valuesIntro } = useContent();
  const [active, setActive] = useState(0);
  const hoverable = () => window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;

  return (
    <section id="values" {...adaptiveProps("values")} className="relative py-20 sm:py-28 lg:py-32">
      <div className="wrap">
        <p className="eyebrow mb-6" data-fade>
          {valuesIntro.eyebrow}
        </p>
        <Split as="h2" className="h-display max-w-[16ch] text-[clamp(2.3rem,7vw,5.4rem)] lg:text-[clamp(2.8rem,5vw,5.4rem)]" accent={["work."]}>
          {valuesIntro.heading}
        </Split>

        {/* desktop: expanding panels */}
        <div data-fade className="mt-12 hidden h-[min(520px,64svh)] gap-3 lg:flex">
          {values.map((v, i) => {
            const on = i === active;
            return (
              <button
                key={v.word}
                type="button"
                aria-expanded={on}
                onMouseEnter={() => hoverable() && setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                onPointerMove={glow}
                className={`group relative min-w-0 overflow-hidden rounded-[1.75rem] border text-left transition-[flex-grow,border-color,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  on ? "border-accent/60 bg-surface" : "border-line bg-surface/50 hover:border-ink/30"
                }`}
                style={{ flexGrow: on ? 4 : 1, flexBasis: 0 }}
              >
                {/* cursor-following light */}
                <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--glow) / 0.15), transparent 70%)" }} />

                {/* collapsed: number + vertical word */}
                <span className={`absolute inset-0 flex flex-col items-center justify-between py-7 transition-opacity duration-500 ${on ? "opacity-0" : "opacity-100 delay-300"}`}>
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="rotate-180 font-display text-[1.7rem] font-semibold tracking-tight text-ink/65 transition-colors duration-300 [writing-mode:vertical-rl] group-hover:text-ink">{v.word}</span>
                </span>

                {/* expanded: anchored left at a fixed width so it is revealed, not squeezed */}
                <span className={`absolute inset-y-0 left-0 flex w-[min(40rem,52vw)] flex-col justify-between p-8 transition-opacity duration-500 ${on ? "opacity-100 delay-300" : "opacity-0"}`}>
                  <span className="flex items-start justify-between">
                    <span className="font-mono text-xs text-accent-text">{String(i + 1).padStart(2, "0")} / 05</span>
                    {on && <ValueGlyph key={v.word} index={i} className="h-[clamp(130px,26svh,200px)] w-auto" />}
                  </span>
                  <span>
                    <span className="block font-display text-[clamp(2.4rem,4vw,3.6rem)] font-semibold leading-none tracking-tight">{v.word}</span>
                    <span className="mt-4 block max-w-[30ch] text-[1.08rem] leading-relaxed text-muted">{v.line}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* mobile / tablet: connected accordion */}
        <ul className="mt-10 border-t border-line lg:hidden" data-fade>
          {values.map((v, i) => {
            const on = i === active;
            return (
              <li key={v.word} className="border-b border-line">
                <button type="button" aria-expanded={on} onClick={() => setActive(i)} className="flex min-h-[64px] w-full items-center gap-4 py-4 text-left">
                  <span className={`font-mono text-xs transition-colors ${on ? "text-accent-text" : "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={`flex-1 font-display text-[1.75rem] font-semibold tracking-tight transition-colors ${on ? "text-ink" : "text-ink/60"}`}>{v.word}</span>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ${on ? "rotate-45 border-accent bg-accent text-[#0B1F4B]" : "border-line"}`}>
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    {on && (
                      <div className="flex items-center gap-5 pb-6">
                        <ValueGlyph key={v.word} index={i} className="h-24 w-28 shrink-0" />
                        <p className="text-[1.02rem] leading-relaxed text-muted">{v.line}</p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

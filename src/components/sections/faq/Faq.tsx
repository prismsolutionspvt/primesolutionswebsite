"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { adaptiveProps } from "@/config/adaptive";
import { faqCategories, faqIntro, faqs } from "@/content";
import { Split } from "@/components/ui/Split";
import { PointerGlow } from "@/components/layout/PointerGlow";
import type { FaqCategoryId } from "@/types";

/**
 * FAQ with real interaction: topic filters with a sliding indicator, rows that light up on hover
 * (sweeping tint, accent bar, shifting question, drawing ring), an answer that eases open and rises in,
 * a cursor-following glow across the list, and arrow-key navigation between questions.
 */
export function Faq() {
  const [cat, setCat] = useState<FaqCategoryId | "all">("all");
  const [open, setOpen] = useState<number>(0);
  const list = useMemo(() => faqs.filter((f) => cat === "all" || f.category === cat), [cat]);

  // sliding indicator behind the active topic chip
  const chips = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const el = chips.current?.querySelector<HTMLElement>(`[data-cat="${cat}"]`);
      if (el) setThumb({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cat]);

  const pick = (id: FaqCategoryId | "all") => {
    setCat(id);
    setOpen(0);
  };

  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-faq]"));
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    btns[(i + (e.key === "ArrowDown" ? 1 : btns.length - 1)) % btns.length].focus();
  };

  return (
    <section id="faq" {...adaptiveProps("faq")} className="relative bg-surface py-20 sm:py-28 lg:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-6" data-fade>
              {faqIntro.eyebrow}
            </p>
            <Split as="h2" className="h-display text-[clamp(2.2rem,6.4vw,3.8rem)] lg:text-[clamp(2.4rem,3.6vw,3.8rem)]" accent={["asked."]}>
              {faqIntro.heading}
            </Split>
            <p className="mt-5 max-w-xs text-[1.02rem] leading-relaxed text-muted" data-fade>
              {faqIntro.text}
            </p>
            <div ref={chips} className="relative mt-8 inline-flex max-w-full flex-wrap gap-1 rounded-full border border-line bg-bg p-1" role="tablist" aria-label="FAQ topics" data-fade>
              <span
                aria-hidden
                className="absolute left-0 top-0 rounded-full bg-accent shadow-[0_4px_16px_-4px_rgb(var(--glow)/0.7)] transition-[transform,width,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: thumb?.w ?? 0, height: thumb?.h ?? 0, transform: `translate(${thumb?.x ?? 0}px, ${thumb?.y ?? 0}px)`, opacity: thumb ? 1 : 0 }}
              />
              {faqCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  data-cat={c.id}
                  aria-selected={cat === c.id}
                  onClick={() => pick(c.id)}
                  className={`relative z-10 min-h-[40px] rounded-full px-4 text-sm font-semibold transition-colors duration-300 ${cat === c.id ? "text-[#0B1F4B]" : "text-muted hover:text-ink"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PointerGlow className="lg:col-span-8">
          <ul key={cat} onKeyDown={onKey} className="relative">
            {list.map((f, i) => {
              const on = open === i;
              return (
                <li key={f.q} className="faq-in group relative isolate border-t border-line last:border-b" style={{ ["--d" as string]: `${i * 0.05}s` }}>
                  {/* hover/active layers */}
                  <span aria-hidden className={`absolute -inset-x-3 inset-y-0.5 -z-10 origin-left rounded-2xl bg-accent/[0.07] transition-transform duration-700 ease-out ${on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  <span aria-hidden className={`absolute inset-y-3 -left-3 w-[3px] origin-top rounded-full bg-accent transition-transform duration-500 ${on ? "scale-y-100" : "scale-y-0"}`} />
                  <h3>
                    <button
                      type="button"
                      data-faq
                      id={`faq-q-${i}`}
                      aria-expanded={on}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(on ? -1 : i)}
                      className="flex min-h-[72px] w-full items-center gap-5 py-5 text-left"
                    >
                      <span className={`w-7 font-mono text-xs tabular-nums transition-colors duration-300 ${on ? "text-accent-text" : "text-muted group-hover:text-accent-text"}`}>{String(i + 1).padStart(2, "0")}</span>
                      <span className={`flex-1 font-display text-[1.18rem] font-semibold leading-snug tracking-tight [text-wrap:balance] transition-all duration-500 sm:text-[1.4rem] ${on ? "translate-x-1 text-ink" : "text-ink/75 group-hover:translate-x-1.5 group-hover:text-ink"}`}>{f.q}</span>
                      <span aria-hidden className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${on ? "border-transparent bg-accent" : "border-line group-hover:border-accent"}`}>
                        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full -rotate-90">
                          <circle cx="20" cy="20" r="19" fill="none" stroke="rgb(var(--accent))" strokeWidth="1.5" pathLength={1} strokeDasharray="1" strokeDashoffset={on ? 0 : 1} className="transition-[stroke-dashoffset] duration-700 ease-out" />
                        </svg>
                        <span className={`absolute h-[1.5px] w-3.5 rounded-full transition-colors duration-300 ${on ? "bg-[#0B1F4B]" : "bg-ink"}`} />
                        <span className={`absolute h-3.5 w-[1.5px] rounded-full transition-all duration-500 ${on ? "scale-y-0 bg-[#0B1F4B]" : "bg-ink"}`} />
                      </span>
                    </button>
                  </h3>
                  <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className={`max-w-[64ch] pb-7 pl-12 pr-4 text-[1.03rem] leading-[1.7] text-muted transition-all duration-700 ease-out sm:pl-[3.1rem] ${on ? "translate-y-0 opacity-100 delay-150" : "-translate-y-3 opacity-0"}`}>{f.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </PointerGlow>
      </div>
    </section>
  );
}

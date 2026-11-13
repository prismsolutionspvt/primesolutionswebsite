"use client";
import { useMemo, useState } from "react";
import { faqCategories, faqIntro, faqs } from "@/content";
import { Split } from "@/components/ui/Split";
import type { FaqCategoryId } from "@/types";

export function Faq() {
  const [cat, setCat] = useState<FaqCategoryId | "all">("all");
  const [open, setOpen] = useState<number>(0);
  const list = useMemo(() => faqs.filter((f) => cat === "all" || f.category === cat), [cat]);

  const pick = (id: FaqCategoryId | "all") => {
    setCat(id);
    setOpen(0);
  };

  return (
    <section id="faq" className="relative bg-surface py-20 sm:py-28 lg:py-36">
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
          <p className="eyebrow mb-6" data-fade>
            {faqIntro.eyebrow}
          </p>
          <Split as="h2" className="h-display text-[clamp(2.2rem,6.4vw,3.8rem)] lg:text-[clamp(2.4rem,3.6vw,3.8rem)]" accent={["asked."]}>
            {"Questions, asked."}
          </Split>
          <p className="mt-5 max-w-xs text-[1.02rem] leading-relaxed text-muted" data-fade>
            {faqIntro.heading}
          </p>
          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="FAQ topics" data-fade>
            {faqCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => pick(c.id)}
                className={`min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-all duration-300 ${cat === c.id ? "border-accent bg-accent text-[#0B1F4B]" : "border-line text-muted hover:border-ink/40 hover:text-ink"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="lg:col-span-8" key={cat}>
          {list.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="faq-in group border-t border-line last:border-b" style={{ ["--d" as string]: `${i * 0.05}s` }}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? -1 : i)}
                    className="flex min-h-[68px] w-full items-center gap-5 py-5 text-left"
                  >
                    <span className={`font-mono text-xs tabular-nums transition-colors ${on ? "text-accent-text" : "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={`flex-1 font-display text-[1.12rem] font-semibold leading-snug tracking-tight transition-all duration-300 sm:text-[1.3rem] ${on ? "translate-x-1 text-ink" : "text-ink/75 group-hover:translate-x-1 group-hover:text-ink"}`}>{f.q}</span>
                    <span aria-hidden className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line transition-colors group-hover:border-accent">
                      <span className="absolute h-px w-3.5 bg-ink" />
                      <span className={`absolute h-3.5 w-px bg-ink transition-transform duration-500 ${on ? "scale-y-0" : ""}`} />
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[62ch] pb-7 pl-[calc(1.25rem+1.4rem)] text-[1.02rem] leading-relaxed text-muted">{f.a}</p>
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

"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { faqs } from "@/content";
import { Split } from "@/components/ui/Split";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-20 sm:py-28 lg:py-32">
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
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div>
            <p className="eyebrow mb-6" data-fade>
              FAQ
            </p>
            <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,4.4rem)] lg:text-[clamp(2.6rem,4vw,4.4rem)]" accent={["asked."]}>
              {"Questions, asked."}
            </Split>
            <p className="mt-5 max-w-xs text-[1.02rem] leading-relaxed text-muted" data-fade>
              Can&apos;t find what you are looking for? Send us a message and we will answer it directly.
            </p>
          </div>
        </div>
        <ul className="lg:col-span-8">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-t border-line last:border-b" data-fade>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex min-h-[60px] w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className={`font-display text-[1.2rem] font-semibold leading-snug tracking-tight transition-colors sm:text-[1.3rem] ${on ? "text-ink" : "text-ink/75"}`}>{f.q}</span>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${on ? "rotate-45 border-accent bg-accent text-navy" : "border-line"}`}>
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[60ch] pb-7 text-[1.02rem] leading-relaxed text-muted">{f.a}</p>
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

"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { services } from "@/content";
import type { Service } from "@/types";
import { Split } from "@/components/ui/Split";
import { ServiceGlyph } from "./ServiceGlyph";

function Detail({ s, compact = false }: { s: Service; compact?: boolean }) {
  return (
    <div>
      <p className="max-w-[40ch] text-[1.05rem] leading-relaxed text-ink">{s.summary}</p>
      <ul className={`mt-6 grid gap-x-8 gap-y-2.5 ${s.items.length > 5 && !compact ? "sm:grid-cols-2" : ""}`}>
        {s.items.map((it) => (
          <li key={it} className="flex items-start gap-3 text-[0.95rem] leading-snug text-muted">
            <span className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {it}
          </li>
        ))}
      </ul>
      <p className="mt-6 border-l-2 border-accent pl-4 text-[0.92rem] leading-relaxed text-muted">
        <span className="font-semibold text-ink">Where it fits. </span>
        {s.fit}
      </p>
      <a
        href="#contact"
        onClick={() => window.dispatchEvent(new CustomEvent("prism:service-interest", { detail: s.id }))}
        className="btn btn-ghost group mt-7 !min-h-[44px]"
      >
        Ask about {s.short}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>
  );
}

export function Services() {
  const [active, setActive] = useState(services[0].id);
  const root = useRef<HTMLElement>(null);
  const current = services.find((s) => s.id === active)!;

  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (services.some((s) => s.id === id)) setActive(id);
    };
    window.addEventListener("prism:service", on);
    return () => window.removeEventListener("prism:service", on);
  }, []);

  const hoverable = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;

  return (
    <section ref={root} id="services" className="relative bg-surface2/50 py-20 sm:py-28 lg:py-32">
      <div className="wrap">
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6" data-fade>
              Our Services
            </p>
            <Split as="h2" className="h-display text-[clamp(2.3rem,7.4vw,6rem)] lg:text-[clamp(3rem,5.6vw,6rem)]" accent={["partner."]}>
              {"Seven services.\nOne integrated partner."}
            </Split>
          </div>
          <p className="max-w-md text-[1.05rem] leading-relaxed text-muted lg:col-span-4" data-fade>
            Pick one or combine several. Digital marketing is our core focus.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          {/* list */}
          <ul className="lg:col-span-7" role="list">
            {services.map((s) => {
              const on = s.id === active;
              return (
                <li key={s.id} className="border-t border-line last:border-b" data-fade>
                  <button
                    type="button"
                    id={`svc-${s.id}`}
                    aria-expanded={on}
                    aria-controls={`svc-panel-${s.id}`}
                    onMouseEnter={() => hoverable() && setActive(s.id)}
                    onFocus={() => hoverable() && setActive(s.id)}
                    onClick={() => setActive(s.id)}
                    className="group relative flex w-full items-center gap-4 py-5 text-left sm:gap-7 sm:py-6 lg:py-7"
                  >
                    <span className={`font-mono text-xs transition-colors sm:text-sm ${on ? "text-accent-text" : "text-muted"}`}>{s.index}</span>
                    <span
                      className={`h-display flex-1 transition-all duration-500 ease-out ${
                        s.core ? "text-[clamp(1.7rem,6.4vw,3.8rem)]" : "text-[clamp(1.45rem,5.4vw,3.1rem)]"
                      } ${on ? "translate-x-1 text-ink lg:translate-x-3" : "text-ink/45 group-hover:text-ink/75"}`}
                    >
                      {s.name}
                      {s.core && (
                        <span className="ml-3 hidden translate-y-[-0.35em] rounded-full border border-accent/60 px-2.5 py-1 align-middle font-mono text-[0.6rem] font-medium uppercase tracking-[0.18em] text-accent-text sm:inline-block">
                          Core focus
                        </span>
                      )}
                    </span>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${on ? "rotate-45 border-accent bg-accent text-navy" : "border-line text-ink"}`}>
                      <Plus className="h-4 w-4" />
                    </span>
                    <span className={`absolute inset-x-0 bottom-[-1px] h-px origin-left bg-accent transition-transform duration-700 ease-out ${on ? "scale-x-100" : "scale-x-0"}`} />
                  </button>

                  {/* mobile / tablet inline panel */}
                  <div
                    id={`svc-panel-${s.id}`}
                    role="region"
                    aria-labelledby={`svc-${s.id}`}
                    className={`grid transition-[grid-template-rows] duration-500 ease-out lg:hidden ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col-reverse gap-6 pb-8 pt-1 sm:grid sm:grid-cols-[1fr_minmax(0,16rem)] sm:items-start sm:gap-8">
                        <Detail s={s} compact />
                        <div className="rounded-2xl border border-line bg-surface p-4">{on && <ServiceGlyph id={s.id} />}</div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* desktop sticky panel */}
          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="sticky top-28">
              <div key={current.id} className="panel-in overflow-hidden rounded-[2rem] border border-line bg-surface p-8 xl:p-10">
                <div className="flex items-start justify-between gap-6">
                  <p className="eyebrow">
                    {current.index} / 07{current.core ? " — Core focus" : ""}
                  </p>
                </div>
                <div className="my-6 rounded-2xl bg-surface2/70 p-6">
                  <ServiceGlyph id={current.id} className="mx-auto h-auto w-full max-w-[340px]" />
                </div>
                <h3 className="h-display text-3xl">{current.name}</h3>
                <div className="mt-5">
                  <Detail s={current} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

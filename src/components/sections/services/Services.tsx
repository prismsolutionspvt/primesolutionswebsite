"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { serviceGroups, services } from "@/content";
import { Split } from "@/components/ui/Split";
import { ServiceDetail } from "./ServiceDetail";
import { ServiceGlyph } from "./ServiceGlyph";

export function Services() {
  const [active, setActive] = useState(services[0].id);
  const stage = useRef<HTMLDivElement>(null);
  const current = services.find((s) => s.id === active)!;
  const groupOf = (id: string) => serviceGroups.find((g) => g.id === id)!;

  // jump to a service from the nav menu or the hero rays
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (services.some((s) => s.id === id)) setActive(id);
    };
    window.addEventListener("prism:service", on);
    return () => window.removeEventListener("prism:service", on);
  }, []);

  // choreograph the stage whenever the service changes
  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-s-title] .sp-m > span", { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.04 });
      gsap.fromTo("[data-stage-in] > *", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.06, delay: 0.1 });
    }, el);
    return () => ctx.revert();
  }, [active]);

  const hoverable = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = services.findIndex((s) => s.id === active);
    const next = services[(i + (e.key === "ArrowDown" ? 1 : services.length - 1)) % services.length];
    setActive(next.id);
    document.getElementById(`svc-${next.id}`)?.focus();
  };

  return (
    <section id="services" className="relative bg-surface py-20 sm:py-28 lg:py-36">
      <div className="wrap">
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6" data-fade>
              Our Services
            </p>
            <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,5.6rem)] lg:text-[clamp(2.8rem,5.2vw,5.6rem)]" accent={["partner."]}>
              {"BPO and digital services from one partner."}
            </Split>
          </div>
          <p className="max-w-md text-[1.05rem] leading-relaxed text-muted lg:col-span-4" data-fade>
            Seven services across customer operations, business operations and digital growth. Choose one function or combine several.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          {/* list, grouped so it is obvious what Prism does */}
          <div className="lg:col-span-6" onKeyDown={onKey}>
            {serviceGroups.map((g) => (
              <Fragment key={g.id}>
                <p className="mb-1 mt-8 flex items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-accent-text first:mt-0" data-fade>
                  <span className="h-px w-6 bg-accent" />
                  {g.label}
                </p>
                <ul role="list">
                  {services
                    .filter((s) => s.group === g.id)
                    .map((s) => {
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
                            className="group relative flex w-full items-center gap-4 py-4 text-left sm:gap-6 sm:py-5"
                          >
                            <span className={`absolute inset-y-0 -left-4 hidden w-[3px] origin-center rounded-full bg-accent transition-transform duration-500 lg:block ${on ? "scale-y-100" : "scale-y-0"}`} />
                            <span className={`font-mono text-xs transition-colors sm:text-sm ${on ? "text-accent-text" : "text-muted"}`}>{s.index}</span>
                            <span className={`h-display flex-1 text-[clamp(1.4rem,5.2vw,2.5rem)] transition-all duration-500 ease-out ${on ? "translate-x-1 text-ink lg:translate-x-3" : "text-ink/45 group-hover:text-ink/80"}`}>{s.name}</span>
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${on ? "rotate-45 border-accent bg-accent text-navy" : "border-line text-ink"}`}>
                              <Plus className="h-4 w-4" />
                            </span>
                          </button>

                          {/* mobile / tablet inline panel */}
                          <div id={`svc-panel-${s.id}`} role="region" aria-labelledby={`svc-${s.id}`} className={`grid transition-[grid-template-rows] duration-500 ease-out lg:hidden ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                            <div className="overflow-hidden">
                              {on && (
                                <div className="flex flex-col gap-6 pb-8 pt-2">
                                  <div className="rounded-2xl bg-surface2 p-4">
                                    <ServiceGlyph id={s.id} className="mx-auto h-auto w-full max-w-[300px]" />
                                  </div>
                                  <ServiceDetail s={s} key={s.id} />
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </Fragment>
            ))}
          </div>

          {/* desktop stage */}
          <div className="relative hidden lg:col-span-6 lg:block">
            <div className="sticky top-28" ref={stage}>
              <div className="overflow-hidden rounded-[2rem] border border-line bg-bg p-8 xl:p-10">
                <p className="eyebrow flex items-center justify-between">
                  <span>{groupOf(current.group).label}</span>
                  <span className="text-muted">{current.index} / 07</span>
                </p>
                <div className="my-6 rounded-2xl bg-surface2 p-6">
                  <ServiceGlyph key={current.id} id={current.id} className="mx-auto h-auto w-full max-w-[380px]" />
                </div>
                <h3 data-s-title className="h-display text-[2rem] xl:text-[2.4rem]" aria-label={current.name}>
                  {current.name.split(" ").map((w, i) => (
                    <span key={i} className="sp-m mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-top" aria-hidden>
                      <span className="inline-block">{w}</span>
                    </span>
                  ))}
                </h3>
                <div className="mt-5">
                  <ServiceDetail s={current} key={current.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

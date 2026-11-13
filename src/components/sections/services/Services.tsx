"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { adaptiveProps } from "@/config/adaptive";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { serviceGroups, services, servicesIntro } from "@/content";
import { Split } from "@/components/ui/Split";
import { ServiceDetail } from "./ServiceDetail";
import { ServiceGlyph } from "./ServiceGlyph";

/**
 * The approved animated stage (glyph draw, masked title, staggered details) is unchanged.
 * The LIST is what changed: every service now shows its name AND a one-line description at a glance,
 * grouped under plain-language headings, so a visitor can see what Prism offers without opening anything.
 */
export function Services() {
  const [active, setActive] = useState(services[0].id);
  const stage = useRef<HTMLDivElement>(null);
  const current = services.find((s) => s.id === active)!;
  const groupOf = (id: string) => serviceGroups.find((g) => g.id === id)!;

  // jump to a service from the nav menu, the hero rays or an industry's service chips
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
    <section id="services" {...adaptiveProps("services")} className="relative bg-surface py-20 sm:py-28 lg:py-32">
      <div className="wrap">
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6" data-fade>
              {servicesIntro.eyebrow}
            </p>
            <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,5.4rem)] lg:text-[clamp(2.8rem,4.9vw,5.4rem)]" accent={["partner."]}>
              {servicesIntro.heading}
            </Split>
          </div>
          <p className="max-w-lg text-[1.02rem] leading-relaxed text-muted lg:col-span-5 lg:justify-self-end" data-fade>
            {servicesIntro.text}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          {/* list, grouped so it is obvious what Prism does */}
          <div className="min-w-0 lg:col-span-6" onKeyDown={onKey}>
            {serviceGroups.map((g) => (
              <Fragment key={g.id}>
                <p className="mb-1 mt-7 flex items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-accent-text first:mt-0" data-fade>
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
                            className="group relative isolate flex w-full items-center gap-4 py-4 text-left sm:gap-5 sm:py-[1.05rem]"
                          >
                            {/* layered hover reveal: a soft sweep behind the row, plus the active bar */}
                            <span aria-hidden className={`absolute -inset-x-3 inset-y-1 -z-10 origin-left rounded-2xl bg-accent/[0.08] transition-transform duration-700 ease-out ${on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                            <span className={`absolute inset-y-2 -left-4 hidden w-[3px] origin-center rounded-full bg-accent transition-transform duration-500 lg:block ${on ? "scale-y-100" : "scale-y-0"}`} />
                            <span className={`w-6 font-mono text-xs transition-colors sm:text-sm ${on ? "text-accent-text" : "text-muted"}`}>{s.index}</span>
                            <span className="min-w-0 flex-1">
                              <span className={`block h-display text-[clamp(1.3rem,4.8vw,2rem)] transition-all duration-500 ease-out ${on ? "translate-x-1 text-ink" : "text-ink/70 group-hover:translate-x-1 group-hover:text-ink"}`}>{s.name}</span>
                              <span className={`mt-1 block max-w-[46ch] text-[0.92rem] leading-snug transition-colors duration-500 ${on ? "text-ink/80" : "text-muted"}`}>{s.tagline}</span>
                            </span>
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${on ? "rotate-45 border-accent bg-accent text-navy" : "border-line text-ink group-hover:border-accent group-hover:text-accent-text"}`}>
                              <Plus className="h-4 w-4" />
                            </span>
                          </button>

                          {/* mobile / tablet inline panel */}
                          <div id={`svc-panel-${s.id}`} role="region" aria-labelledby={`svc-${s.id}`} className={`grid transition-[grid-template-rows] duration-500 ease-out lg:hidden ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                            <div className="overflow-hidden">
                              {on && (
                                <div className="flex flex-col gap-6 pb-8 pt-2">
                                  <div className="rounded-2xl bg-surface2 p-4">
                                    <ServiceGlyph id={s.id} className="mx-auto h-auto w-full max-w-[280px]" />
                                  </div>
                                  <ServiceDetail s={s} key={s.id} twoColumns />
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
            <div className="sticky top-24" ref={stage}>
              <div className="overflow-hidden rounded-[2rem] border border-line bg-bg p-7 xl:p-9">
                <p className="eyebrow flex items-center justify-between">
                  <span>{groupOf(current.group).label}</span>
                  <span className="text-muted">
                    {current.index} / {String(services.length).padStart(2, "0")}
                  </span>
                </p>
                <div className="my-5 rounded-2xl bg-surface2 p-4">
                  <ServiceGlyph key={current.id} id={current.id} className="mx-auto h-auto w-full max-w-[270px]" />
                </div>
                <h3 data-s-title className="h-display text-[1.9rem] xl:text-[2.25rem]" aria-label={current.name}>
                  {current.name.split(" ").map((w, i) => (
                    <span key={i} className="sp-m mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-top" aria-hidden>
                      <span className="inline-block">{w}</span>
                    </span>
                  ))}
                </h3>
                <div className="mt-4">
                  <ServiceDetail s={current} key={current.id} twoColumns />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

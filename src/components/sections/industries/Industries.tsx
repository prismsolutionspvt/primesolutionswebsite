"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { adaptiveProps } from "@/config/adaptive";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useContent } from "@/components/providers/ContentProvider";
import { Split } from "@/components/ui/Split";
import { IndustryScene } from "./IndustryScene";

/* Complementary tones that sit next to the logo's navy and orange. Used only inside the scenes. */
const TONES: Record<string, string> = {
  healthcare: "#3C8D9B",
  "real-estate": "#C47A52",
  ecommerce: "#E3A23B",
  saas: "#5B72B0",
  "professional-services": "#6A7A94",
  "finance-insurance": "#2F8071",
};

export function Industries() {
  const { industries, industriesIntro, services } = useContent();
  const [active, setActive] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const ind = industries[active];
  const tone = TONES[ind.id] ?? "#5B72B0";

  // depth: layers answer the pointer and the scroll; content rises in on every change
  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-ind-in]", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.07 });
      gsap.fromTo("[data-scene]", { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" });
      const layers = gsap.utils.toArray<SVGGElement>("[data-layer]");
      layers.forEach((l, i) => {
        gsap.fromTo(l, { y: (i + 1) * 14 }, { y: (i + 1) * -14, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.matchMedia().add("(hover: hover) and (pointer: fine)", () => {
        const setters = layers.map((l, i) => gsap.quickTo(l, "x", { duration: 0.9, ease: "power3.out", ...(i === -1 ? {} : {}) }));
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          setters.forEach((s, i) => s(nx * (i + 1) * 22));
        };
        el.addEventListener("pointermove", onMove);
        return () => el.removeEventListener("pointermove", onMove);
      });
    }, el);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [active]);

  const hoverable = () => window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;

  return (
    <section id="industries" {...adaptiveProps("industries")} className="relative py-20 sm:py-28 lg:py-36">
      <div className="wrap">
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6" data-fade>
              {industriesIntro.eyebrow}
            </p>
            <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,5.2rem)] lg:text-[clamp(2.8rem,4.8vw,5.2rem)]" accent={["fit."]}>
              {industriesIntro.heading}
            </Split>
          </div>
          <p className="max-w-md text-[1.05rem] leading-relaxed text-muted lg:col-span-5" data-fade>
            {industriesIntro.text}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          {/* selector: pills on mobile, editorial index on desktop */}
          <div className="min-w-0 lg:col-span-5">
            <ul role="tablist" aria-label="Industries" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:block lg:overflow-visible lg:px-0">
              {industries.map((it, i) => {
                const on = i === active;
                return (
                  <li key={it.id} role="presentation" className="shrink-0 lg:border-t lg:border-line lg:last:border-b">
                    <button
                      type="button"
                      role="tab"
                      id={`ind-tab-${it.id}`}
                      aria-selected={on}
                      aria-controls="ind-stage"
                      onMouseEnter={() => hoverable() && setActive(i)}
                      onFocus={() => hoverable() && setActive(i)}
                      onClick={() => setActive(i)}
                      className={`group relative flex min-h-[44px] items-center gap-4 rounded-full border px-4 text-[0.92rem] font-semibold transition-colors lg:min-h-0 lg:w-full lg:rounded-none lg:border-0 lg:px-0 lg:py-5 ${
                        on ? "border-accent bg-accent/10 text-ink" : "border-line text-muted hover:text-ink"
                      }`}
                    >
                      <span className="hidden font-mono text-xs text-muted lg:block">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`lg:h-display lg:text-[clamp(1.5rem,2.4vw,2.2rem)] lg:font-semibold lg:transition-all lg:duration-500 ${on ? "lg:translate-x-2 lg:text-ink" : "lg:text-ink/40 lg:group-hover:text-ink/75"}`}>{it.name}</span>
                      <span className={`absolute inset-x-0 bottom-[-1px] hidden h-px origin-left bg-accent transition-transform duration-700 ease-out lg:block ${on ? "scale-x-100" : "scale-x-0"}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* stage */}
          <div className="min-w-0 lg:col-span-7" ref={stage}>
            <div id="ind-stage" role="tabpanel" aria-labelledby={`ind-tab-${ind.id}`} className="overflow-hidden rounded-[2rem] border border-line bg-surface">
              <div data-scene className="relative aspect-[4/3] w-full sm:aspect-[16/10]" style={{ background: `linear-gradient(135deg, ${tone}26 0%, transparent 62%)` }}>
                <IndustryScene key={ind.id} kind={ind.scene} tone={tone} />
              </div>
              <div className="p-6 sm:p-8">
                <h3 data-ind-in className="h-display text-[clamp(1.7rem,3vw,2.5rem)]">
                  {ind.name}
                </h3>
                <p data-ind-in className="mt-2 max-w-[46ch] text-[1.02rem] leading-relaxed text-muted">
                  {ind.summary}
                </p>
                <p data-ind-in className="mb-3 mt-6 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-accent-text">
                  Prism services that fit
                </p>
                <ul className="flex flex-wrap gap-2">
                  {ind.fits.map((id) => {
                    const svc = services.find((x) => x.id === id);
                    if (!svc) return null;
                    return (
                      <li key={id} data-ind-in>
                        <a
                          href="#services"
                          onClick={() => window.dispatchEvent(new CustomEvent("prism:service", { detail: id }))}
                          className="chip-link group inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-line px-3.5 text-[0.88rem] font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-[#0B1F4B]"
                        >
                          {svc.name}
                          <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                        </a>
                      </li>
                    );
                  })}
                </ul>
                {ind.note && (
                  <p data-ind-in className="mt-5 border-l-2 pl-4 text-[0.88rem] leading-relaxed text-muted" style={{ borderColor: tone }}>
                    {ind.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted" data-fade>
          {industriesIntro.disclaimer}
        </p>
      </div>
    </section>
  );
}

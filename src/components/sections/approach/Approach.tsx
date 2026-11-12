"use client";
import { useEffect, useRef } from "react";
import { approach } from "@/content";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { Split } from "@/components/ui/Split";

/** Five stages on one line (desktop) or one short column (mobile). One beam draws across them on scroll-in. */
export function Approach() {
  const root = useRef<HTMLElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const dots = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !beam.current || !dots.current) return;
    const reduce = prefersReducedMotion();
    if (reduce) {
      beam.current.style.transform = "none";
      return;
    }
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-stage]");
      gsap.set(items, { opacity: 0.3 });
      ScrollTrigger.create({
        trigger: dots.current,
        start: "top 75%",
        end: "bottom 55%",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          const vertical = window.innerWidth < 1024;
          beam.current!.style.transform = vertical ? `scaleY(${p})` : `scaleX(${p})`;
          items.forEach((it, i) => {
            const on = p >= i / (items.length - 0.4);
            it.style.opacity = on ? "1" : "0.3";
            it.dataset.on = on ? "1" : "0";
          });
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="approach" className="relative bg-surface2/50 py-20 sm:py-28 lg:py-32">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow mb-6" data-fade>
              Our Approach
            </p>
            <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,5rem)] lg:text-[clamp(2.6rem,4.8vw,5rem)]" accent={["Execution."]}>
              {approach.heading}
            </Split>
          </div>
          <p className="max-w-xs text-[1.02rem] leading-relaxed text-muted" data-fade>
            Five clear stages, so you always know where the work stands.
          </p>
        </div>

        <ol ref={dots} className="relative mt-14 grid gap-9 lg:mt-20 lg:grid-cols-5 lg:gap-6">
          <div aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-line lg:bottom-auto lg:left-0 lg:right-0 lg:top-[15px] lg:h-px lg:w-auto">
            <div ref={beam} className="absolute inset-0 origin-top scale-y-0 bg-accent lg:origin-left lg:scale-x-0 lg:scale-y-100" />
          </div>
          {approach.stages.map((s) => (
            <li key={s.n} data-stage className="group relative pl-12 lg:pl-0 lg:pt-14">
              <span className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border border-line bg-bg font-mono text-[0.66rem] text-muted transition-colors duration-500 group-data-[on='1']:border-accent group-data-[on='1']:bg-accent group-data-[on='1']:text-[#0B1F4B]">
                {s.n}
              </span>
              <h3 className="font-display text-2xl font-semibold tracking-tight">{s.name}</h3>
              <p className="mt-2 max-w-[28ch] text-[0.95rem] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

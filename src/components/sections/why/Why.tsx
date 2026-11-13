"use client";
import { useEffect, useRef, useState } from "react";
import { registerGsap } from "@/lib/gsap";
import { why } from "@/content";
import { Split } from "@/components/ui/Split";
import { WhyRing } from "./WhyRing";

const N = why.items.length;

export function Why() {
  const [active, setActive] = useState(0);
  const pin = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);

  // desktop: pinned, scroll turns the ring.  mobile: connected vertical story with a beam that fills as you scroll.
  useEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: pin.current,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.min(N - 1, Math.floor(self.progress * N));
          setActive((p) => (p === idx ? p : idx));
        },
      });
      return () => st.kill();
    });
    mm.add("(max-width: 1023px)", () => {
      const rows = list.current ? Array.from(list.current.querySelectorAll<HTMLElement>("[data-row]")) : [];
      const io = new IntersectionObserver(
        (es) => es.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.row))),
        { rootMargin: "-40% 0px -50% 0px" },
      );
      rows.forEach((r) => io.observe(r));
      const st = line.current
        ? ScrollTrigger.create({
            trigger: list.current,
            start: "top 65%",
            end: "bottom 55%",
            scrub: 0.4,
            onUpdate: (self) => line.current && (line.current.style.transform = `scaleY(${self.progress})`),
          })
        : null;
      return () => {
        io.disconnect();
        st?.kill();
      };
    });
    return () => mm.revert();
  }, []);

  // swap the active reason's text with a masked rise
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-t] > span", { yPercent: 105 }, { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.05 });
      gsap.fromTo("[data-d]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: "power3.out" });
    }, el);
    return () => ctx.revert();
  }, [active]);

  const cur = why.items[active];

  return (
    <section id="why" className="relative">
      {/* desktop: pinned scene */}
      <div ref={pin} className="hidden min-h-screen items-center py-24 lg:flex">
        <div className="wrap w-full">
          <p className="eyebrow mb-5">{why.eyebrow}</p>
          <h2 className="h-display max-w-[20ch] text-[clamp(2.4rem,4.4vw,4.6rem)]">
            Why businesses choose <span className="text-accent">Prism&nbsp;Solutions.</span>
          </h2>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6 xl:col-span-5">
              <WhyRing count={N} active={active} onSelect={setActive} labels={why.items.map((r) => r.title)} />
            </div>
            <div ref={textRef} className="lg:col-span-6 xl:col-span-6 xl:col-start-7" aria-live="polite">
              <p className="font-display text-[6rem] font-semibold leading-none tracking-tightest text-accent/90 tabular-nums">{String(active + 1).padStart(2, "0")}</p>
              <h3 className="h-display mt-2 text-[clamp(1.9rem,3.2vw,3.2rem)]" aria-label={cur.title}>
                {cur.title.split(" ").map((w, i) => (
                  <span key={i} data-t className="mr-[0.25em] inline-block overflow-hidden pb-[0.1em] align-top" aria-hidden>
                    <span className="inline-block">{w}</span>
                  </span>
                ))}
              </h3>
              <p data-d className="mt-5 max-w-md text-lg leading-relaxed text-muted">
                {cur.text}
              </p>
              <div className="mt-8 flex items-center gap-1.5" aria-hidden>
                {why.items.map((_, i) => (
                  <span key={i} className={`h-[3px] rounded-full transition-all duration-500 ${i === active ? "w-10 bg-accent" : "w-4 bg-line"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile / tablet: connected story */}
      <div className="wrap py-20 sm:py-28 lg:hidden">
        <p className="eyebrow mb-6" data-fade>
          {why.eyebrow}
        </p>
        <Split as="h2" className="h-display text-[clamp(2.3rem,9vw,4rem)]" accent={["Prism", "Solutions."]}>
          {why.heading}
        </Split>
        <div className="relative mt-12">
          <div aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-line sm:left-[19px]">
            <div ref={line} className="absolute inset-0 origin-top scale-y-0 bg-accent" />
          </div>
          <ol ref={list} className="space-y-9">
            {why.items.map((it, i) => (
              <li key={it.title} data-row={i} className="relative pl-12 sm:pl-16">
                <span className={`absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border font-mono text-[0.66rem] transition-all duration-500 sm:h-10 sm:w-10 sm:text-xs ${i <= active ? "border-accent bg-accent text-[#0B1F4B]" : "border-line bg-bg text-muted"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={`transition-opacity duration-500 ${i <= active ? "opacity-100" : "opacity-45"}`}>
                  <h3 className="font-display text-[1.45rem] font-semibold leading-tight tracking-tight sm:text-[1.8rem]">{it.title}</h3>
                  <p className="mt-2 max-w-[44ch] text-[1rem] leading-relaxed text-muted">{it.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

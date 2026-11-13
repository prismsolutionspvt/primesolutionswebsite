"use client";
import { useEffect, useRef, useState } from "react";
import { approach } from "@/content";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { Split } from "@/components/ui/Split";
import { ApproachScene } from "./ApproachScene";

const N = approach.stages.length;

/** Desktop: the section pins and scroll moves a beam through five connected scenes.
 *  Mobile: a connected vertical sequence where each scene draws as it enters the screen. */
export function Approach() {
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState<boolean[]>(() => Array(N).fill(false));
  const pin = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: pin.current,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 2.6)}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.3,
        onUpdate: (self) => {
          if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          const idx = Math.min(N - 1, Math.floor(self.progress * N));
          setStep((p) => (p === idx ? p : idx));
        },
      });
      return () => st.kill();
    });
    mm.add("(max-width: 1023px)", () => {
      const rows = list.current ? Array.from(list.current.querySelectorAll<HTMLElement>("[data-stage]")) : [];
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            const i = Number((e.target as HTMLElement).dataset.stage);
            setSeen((s) => (s[i] ? s : s.map((v, k) => (k === i ? true : v))));
            setStep(i);
          }),
        { rootMargin: "-25% 0px -45% 0px" },
      );
      rows.forEach((r) => io.observe(r));
      const st = ScrollTrigger.create({
        trigger: list.current,
        start: "top 65%",
        end: "bottom 55%",
        scrub: 0.4,
        onUpdate: (self) => rail.current && (rail.current.style.transform = `scaleY(${self.progress})`),
      });
      return () => {
        io.disconnect();
        st.kill();
      };
    });
    return () => mm.revert();
  }, []);

  // desktop: wipe + rise on each stage change
  useEffect(() => {
    const el = stageRef.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-scene-wrap]", { clipPath: "circle(0% at 0% 100%)", opacity: 0.2 }, { clipPath: "circle(150% at 0% 100%)", opacity: 1, duration: 0.9, ease: "power3.inOut" });
      gsap.fromTo("[data-st] > span", { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.05 });
      gsap.fromTo("[data-sd]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: "power3.out" });
    }, el);
    return () => ctx.revert();
  }, [step]);

  const cur = approach.stages[step];

  return (
    <section id="approach" className="relative bg-surface">
      {/* desktop: pinned scene */}
      <div ref={pin} className="hidden min-h-screen items-center py-24 lg:flex">
        <div className="wrap w-full">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="eyebrow mb-5">{approach.eyebrow}</p>
              <h2 className="h-display text-[clamp(2.4rem,4.4vw,4.4rem)]">
                {approach.heading.replace(".", "")}
                <span className="text-accent">.</span>
              </h2>
            </div>
            <p className="max-w-xs pb-2 text-[1.02rem] leading-relaxed text-muted">{approach.text}</p>
          </div>

          <div ref={stageRef} className="mt-10 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5" aria-live="polite">
              <p className="font-display text-[7rem] font-semibold leading-none tracking-tightest text-accent/90 tabular-nums">{cur.n}</p>
              <h3 className="h-display mt-1 text-[clamp(2.2rem,3.6vw,3.6rem)]" aria-label={cur.name}>
                <span data-st className="inline-block overflow-hidden pb-[0.1em] align-top" aria-hidden>
                  <span className="inline-block">{cur.name}</span>
                </span>
              </h3>
              <p data-sd className="mt-5 max-w-sm text-lg leading-relaxed text-muted">
                {cur.text}
              </p>
            </div>
            <div className="lg:col-span-7">
              <div data-scene-wrap className="aspect-[4/3] overflow-hidden rounded-[2rem] border border-line bg-bg p-6 xl:aspect-[16/10]">
                <ApproachScene key={step} step={step} />
              </div>
            </div>
          </div>

          {/* connected rail */}
          <div className="mt-10">
            <div className="relative h-px bg-line">
              <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-accent" />
              <ol className="absolute inset-x-0 -top-[15px] flex justify-between px-1">
                {approach.stages.map((s, i) => (
                  <li key={s.n} className="flex flex-col items-center">
                    <span className={`grid h-[30px] w-[30px] place-items-center rounded-full border font-mono text-[0.62rem] transition-all duration-500 ${i <= step ? "border-accent bg-accent text-[#0B1F4B]" : "border-line bg-bg text-muted"}`}>{s.n}</span>
                    <span className={`mt-3 text-sm font-semibold transition-colors ${i === step ? "text-ink" : "text-muted"}`}>{s.name}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* mobile / tablet: connected vertical sequence */}
      <div className="wrap py-20 sm:py-28 lg:hidden">
        <p className="eyebrow mb-6" data-fade>
          {approach.eyebrow}
        </p>
        <Split as="h2" className="h-display text-[clamp(2.4rem,10vw,4rem)]" accent={["work."]}>
          {approach.heading}
        </Split>
        <p className="mt-5 max-w-sm text-[1.02rem] leading-relaxed text-muted" data-fade>
          {approach.text}
        </p>
        <div className="relative mt-12">
          <div aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-line sm:left-[19px]">
            <div ref={rail} className="absolute inset-0 origin-top scale-y-0 bg-accent" />
          </div>
          <ol ref={list} className="space-y-12">
            {approach.stages.map((s, i) => (
              <li key={s.n} data-stage={i} className="relative pl-12 sm:pl-16">
                <span className={`absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border font-mono text-[0.66rem] transition-all duration-500 sm:h-10 sm:w-10 sm:text-xs ${i <= step ? "border-accent bg-accent text-[#0B1F4B]" : "border-line bg-surface text-muted"}`}>{s.n}</span>
                <h3 className="font-display text-[1.9rem] font-semibold leading-tight tracking-tight">{s.name}</h3>
                <p className="mt-2 max-w-[40ch] text-[1rem] leading-relaxed text-muted">{s.text}</p>
                <div className="mt-5 aspect-[4/3] max-w-md overflow-hidden rounded-2xl border border-line bg-bg p-4">{seen[i] && <ApproachScene step={i} />}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

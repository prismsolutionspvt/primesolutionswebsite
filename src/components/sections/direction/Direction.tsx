"use client";
import { useEffect, useRef } from "react";
import { adaptiveProps } from "@/config/adaptive";
import { direction } from "@/content";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { ScrollWords } from "@/components/ui/ScrollWords";

const STAR = "M0 -22 Q2.6 -2.6 22 0 Q2.6 2.6 0 22 Q-2.6 2.6 -22 0 Q-2.6 -2.6 0 -22Z";

/**
 * Mission and Vision as two distinct scenes, not two cards:
 *  – Mission is grounded and directional: left-weighted bold type, a path that rises to a star as you scroll.
 *  – Vision is expansive: lighter, larger type set to the right, with rings that open outward around a star.
 * The company-approved wording is revealed word by word as it is read.
 */
export function Direction() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      // mission: the path draws and the star rides it
      const path = el.querySelector<SVGPathElement>("[data-m-path]");
      const star = el.querySelector<SVGGElement>("[data-m-star]");
      if (path && star) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        const place = (p: number) => {
          const pt = path.getPointAtLength(len * Math.min(Math.max(p, 0.001), 1));
          star.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${p * 120})`);
          path.style.strokeDashoffset = String(len * (1 - p));
        };
        place(0);
        gsap.to({}, {
          scrollTrigger: { trigger: el.querySelector("[data-mission]"), start: "top 70%", end: "bottom 35%", scrub: 0.6, onUpdate: (s) => place(s.progress) },
        });
      }
      // vision: rings open outward, a dashed ring turns
      gsap.fromTo("[data-v-ring]", { scale: 0.55, opacity: 0.2 }, { scale: 1.12, opacity: 1, stagger: 0.12, ease: "none", transformOrigin: "50% 50%", scrollTrigger: { trigger: el.querySelector("[data-vision]"), start: "top 85%", end: "bottom 30%", scrub: 0.6 } });
      gsap.to("[data-v-spin]", { rotation: 180, transformOrigin: "50% 50%", ease: "none", scrollTrigger: { trigger: el.querySelector("[data-vision]"), start: "top bottom", end: "bottom top", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="direction" {...adaptiveProps("direction")} className="relative overflow-hidden" aria-label="Mission and vision">
      {/* MISSION */}
      <div data-mission className="relative flex min-h-[68svh] items-center py-20 sm:py-28 lg:py-32">
        <svg aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="xMinYMid slice" className="pointer-events-none absolute inset-0 h-full w-full opacity-40 lg:opacity-100">
          <path d="M-30 600 C 20 520, 120 440, 130 300 S 90 120, 190 -30" fill="none" style={{ stroke: "rgb(var(--chalk) / var(--chalk-o1))" }} strokeWidth="2" strokeLinecap="round" />
          <path data-m-path d="M-30 600 C 20 520, 120 440, 130 300 S 90 120, 190 -30" fill="none" stroke="rgb(var(--accent))" strokeWidth="4" strokeLinecap="round" />
          <g data-m-star>
            <circle r="34" fill="rgb(var(--accent))" fillOpacity=".16" />
            <path d={STAR} fill="rgb(var(--accent))" />
          </g>
        </svg>
        <div className="wrap relative grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <p className="eyebrow flex items-center gap-3" data-fade>
              <span className="h-px w-8 bg-accent" />
              {direction.mission.label}
            </p>
          </div>
          <ScrollWords
            text={direction.mission.text}
            highlights={direction.mission.highlights}
            className="font-display text-[clamp(1.75rem,3.5vw,3.2rem)] font-semibold leading-[1.14] tracking-tight lg:col-span-9"
          />
        </div>
      </div>

      {/* VISION */}
      <div data-vision className="relative flex min-h-[68svh] items-center py-20 sm:py-28 lg:py-32">
        <svg aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
          {[90, 170, 250, 330].map((r, i) => (
            <circle key={r} data-v-ring cx="1010" cy="300" r={r} fill="none" strokeWidth="2" style={{ stroke: i === 1 ? "rgb(var(--accent) / 0.55)" : "rgb(var(--chalk) / var(--chalk-o1))" }} />
          ))}
          <circle data-v-spin cx="1010" cy="300" r="210" fill="none" strokeWidth="2" strokeDasharray="2 14" strokeLinecap="round" style={{ stroke: "rgb(var(--chalk) / var(--chalk-o1))" }} />
          <g transform="translate(1010 300)">
            <circle r="30" fill="rgb(var(--accent))" fillOpacity=".16" />
            <path d={STAR} fill="rgb(var(--accent))" className="twinkle" />
          </g>
        </svg>
        <div className="wrap relative grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-2 lg:col-start-4">
            <p className="eyebrow flex items-center gap-3" data-fade>
              <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-accent live-dot" />
              {direction.vision.label}
            </p>
          </div>
          <ScrollWords
            text={direction.vision.text}
            highlights={direction.vision.highlights}
            className="font-display text-[clamp(1.7rem,3.2vw,3rem)] font-light leading-[1.2] tracking-[-0.01em] lg:col-span-7 lg:col-start-4 lg:row-start-2"
          />
        </div>
      </div>
    </section>
  );
}

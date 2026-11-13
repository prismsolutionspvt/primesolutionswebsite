"use client";
import { useEffect, useRef, useState } from "react";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { positioning } from "@/content";

/* A scroll-driven scene built from the logo's own geometry: one swoosh and a four-point star.
   As you scroll, the star travels the swoosh, leaves a luminous trail and lights each of Prism's four
   positioning pillars in turn. Three layers move at different speeds for depth. */
const ARC = "M30 470 C 250 160, 690 30, 1110 112";
const STOPS = [0.2, 0.44, 0.68, 0.9];
const STAR = "M0 -20 Q2.4 -2.4 20 0 Q2.4 2.4 0 20 Q-2.4 2.4 -20 0 Q-2.4 -2.4 0 -20Z";

export function AboutScene() {
  const root = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = root.current;
    const arc = arcRef.current;
    if (!el || !arc) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const reduce = prefersReducedMotion();
    const len = arc.getTotalLength();
    const at = (t: number) => arc.getPointAtLength(len * t);

    // place the four pillar nodes along the swoosh
    el.querySelectorAll<SVGGElement>("[data-node]").forEach((g, i) => {
      const p = at(STOPS[i]);
      g.setAttribute("transform", `translate(${p.x} ${p.y})`);
    });

    const star = el.querySelector<SVGGElement>("[data-star]")!;
    const trail = el.querySelector<SVGPathElement>("[data-trail]")!;
    const place = (p: number) => {
      const pt = at(Math.min(Math.max(p, 0.001), 1));
      star.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${p * 90})`);
      trail.style.strokeDashoffset = String(1 - p);
      let idx = -1;
      STOPS.forEach((s, i) => p >= s - 0.02 && (idx = i));
      setActive((prev) => (prev === idx ? prev : idx));
    };

    if (reduce) {
      place(1);
      return;
    }
    place(0);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        end: "bottom 38%",
        scrub: 0.6,
        onUpdate: (self) => place(self.progress),
      });
      // depth: back / mid layers drift against the scroll
      gsap.fromTo("[data-back]", { x: 60 }, { x: -60, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo("[data-mid]", { x: -30, y: 20 }, { x: 30, y: -20, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo("[data-prisms]", { yPercent: 14, rotate: -4 }, { yPercent: -14, rotate: 4, transformOrigin: "50% 50%", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface">
        <svg viewBox="0 0 1200 520" className="block h-auto w-full" role="img" aria-label="A star travels along a swoosh and lights four pillars: business process support, customer experience, sales enablement and digital growth.">
          {/* back layer: faint arcs */}
          <g data-back fill="none" strokeLinecap="round">
            <path d="M-40 520 C 240 220, 700 90, 1240 160" stroke="rgb(var(--ink))" strokeOpacity=".07" strokeWidth="2" />
            <path d="M-40 560 C 260 280, 720 150, 1240 230" stroke="rgb(var(--ink))" strokeOpacity=".07" strokeWidth="2" />
            <path d="M-40 480 C 220 160, 680 40, 1240 100" stroke="rgb(var(--accent))" strokeOpacity=".18" strokeWidth="2" />
          </g>
          {/* prism outlines drifting behind */}
          <g data-prisms fill="none" stroke="rgb(var(--ink))" strokeOpacity=".09" strokeWidth="2" strokeLinejoin="round">
            <polygon points="860,330 800,440 920,440" />
            <polygon points="170,110 130,180 210,180" />
            <polygon points="640,90 610,140 670,140" />
          </g>
          {/* mid layer: soft glow band under the main arc */}
          <g data-mid>
            <path d={ARC} fill="none" stroke="rgb(var(--accent))" strokeOpacity=".16" strokeWidth="26" strokeLinecap="round" />
          </g>
          {/* main swoosh */}
          <path ref={arcRef} d={ARC} fill="none" stroke="rgb(var(--ink))" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
          <path data-trail pathLength={1} d={ARC} fill="none" stroke="rgb(var(--accent))" strokeWidth="5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />

          {positioning.map((p, i) => (
            <g key={p.title} data-node>
              <circle r={active >= i ? 13 : 8} fill="rgb(var(--bg))" stroke={active >= i ? "rgb(var(--accent))" : "rgb(var(--ink))"} strokeWidth="3" style={{ transition: "all .45s cubic-bezier(.22,1,.36,1)" }} />
              {active >= i && <circle r="4.5" fill="rgb(var(--accent))" />}
              <text y={i % 2 === 0 ? 44 : -26} textAnchor="middle" fontSize="21" fontWeight="600" fontFamily="var(--font-body)" className="fill-ink max-sm:hidden" style={{ opacity: active >= i ? 1 : 0.45, transition: "opacity .45s" }}>
                {p.title}
              </text>
            </g>
          ))}

          {/* travelling star */}
          <g data-star>
            <circle r="34" fill="rgb(var(--accent))" fillOpacity=".18" />
            <path d={STAR} fill="rgb(var(--accent))" />
          </g>
        </svg>
      </div>

      <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {positioning.map((p, i) => (
          <li key={p.title} className={`border-t-2 pt-4 transition-all duration-500 ${active >= i ? "border-accent opacity-100" : "border-line opacity-45"}`}>
            <p className="font-mono text-xs text-accent-text">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{p.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

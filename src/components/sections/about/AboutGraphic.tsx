"use client";
import { useEffect, useRef } from "react";
import { registerGsap, whenReady } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { PrismMark } from "@/components/ui/Logo";

const nodes = [
  { id: "Marketing", x: 200, y: 52 },
  { id: "Sales", x: 352, y: 150 },
  { id: "Support", x: 330, y: 330 },
  { id: "Leads", x: 70, y: 330 },
  { id: "Operations", x: 48, y: 150 },
];
const C = { x: 200, y: 215 };

/** Connected teams: five functions around one hub, links drawn on scroll-in. */
export function AboutGraphic() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const reduce = prefersReducedMotion();
    if (reduce) return;
    const ctx = gsap.context(() => {
      const links = gsap.utils.toArray<SVGPathElement>("[data-link]");
      gsap.set(links, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set("[data-gnode]", { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
      gsap.set("[data-glabel]", { opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        once: true,
        onEnter: () =>
          whenReady(() => {
            const tl = gsap.timeline();
            tl.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "expo.inOut" })
              .to("[data-hub]", { scale: 1, duration: 0.7, ease: "back.out(2)" }, 0.5)
              .to(links, { strokeDashoffset: 0, duration: 1.1, stagger: 0.07, ease: "power2.inOut" }, 0.7)
              .to("[data-gnode]", { scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(2.4)" }, 1.1)
              .to("[data-glabel]", { opacity: 1, duration: 0.6, stagger: 0.08 }, 1.3);
          }),
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const ring = nodes.map((n, i) => [n, nodes[(i + 1) % nodes.length]] as const);

  return (
    <div ref={ref} className="relative mx-auto max-w-[520px] rounded-[2rem] border border-line bg-surface p-4 sm:p-6">
      <svg viewBox="0 0 400 400" className="h-auto w-full" role="img" aria-label="Diagram: marketing, sales, support, lead generation and operations connected through one Prism hub.">
        {nodes.map((n) => (
          <path key={n.id} data-link pathLength={1} d={`M${C.x} ${C.y} L${n.x} ${n.y}`} stroke="rgb(var(--accent))" strokeWidth="2" fill="none" strokeLinecap="round" />
        ))}
        {ring.map(([a, b], i) => (
          <path key={i} data-link pathLength={1} d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke="rgb(var(--ink))" strokeOpacity=".22" strokeWidth="1.5" fill="none" strokeDasharray="1" />
        ))}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle data-gnode cx={n.x} cy={n.y} r="9" fill="rgb(var(--bg))" stroke="rgb(var(--ink))" strokeWidth="2" />
            <text data-glabel x={n.x} y={n.y + (n.y > 200 ? 30 : -20)} textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="var(--font-body)" className="fill-ink">
              {n.id}
            </text>
          </g>
        ))}
        <g data-hub style={{ transformOrigin: "200px 215px" }}>
          <circle cx={C.x} cy={C.y} r="46" className="fill-navy" />
          <foreignObject x={C.x - 30} y={C.y - 17} width="60" height="34">
            <PrismMark className="h-full w-full" />
          </foreignObject>
        </g>
      </svg>
      <p className="mt-2 px-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted">One hub. Every function aligned.</p>
    </div>
  );
}

"use client";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { registerGsap, whenReady } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { services } from "@/content";
import { Split } from "@/components/ui/Split";
import { Magnetic } from "@/components/motion/Magnetic";

/* Geometry: one beam in → prism → seven rays out (one per service). */
const W = 760;
const H = 560;
const PRISM = { a: [300, 120], b: [196, 360], c: [404, 360] }; // apex, base-left, base-right
const ENTRY = [253, 262];
const EXIT_X = 338;
const EXIT_Y = 262;
const RAY_X = 566;
const rayEnds = services.map((_, i) => 44 + i * ((H - 88) / (services.length - 1)));

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const comp = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = root.current;
    const svg = comp.current;
    if (!el || !svg) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const reduce = prefersReducedMotion();
    const q = gsap.utils.selector(el);

    const ctx = gsap.context(() => {
      const paths = q("[data-draw]") as unknown as SVGPathElement[];
      const intro = () => {
        if (reduce) return;
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(q("[data-hero-in]"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.09 }, 0.55)
          .fromTo(q("[data-beam]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0.1)
          .fromTo(q("[data-prism]"), { opacity: 0, scale: 0.86, transformOrigin: "50% 60%" }, { opacity: 1, scale: 1, duration: 1.2 }, 0.45)
          .fromTo(paths.filter((p) => p.dataset.draw === "ray"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.07, ease: "power2.out" }, 0.95)
          .fromTo(q("[data-node]"), { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" }, { scale: 1, duration: 0.7, stagger: 0.07, ease: "back.out(2.4)" }, 1.4)
          .fromTo(q("[data-label]"), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.07 }, 1.5)
          .fromTo(q("[data-flow]"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.3);
      };
      if (reduce) {
        gsap.set(paths, { strokeDashoffset: 0 });
        gsap.set(q("[data-hero-in]"), { opacity: 1, y: 0 });
      } else {
        gsap.set(q("[data-hero-in]"), { opacity: 0 });
        gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(q("[data-prism]"), { opacity: 0 });
        gsap.set(q("[data-node]"), { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
        gsap.set(q("[data-label]"), { opacity: 0 });
        gsap.set(q("[data-flow]"), { opacity: 0 });
      }
      whenReady(intro);

      if (!reduce) {
        // scroll-linked: composition drifts and rays open up as the hero leaves
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
          animation: gsap.timeline({ defaults: { ease: "none" } })
            .to(q("[data-rays]"), { scaleY: 1.18, transformOrigin: "30% 50%" }, 0)
            .to(q("[data-comp]"), { yPercent: -8, opacity: 0.25 }, 0)
            .to(q("[data-copy]"), { yPercent: -14, opacity: 0 }, 0),
        });

        // pointer parallax (fine pointers only)
        gsap.matchMedia().add("(hover: hover) and (pointer: fine)", () => {
          const px = gsap.quickTo(q("[data-prism]"), "x", { duration: 1.2, ease: "power3.out" });
          const py = gsap.quickTo(q("[data-prism]"), "y", { duration: 1.2, ease: "power3.out" });
          const rx = gsap.quickTo(q("[data-rays]"), "x", { duration: 1.6, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            px(nx * -16);
            py(ny * -12);
            rx(nx * 14);
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          return () => window.removeEventListener("pointermove", onMove);
        });
      }
    }, el);
    const vis = new IntersectionObserver(([e]) => el.classList.toggle("is-paused", !e.isIntersecting));
    vis.observe(el);
    return () => {
      vis.disconnect();
      ctx.revert();
    };
  }, []);

  const rayPath = (y: number) => {
    const cx1 = EXIT_X + 90;
    return `M${EXIT_X} ${EXIT_Y} C ${cx1} ${EXIT_Y}, ${RAY_X - 140} ${y}, ${RAY_X} ${y}`;
  };

  return (
    <section ref={root} id="top" className="surface-night relative isolate min-h-[100svh] overflow-hidden pt-24 sm:pt-28 lg:pt-0">
      {/* single soft light source where the beam leaves the prism */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(48%_55%_at_70%_52%,rgb(var(--accent)/0.14),transparent_72%)]" />
      {/* fine registration grid — structural, not decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [background-image:linear-gradient(to_right,rgb(var(--line)/0.55)_1px,transparent_1px)] [background-size:calc(100%/12)_100%] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="wrap grid min-h-[100svh] items-center gap-6 pb-10 lg:grid-cols-12 lg:gap-4 lg:pb-0 lg:pt-24">
        <div data-copy className="relative z-10 lg:col-span-6 xl:col-span-6">
          <p data-hero-in className="eyebrow mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-block h-px w-8 bg-accent" />
            Prism Solutions
          </p>
          <Split
            as="h1"
            className="h-display text-[clamp(2.55rem,10.6vw,3.9rem)] sm:text-[clamp(3.4rem,8vw,5rem)] lg:text-[clamp(3.4rem,5.6vw,6.2rem)] 2xl:text-[7rem]"
            accent={["Growth"]}
          >
            {"Better Connections.\nSmarter Business Growth."}
          </Split>
          <p data-hero-in className="mt-7 max-w-[34rem] text-[1.05rem] leading-relaxed text-muted sm:text-lg">
            Digital marketing, sales and customer support, delivered by one integrated partner. Built to help your business grow with confidence.
          </p>
          <div data-hero-in className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic>
              <a href="#contact" className="btn btn-primary group w-full sm:w-auto">
                Discuss Your Requirements
                <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Magnetic>
            <a href="#services" className="btn btn-ghost group w-full sm:w-auto">
              Explore Our Services
              <ArrowDown className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        <div data-comp className="relative lg:col-span-6 lg:-ml-10 xl:-ml-4">
          <svg
            ref={comp}
            viewBox={`0 0 ${W} ${H}`}
            className="hero-svg mx-auto h-auto w-full max-w-[640px] overflow-visible lg:max-w-none"
            role="img"
            aria-label="Diagram: one beam of business need enters the Prism and separates into seven services — digital marketing, customer support, appointment setting, sales, lead generation, back-office support and business process outsourcing."
          >
            <defs>
              <linearGradient id="beamIn" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="253" y2="0">
                <stop offset="0" stopColor="rgb(var(--ink))" stopOpacity="0" />
                <stop offset="1" stopColor="rgb(var(--ink))" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="prismFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="rgb(var(--surface))" />
                <stop offset="1" stopColor="rgb(var(--surface2))" />
              </linearGradient>
            </defs>

            {/* incoming beam */}
            <path data-draw="beam" data-beam pathLength={1} d={`M10 ${ENTRY[1]} L${ENTRY[0]} ${ENTRY[1]}`} stroke="url(#beamIn)" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path data-flow pathLength={100} className="ray-flow" d={`M10 ${ENTRY[1]} L${ENTRY[0]} ${ENTRY[1]}`} stroke="rgb(var(--accent))" strokeWidth="5" fill="none" style={{ animationDuration: "2.2s" }} />
            <text x="10" y={ENTRY[1] - 16} className="fill-muted" fontSize="15" fontFamily="var(--font-mono)" letterSpacing="3">
              YOUR BUSINESS
            </text>

            {/* rays */}
            <g data-rays className="rays">
              {services.map((s, i) => {
                const y = rayEnds[i];
                const d = rayPath(y);
                const core = !!s.core;
                return (
                  <g key={s.id} className="ray">
                    <path data-draw="ray" pathLength={1} d={d} fill="none" stroke="rgb(var(--accent))" strokeOpacity={core ? 1 : 0.45 + (i % 3) * 0.12} strokeWidth={core ? 3.4 : 2} strokeLinecap="round" />
                    <path data-flow pathLength={100} className="ray-flow" d={d} fill="none" stroke="rgb(var(--ink))" strokeWidth={core ? 5 : 4} style={{ animationDelay: `${-i * 0.45}s` }} />
                    <circle data-node cx={RAY_X} cy={y} r={core ? 8 : 5.5} fill="rgb(var(--accent))" />
                    {core && <circle cx={RAY_X} cy={y} r="15" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".4" />}
                    <text data-label x={RAY_X + 22} y={y + 6} fontSize={core ? 21 : 19} fontWeight={core ? 700 : 500} className="fill-ink" fontFamily="var(--font-body)">
                      {s.ray}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* the prism */}
            <g data-prism>
              <polygon
                points={`${PRISM.a} ${PRISM.b} ${PRISM.c}`.replace(/,/g, " ")}
                fill="url(#prismFill)"
                stroke="rgb(var(--ink))"
                strokeOpacity=".75"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <polygon points={`${PRISM.a[0]} ${PRISM.a[1] + 22} ${PRISM.b[0] + 26} ${PRISM.b[1] - 12} ${PRISM.c[0] - 26} ${PRISM.c[1] - 12}`} fill="none" stroke="rgb(var(--ink))" strokeOpacity=".16" />
              <circle cx={ENTRY[0]} cy={ENTRY[1]} r="5" fill="rgb(var(--accent))" />
              <circle cx={EXIT_X} cy={EXIT_Y} r="5" fill="rgb(var(--accent))" />
            </g>
          </svg>
        </div>
      </div>
      <div aria-hidden className="wrap pointer-events-none absolute inset-x-0 bottom-7 hidden items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted lg:flex">
        <span>Quality · Commitment · Performance</span>
        <span className="flex items-center gap-3">
          Scroll <span className="block h-px w-12 bg-accent" />
        </span>
      </div>
      <style>{`.hero-svg:hover .ray{opacity:.3}.hero-svg .ray{transition:opacity .35s}.hero-svg .ray:hover{opacity:1}@media(max-width:640px){.hero-svg text{font-size:24px!important}}`}</style>
    </section>
  );
}

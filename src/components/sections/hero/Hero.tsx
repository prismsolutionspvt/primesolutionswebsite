"use client";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { registerGsap, whenReady } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { hero, services } from "@/content";
import { Split } from "@/components/ui/Split";
import { Magnetic } from "@/components/motion/Magnetic";

/* Geometry: one beam in → prism → seven rays out (one per service). */
const W = 840;
const H = 560;
const PRISM = { a: [300, 120], b: [196, 360], c: [404, 360] };
const ENTRY = [253, 262];
const EXIT_X = 338;
const EXIT_Y = 262;
const RAY_X = 566;
const rayEnds = services.map((_, i) => 44 + i * ((H - 88) / (services.length - 1)));
const rayPath = (y: number) => `M${EXIT_X} ${EXIT_Y} C ${EXIT_X + 90} ${EXIT_Y}, ${RAY_X - 140} ${y}, ${RAY_X} ${y}`;

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const reduce = prefersReducedMotion();
    const q = gsap.utils.selector(el);

    const ctx = gsap.context(() => {
      const paths = q("[data-draw]") as unknown as SVGPathElement[];
      const intro = () => {
        if (reduce) return;
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(q("[data-hero-in]"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.09 }, 0.5)
          .fromTo(q("[data-orbit]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, stagger: 0.18, ease: "power2.inOut" }, 0)
          .fromTo(q("[data-beam]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0.1)
          .fromTo(q("[data-prism]"), { opacity: 0, scale: 0.86, transformOrigin: "50% 60%" }, { opacity: 1, scale: 1, duration: 1.2 }, 0.45)
          .fromTo(paths.filter((p) => p.dataset.draw === "ray"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.07, ease: "power2.out" }, 0.95)
          .fromTo(q("[data-node]"), { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" }, { scale: 1, duration: 0.7, stagger: 0.07, ease: "back.out(2.4)" }, 1.4)
          .fromTo(q("[data-label]"), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.07 }, 1.5)
          .fromTo(q("[data-flow]"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.3);
      };
      if (reduce) {
        gsap.set(paths, { strokeDashoffset: 0 });
        gsap.set(q("[data-orbit]"), { strokeDashoffset: 0 });
      } else {
        gsap.set(q("[data-hero-in]"), { opacity: 0 });
        gsap.set([...paths, ...q("[data-orbit]")], { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(q("[data-prism]"), { opacity: 0 });
        gsap.set(q("[data-node]"), { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
        gsap.set(q("[data-label]"), { opacity: 0 });
        gsap.set(q("[data-flow]"), { opacity: 0 });
      }
      whenReady(intro);

      if (!reduce) {
        // scroll-linked: the composition drifts and the rays open as the hero leaves
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
          animation: gsap
            .timeline({ defaults: { ease: "none" } })
            .to(q("[data-rays]"), { scaleY: 1.18, transformOrigin: "30% 50%" }, 0)
            .to(q("[data-orbits]"), { yPercent: -10, scale: 1.08, transformOrigin: "60% 50%" }, 0)
            .to(q("[data-comp]"), { yPercent: -8, opacity: 0.25 }, 0)
            .to(q("[data-copy]"), { yPercent: -14, opacity: 0 }, 0),
        });

        // pointer parallax (fine pointers only)
        gsap.matchMedia().add("(hover: hover) and (pointer: fine)", () => {
          const px = gsap.quickTo(q("[data-prism]"), "x", { duration: 1.2, ease: "power3.out" });
          const py = gsap.quickTo(q("[data-prism]"), "y", { duration: 1.2, ease: "power3.out" });
          const rx = gsap.quickTo(q("[data-rays]"), "x", { duration: 1.6, ease: "power3.out" });
          const ox = gsap.quickTo(q("[data-orbits]"), "x", { duration: 2, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            px(nx * -16);
            py(ny * -12);
            rx(nx * 14);
            ox(nx * 28);
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

  const pick = (id: string) => window.dispatchEvent(new CustomEvent("prism:service", { detail: id }));

  return (
    <section ref={root} id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24 sm:pt-28 lg:pt-20">
      {/* soft light where the beam leaves the prism */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(46%_52%_at_72%_50%,rgb(var(--glow)/0.13),transparent_72%)]" />
      {/* registration grid — structural, fades out downward */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(to_right,rgb(var(--line)/0.7)_1px,transparent_1px)] [background-size:calc(100%/12)_100%] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      {/* swoosh motif echoing the logo's arc */}
      <svg data-orbits aria-hidden viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 -z-10 h-full w-full">
        <path data-orbit pathLength={1} d="M-40 640 C 300 220, 760 60, 1260 150" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
        <path data-orbit pathLength={1} d="M-40 700 C 340 300, 800 140, 1260 250" fill="none" stroke="rgb(var(--ink))" strokeOpacity=".12" strokeWidth="1.5" strokeLinecap="round" />
        <path data-orbit pathLength={1} d="M-40 760 C 380 380, 840 220, 1260 350" fill="none" stroke="rgb(var(--ink))" strokeOpacity=".08" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <div className="wrap grid flex-1 items-center gap-8 pb-8 lg:grid-cols-12 lg:gap-4">
        <div data-copy className="relative z-10 lg:col-span-6">
          <p data-hero-in className="eyebrow mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-accent" />
            {hero.eyebrow}
          </p>
          <Split
            as="h1"
            className="h-display text-[clamp(2.7rem,11vw,4rem)] sm:text-[clamp(3.4rem,8.4vw,5.2rem)] lg:text-[clamp(3.4rem,5.6vw,6.2rem)] 2xl:text-[7rem]"
            accent={hero.accent}
          >
            {hero.headline}
          </Split>
          <p data-hero-in className="mt-7 max-w-[36rem] text-[1.05rem] leading-relaxed text-muted sm:text-lg">
            {hero.text}
          </p>
          <div data-hero-in className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic>
              <a href="#contact" className="btn btn-primary group w-full sm:w-auto">
                {hero.primaryCta}
                <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>
            <a href="#services" className="btn btn-ghost group w-full sm:w-auto">
              {hero.secondaryCta}
              <ArrowDown className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        <div data-comp className="relative lg:col-span-6 lg:-ml-10 xl:-ml-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="hero-svg mx-auto h-auto w-full max-w-[660px] overflow-visible lg:max-w-none"
            role="group"
            aria-label="One beam of business need enters the Prism and separates into seven services. Select a service to read more."
          >
            <defs>
              <linearGradient id="beamIn" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="253" y2="0">
                <stop offset="0" stopColor="rgb(var(--ink))" stopOpacity="0" />
                <stop offset="1" stopColor="rgb(var(--ink))" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="prismFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="rgb(var(--bg))" />
                <stop offset="1" stopColor="rgb(var(--surface2))" />
              </linearGradient>
            </defs>

            <path data-draw="beam" data-beam pathLength={1} d={`M10 ${ENTRY[1]} L${ENTRY[0]} ${ENTRY[1]}`} stroke="url(#beamIn)" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path data-flow pathLength={100} className="ray-flow" d={`M10 ${ENTRY[1]} L${ENTRY[0]} ${ENTRY[1]}`} stroke="rgb(var(--accent))" strokeWidth="5" fill="none" style={{ animationDuration: "2.2s" }} />
            <text x="10" y={ENTRY[1] - 16} className="hero-label-sm fill-muted" fontSize="15" fontFamily="var(--font-mono)" letterSpacing="3">
              YOUR BUSINESS
            </text>

            <g data-rays className="rays">
              {services.map((s, i) => {
                const y = rayEnds[i];
                const d = rayPath(y);
                const core = i === 0;
                return (
                  <a key={s.id} href="#services" onClick={() => pick(s.id)} className="ray cursor-pointer" aria-label={`${s.name}: view service`}>
                    <path data-draw="ray" pathLength={1} d={d} fill="none" stroke="rgb(var(--accent))" strokeOpacity={core ? 1 : 0.45 + (i % 3) * 0.12} strokeWidth={core ? 3.4 : 2} strokeLinecap="round" />
                    <path data-flow pathLength={100} className="ray-flow" d={d} fill="none" stroke="rgb(var(--ink))" strokeWidth={core ? 5 : 4} style={{ animationDelay: `${-i * 0.45}s` }} />
                    <circle data-node cx={RAY_X} cy={y} r={core ? 8 : 5.5} fill="rgb(var(--accent))" />
                    {core && <circle cx={RAY_X} cy={y} r="15" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".4" />}
                    {/* generous invisible hit area for touch */}
                    <rect x={RAY_X - 14} y={y - 20} width={W - RAY_X - 10} height="40" fill="transparent" />
                    <text data-label x={RAY_X + 22} y={y + 6} fontSize={core ? 21 : 19} fontWeight={core ? 700 : 500} className="fill-ink" fontFamily="var(--font-body)">
                      {s.ray}
                    </text>
                  </a>
                );
              })}
            </g>

            <g data-prism>
              <polygon points={`${PRISM.a} ${PRISM.b} ${PRISM.c}`.replace(/,/g, " ")} fill="url(#prismFill)" stroke="rgb(var(--ink))" strokeOpacity=".75" strokeWidth="2" strokeLinejoin="round" />
              <polygon points={`${PRISM.a[0]} ${PRISM.a[1] + 22} ${PRISM.b[0] + 26} ${PRISM.b[1] - 12} ${PRISM.c[0] - 26} ${PRISM.c[1] - 12}`} fill="none" stroke="rgb(var(--ink))" strokeOpacity=".16" />
              <circle cx={ENTRY[0]} cy={ENTRY[1]} r="5" fill="rgb(var(--accent))" />
              <circle cx={EXIT_X} cy={EXIT_Y} r="5" fill="rgb(var(--accent))" />
            </g>
          </svg>
        </div>
      </div>

      {/* principles — in normal flow, so it can never collide with the buttons */}
      <div aria-hidden className="wrap pb-6 pt-2 sm:pb-8">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-5 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted">
          {hero.principles.map((p, i) => (
            <span key={p} className="flex items-center gap-4">
              {p}
              {i < hero.principles.length - 1 && <span className="h-1 w-1 rounded-full bg-accent" />}
            </span>
          ))}
        </p>
      </div>

      <style>{`.hero-svg:hover .ray{opacity:.3}.hero-svg .ray{transition:opacity .35s}.hero-svg .ray:hover,.hero-svg .ray:focus-visible{opacity:1}@media(max-width:640px){.hero-svg text{font-size:22px!important}.hero-svg .hero-label-sm{font-size:18px!important}}`}</style>
    </section>
  );
}

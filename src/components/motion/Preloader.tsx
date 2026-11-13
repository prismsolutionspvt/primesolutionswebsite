"use client";
import { useEffect, useRef } from "react";
import { registerGsap, READY_EVENT } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { LOGO } from "@/components/ui/BrandLogo";

/* The preloader animates the ORIGINAL logo file. The same image is stacked in five layers, each clipped
   to one region of the artwork (measured from the file), so no part of the logo is redrawn or altered.
   Regions are in source pixels (1413 × 729). When the sequence ends, a single unclipped copy takes over. */
const W = LOGO.width;
const H = LOGO.height;
const ARC_EDGE: [number, number][] = [
  [395, 292], [450, 280], [500, 250], [550, 222], [600, 200], [650, 176], [700, 160], [750, 144],
  [800, 130], [850, 118], [900, 108], [950, 101], [1000, 97], [1050, 96], [1100, 97], [1118, 100],
];
const poly = (pts: [number, number][]) =>
  `polygon(${pts.map(([x, y]) => `${((x / W) * 100).toFixed(3)}% ${((y / H) * 100).toFixed(3)}%`).join(",")})`;

const REGIONS = {
  // the swoosh (left of the star)
  arc: poly([...ARC_EDGE, [1118, 0], [395, 0]]),
  // the four-point star (and the tip of the swoosh that touches it)
  star: poly([[1118, 20], [1395, 20], [1395, 265], [1118, 265]]),
  // "Prism" wordmark (everything under the swoosh, above the band for "Solutions")
  word: poly([[0, 0], [395, 0], ...ARC_EDGE, [1118, 265], [W, 265], [W, 472], [0, 472]]),
  solutions: poly([[0, 472], [W, 472], [W, 640], [0, 640]]),
  tagline: poly([[0, 640], [W, 640], [W, H], [0, H]]),
} as const;

/** Star centre as % of the image — used as the transform origin for the star pop. */
const STAR_ORIGIN = `${((1250 / W) * 100).toFixed(2)}% ${((143 / H) * 100).toFixed(2)}%`;

/**
 * Plays once per session on a pure white screen. Progress reflects real readiness (fonts + window load):
 * it eases toward ~88% on a fixed curve, completes the moment the page is ready, then the screen lifts.
 * No artificial hold beyond the length of the logo animation.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el || !html.classList.contains("is-preloading")) return; // returning visitor: hidden by CSS

    const { gsap } = registerGsap();
    const reduce = prefersReducedMotion();
    const q = gsap.utils.selector(el);
    const counter = q("[data-count]")[0] as HTMLElement;
    const bar = q("[data-bar]")[0] as HTMLElement;
    const state = { p: 0 };
    let ready = false;
    let finished = false;

    const paint = () => {
      counter.textContent = String(Math.round(state.p)).padStart(3, "0");
      bar.style.transform = `scaleX(${state.p / 100})`;
    };

    const release = () => {
      html.classList.remove("is-preloading");
      window.dispatchEvent(new Event(READY_EVENT));
    };

    const done = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem("prism-seen", "1");
      } catch {}
      const out = gsap.timeline({
        onComplete: () => {
          release();
          el.style.display = "none";
        },
      });
      if (reduce) {
        out.to(el, { opacity: 0, duration: 0.25 });
        out.call(release, undefined, 0.1);
        return;
      }
      out
        .to(q("[data-meta]"), { opacity: 0, y: 10, duration: 0.3, ease: "power2.in" })
        .to(q("[data-stage]"), { y: -36, scale: 0.94, opacity: 0, duration: 0.55, ease: "power3.in" }, "<0.05")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "expo.inOut" }, "-=0.2")
        .call(release, undefined, "-=0.55");
    };

    // ── logo sequence (built from the original image's own regions)
    const tl = gsap.timeline();
    if (reduce) {
      gsap.set(q("[data-layer]"), { autoAlpha: 0 });
      gsap.set(q("[data-full]"), { opacity: 1 });
    } else {
      gsap.set(q("[data-full]"), { opacity: 0 });
      gsap.set(q("[data-w-arc]"), { clipPath: "inset(0 100% 0 0)" });
      gsap.set(q("[data-w-star]"), { scale: 0, rotate: -120, transformOrigin: STAR_ORIGIN });
      gsap.set(q("[data-w-word]"), { clipPath: "inset(0 100% 0 0)", y: 18 });
      gsap.set(q("[data-w-solutions]"), { clipPath: "inset(100% 0 0 0)", y: 22 });
      gsap.set(q("[data-w-tagline]"), { clipPath: "inset(0 50% 0 50%)" });
      gsap.set(q("[data-glint]"), { scale: 0, opacity: 0 });
      gsap.set(q("[data-layer]"), { autoAlpha: 1 });
      tl.to(q("[data-w-word]"), { clipPath: "inset(0 0% 0 0)", y: 0, duration: 0.95, ease: "power3.inOut" }, 0.1)
        .to(q("[data-w-arc]"), { clipPath: "inset(0 0% 0 0)", duration: 1.0, ease: "power2.inOut" }, 0.45)
        .to(q("[data-w-star]"), { scale: 1, rotate: 0, duration: 0.75, ease: "back.out(2.4)" }, 1.25)
        .to(q("[data-glint]"), { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }, 1.3)
        .to(q("[data-glint]"), { scale: 2.4, opacity: 0, duration: 0.7, ease: "power2.out" }, 1.65)
        .to(q("[data-w-solutions]"), { clipPath: "inset(0% 0 0 0)", y: 0, duration: 0.8, ease: "expo.out" }, 0.95)
        .to(q("[data-w-tagline]"), { clipPath: "inset(0 0% 0 0%)", duration: 0.9, ease: "expo.out" }, 1.4);
    }

    const handOver = () => {
      // single unclipped original replaces the layers (pixel-identical, no seams)
      gsap.set(q("[data-full]"), { opacity: 1 });
      gsap.set(q("[data-layer]"), { autoAlpha: 0 });
    };

    const start = performance.now();
    const MIN = reduce ? 200 : 2000;
    const MAX = 4500;
    const tick = gsap.to(state, { p: 88, duration: reduce ? 0.2 : 1.8, ease: "power2.out", onUpdate: paint });

    const finish = () => {
      if (ready) return;
      ready = true;
      const wait = Math.max(0, MIN - (performance.now() - start));
      gsap.delayedCall(wait / 1000, () => {
        tick.kill();
        handOver();
        gsap.to(state, { p: 100, duration: 0.3, ease: "power1.out", onUpdate: paint, onComplete: done });
      });
    };

    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const loaded = new Promise<void>((r) =>
      document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true }),
    );
    Promise.all([fontsReady, loaded]).then(finish);
    const safety = window.setTimeout(finish, MAX);

    return () => {
      window.clearTimeout(safety);
      tl.kill();
      tick.kill();
    };
  }, []);

  const layer = (key: keyof typeof REGIONS, attr: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <div data-layer {...{ [attr]: "" }} className="absolute inset-0 will-change-transform" style={{ visibility: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO.src} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none" style={{ clipPath: REGIONS[key] }} />
    </div>
  );

  return (
    <div
      ref={root}
      className="preloader surface-day fixed inset-0 z-[100] items-center justify-center bg-white"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      role="status"
      aria-label="Loading Prism Solutions"
    >
      <div className="flex flex-col items-center px-6">
        <div data-stage className="relative w-[min(82vw,580px)]" style={{ aspectRatio: `${W} / ${H}` }}>
          {/* final, unclipped original */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-full src={LOGO.src} alt="Prism Solutions — Your Partner in Business Growth." draggable={false} className="absolute inset-0 h-full w-full select-none" style={{ opacity: 0 }} />
          {layer("word", "data-w-word")}
          {layer("arc", "data-w-arc")}
          {layer("star", "data-w-star")}
          {layer("solutions", "data-w-solutions")}
          {layer("tagline", "data-w-tagline")}
          {/* light flare where the star lands */}
          <span
            data-glint
            aria-hidden
            className="pointer-events-none absolute h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${(1250 / W) * 100}%`,
              top: `${(143 / H) * 100}%`,
              background: "radial-gradient(circle, rgba(247,168,59,0.55) 0%, rgba(242,138,30,0.18) 40%, transparent 70%)",
            }}
          />
        </div>

        <div data-meta className="mt-9 flex w-[min(60vw,260px)] flex-col items-center gap-3">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-[rgb(219_225_237)]">
            <div data-bar className="h-full origin-left scale-x-0 bg-gradient-to-r from-[#0B1F4B] via-[#0B1F4B] to-[#F28A1E]" />
          </div>
          <span data-count className="font-mono text-[0.7rem] tracking-[0.3em] text-[#0B1F4B]/70">
            000
          </span>
        </div>
      </div>
    </div>
  );
}

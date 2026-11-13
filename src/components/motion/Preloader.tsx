"use client";
import { useEffect, useRef } from "react";
import { registerGsap, READY_EVENT } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { LOGO } from "@/components/ui/BrandLogo";
import { PoweredBy } from "@/components/ui/PoweredBy";

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
  arc: poly([...ARC_EDGE, [1118, 0], [395, 0]]), // the swoosh (left of the star)
  star: poly([[1118, 20], [1395, 20], [1395, 265], [1118, 265]]), // the four-point star
  word: poly([[0, 0], [395, 0], ...ARC_EDGE, [1118, 265], [W, 265], [W, 472], [0, 472]]), // "Prism"
  solutions: poly([[0, 472], [W, 472], [W, 640], [0, 640]]),
  tagline: poly([[0, 640], [W, 640], [W, H], [0, H]]),
} as const;

/** Star centre as % of the image — used as the transform origin for the star pop. */
const STAR_ORIGIN = `${((1250 / W) * 100).toFixed(2)}% ${((143 / H) * 100).toFixed(2)}%`;

/** Length of the branded preview before the site is revealed (if the page is already ready). */
const BRAND_MS = 2500;
/** Hard stop: never keep a visitor on the loader longer than this. */
const MAX_MS = 7000;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Plays once per session on a pure-white screen with the Prism logo and the FRX credit.
 * Progress is honest: it follows the clock toward 100% at ~2.5 s, but is capped by what has actually loaded
 * (fonts, the window load event, the logo image). If the page is slow, the bar waits; it never fakes completion.
 * On exit the logo flies into the navigation bar's logo, then the white screen dissolves.
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
    const fill = q("[data-fill]")[0] as HTMLElement;
    const head = q("[data-head]")[0] as HTMLElement;
    const stage = q("[data-stage]")[0] as HTMLElement;
    const full = q("[data-full]")[0] as HTMLImageElement;

    // ── what has really loaded
    const ready = { fonts: false, load: false, logo: false };
    const cap = () => 14 + (ready.fonts ? 26 : 0) + (ready.load ? 40 : 0) + (ready.logo ? 20 : 0);
    if (document.fonts?.ready) document.fonts.ready.then(() => (ready.fonts = true));
    else ready.fonts = true;
    if (document.readyState === "complete") ready.load = true;
    else window.addEventListener("load", () => (ready.load = true), { once: true });
    // the logo counts as loaded when the file has arrived (load event); an error must never block the page
    const markLogo = () => (ready.logo = true);
    if (full.complete && full.naturalWidth > 0) markLogo();
    else {
      full.addEventListener("load", markLogo, { once: true });
      full.addEventListener("error", markLogo, { once: true });
    }

    let progress = 0;
    let finished = false;
    let released = false;
    const paint = () => {
      counter.textContent = `${Math.round(progress)}%`;
      fill.style.transform = `scaleX(${progress / 100})`;
      head.style.left = `${progress}%`;
    };
    const release = () => {
      if (released) return;
      released = true;
      window.dispatchEvent(new Event(READY_EVENT)); // lets the hero start its entrance
    };
    const land = () => {
      html.classList.remove("is-preloading"); // the real nav logo appears exactly where the flying one lands
      release();
      el.style.display = "none";
    };

    // ── logo sequence (built from the original image's own regions)
    const tl = gsap.timeline();
    const handOver = () => {
      gsap.set(full, { opacity: 1 });
      gsap.set(q("[data-layer]"), { autoAlpha: 0 });
    };
    if (reduce) {
      handOver();
    } else {
      gsap.set(full, { opacity: 0 });
      gsap.set(q("[data-w-arc]"), { clipPath: "inset(0 100% 0 0)" });
      gsap.set(q("[data-w-star]"), { scale: 0, rotate: -120, transformOrigin: STAR_ORIGIN });
      gsap.set(q("[data-w-word]"), { clipPath: "inset(0 100% 0 0)", y: 18 });
      gsap.set(q("[data-w-solutions]"), { clipPath: "inset(100% 0 0 0)", y: 22 });
      gsap.set(q("[data-w-tagline]"), { clipPath: "inset(0 50% 0 50%)" });
      gsap.set(q("[data-glint]"), { scale: 0, opacity: 0 });
      gsap.set(q("[data-layer]"), { autoAlpha: 1 });
      tl.to(q("[data-w-word]"), { clipPath: "inset(0 0% 0 0)", y: 0, duration: 0.85, ease: "power3.inOut" }, 0.1)
        .to(q("[data-w-arc]"), { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power2.inOut" }, 0.4)
        .to(q("[data-w-star]"), { scale: 1, rotate: 0, duration: 0.65, ease: "back.out(2.4)" }, 1.15)
        .to(q("[data-glint]"), { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }, 1.2)
        .to(q("[data-glint]"), { scale: 2.4, opacity: 0, duration: 0.6, ease: "power2.out" }, 1.5)
        .to(q("[data-w-solutions]"), { clipPath: "inset(0% 0 0 0)", y: 0, duration: 0.75, ease: "expo.out" }, 0.85)
        .to(q("[data-w-tagline]"), { clipPath: "inset(0 0% 0 0%)", duration: 0.8, ease: "expo.out" }, 1.25)
        .call(handOver, undefined, 2.15);
    }

    // ── exit: the logo flies into the nav bar, the white screen dissolves, the hero begins
    const exit = () => {
      if (finished) return;
      finished = true;
      handOver();
      try {
        sessionStorage.setItem("prism-seen", "1");
      } catch {}
      const navLogo = document.querySelector<HTMLElement>("[data-nav-logo] img");
      const out = gsap.timeline({ onComplete: land });
      if (reduce || !navLogo) {
        out.to(el, { opacity: 0, duration: 0.3 }).call(release, undefined, 0.1);
        return;
      }
      const s = stage.getBoundingClientRect();
      const t = navLogo.getBoundingClientRect();
      gsap.set(stage, { transformOrigin: "0 0" });
      out
        .to(q("[data-meta], [data-credit]"), { opacity: 0, y: 8, duration: 0.3, ease: "power2.in" })
        .to(stage, { x: t.left - s.left, y: t.top - s.top, scale: t.width / s.width, duration: 0.95, ease: "expo.inOut" }, "<0.08")
        .to(q("[data-veil]"), { opacity: 0, duration: 0.7, ease: "power2.inOut" }, "<0.22")
        .call(release, undefined, "<0.4");
    };

    // ── progress: honest, time-eased, capped by real readiness
    const start = performance.now();
    const MIN = reduce ? 350 : BRAND_MS;
    let last = start;
    const tick = () => {
      const now = performance.now();
      const elapsed = now - start;
      const dt = now - last;
      last = now;
      const timeP = 100 * (reduce ? Math.min(1, elapsed / MIN) : easeInOutCubic(Math.min(1, elapsed / MIN)));
      const target = elapsed > MAX_MS ? 100 : Math.min(timeP, cap());
      progress += (target - progress) * (1 - Math.exp(-dt / 90)); // frame-rate independent smoothing
      if (target - progress < 0.2) progress = target;
      paint();
      if (progress >= 99.9 && elapsed >= MIN) {
        gsap.ticker.remove(tick);
        exit();
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      tl.kill();
    };
  }, []);

  const layer = (key: keyof typeof REGIONS, attr: string) => (
    <div data-layer {...{ [attr]: "" }} className="absolute inset-0 will-change-transform" style={{ visibility: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO.src} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none" style={{ clipPath: REGIONS[key] }} />
    </div>
  );

  return (
    <div
      ref={root}
      className="preloader surface-day fixed inset-0 z-[100] flex-col items-center justify-between overflow-hidden"
      role="status"
      aria-label="Loading Prism Solutions"
    >
      <div data-veil className="absolute inset-0 bg-white" />

      <div className="relative flex w-full flex-1 flex-col items-center justify-center px-6 pt-4">
        {/* logo stage: sized by width AND height so it is never cropped, on any screen */}
        <div data-stage className="relative will-change-transform" style={{ width: "min(82vw, 580px, calc(44svh * 1.9383))", aspectRatio: `${W} / ${H}` }}>
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

        {/* progress: a hairline with the brand star as its head */}
        <div data-meta className="mt-[clamp(1.5rem,5svh,2.75rem)] flex w-[min(66vw,320px)] flex-col items-center gap-3">
          <div className="relative h-[2px] w-full rounded-full bg-[rgb(219_225_237)]">
            <div data-fill className="absolute inset-0 origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#0B1F4B] via-[#0B1F4B] to-[#F28A1E]" />
            <div data-head className="absolute top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 text-[#F28A1E] drop-shadow-[0_0_6px_rgba(242,138,30,0.85)]" style={{ left: "0%" }}>
              <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" aria-hidden>
                <path d="M12 0Q13 10.5 24 12Q13 13.5 12 24Q11 13.5 0 12Q11 10.5 12 0Z" />
              </svg>
            </div>
          </div>
          <span data-count className="font-mono text-[0.72rem] tabular-nums tracking-[0.28em] text-[#0B1F4B]/70">
            0%
          </span>
        </div>
      </div>

      <div data-credit className="relative pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <PoweredBy />
      </div>
    </div>
  );
}

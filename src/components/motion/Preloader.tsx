"use client";
import { useEffect, useRef } from "react";
import { registerGsap, READY_EVENT } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { PrismMark } from "@/components/ui/Logo";

/**
 * Plays once per session. Progress reflects real readiness (fonts + window load):
 * the bar eases to ~88% on a fixed curve, then completes the moment the page is ready,
 * and the overlay leaves immediately — no artificial hold.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el) return;
    if (!html.classList.contains("is-preloading")) return; // returning visitor: already hidden

    const { gsap } = registerGsap();
    const reduce = prefersReducedMotion();
    const q = gsap.utils.selector(el);
    const counter = q("[data-count]")[0] as HTMLElement;
    const bar = q("[data-bar]")[0] as HTMLElement;
    const state = { p: 0 };
    let ready = false;
    let finished = false;

    const paint = () => {
      const v = Math.round(state.p);
      counter.textContent = String(v).padStart(3, "0");
      bar.style.transform = `scaleX(${state.p / 100})`;
    };

    const done = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem("prism-seen", "1");
      } catch {}
      const out = gsap.timeline({
        onComplete: () => {
          html.classList.remove("is-preloading");
          window.dispatchEvent(new Event(READY_EVENT));
          el.style.display = "none";
        },
      });
      if (reduce) {
        out.to(el, { opacity: 0, duration: 0.25 });
      } else {
        out
          .to(q("[data-brand]"), { yPercent: -30, opacity: 0, duration: 0.5, ease: "power3.in" })
          .to(q("[data-meta]"), { opacity: 0, duration: 0.3 }, "<")
          .to(q("[data-panel]"), { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.15")
          .to(q("[data-edge]"), { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "<0.04");
      }
      // let the page start revealing slightly before the wipe finishes
      out.call(() => {
        html.classList.remove("is-preloading");
        window.dispatchEvent(new Event(READY_EVENT));
      }, undefined, reduce ? 0.1 : 0.95);
    };

    // intro
    const tl = gsap.timeline();
    if (!reduce) {
      gsap.set(q("[data-mark-arc]"), { clipPath: "inset(0 100% 0 0)" });
      gsap.set(q("[data-mark='star']"), { scale: 0, rotate: -90, transformOrigin: "50% 50%", transformBox: "fill-box" });
      gsap.set(q("[data-letter]"), { yPercent: 115 });
      gsap.set(q("[data-sub]"), { opacity: 0, letterSpacing: "0.9em" });
      tl.to(q("[data-mark-arc]"), { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.inOut" })
        .to(q("[data-mark='star']"), { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(2.2)" }, "-=0.25")
        .to(q("[data-letter]"), { yPercent: 0, duration: 0.8, stagger: 0.045, ease: "expo.out" }, "-=0.55")
        .to(q("[data-sub]"), { opacity: 1, letterSpacing: "0.42em", duration: 1, ease: "expo.out" }, "-=0.55");
    }

    const start = performance.now();
    const MIN = reduce ? 200 : 1700;
    const MAX = 4500;
    const tick = gsap.to(state, {
      p: 88,
      duration: reduce ? 0.2 : 1.6,
      ease: "power2.out",
      onUpdate: paint,
    });

    const finish = () => {
      if (ready) return;
      ready = true;
      const wait = Math.max(0, MIN - (performance.now() - start));
      gsap.delayedCall(wait / 1000, () => {
        tick.kill();
        gsap.to(state, { p: 100, duration: 0.35, ease: "power1.out", onUpdate: paint, onComplete: done });
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

  return (
    <div
      ref={root}
      className="preloader surface-night fixed inset-0 z-[100] items-center justify-center overflow-hidden"
      role="status"
      aria-label="Loading Prism Solutions"
    >
      <div data-panel className="absolute inset-0 bg-[#040A1A]" />
      <div data-edge className="absolute inset-x-0 top-full h-[2px] bg-accent opacity-0" />
      <div data-brand className="relative flex flex-col items-center px-6">
        <div className="relative w-[min(62vw,300px)]">
          <div data-mark-arc>
            <PrismMark className="w-full" />
          </div>
        </div>
        <div className="mt-2 flex overflow-hidden pb-3 font-display text-[clamp(3.4rem,13vw,6.5rem)] font-extrabold italic leading-[0.95] tracking-tightest text-white">
          {"Prism".split("").map((c, i) => (
            <span key={i} data-letter className="inline-block">
              {c}
            </span>
          ))}
        </div>
        <div data-sub className="text-[0.7rem] font-semibold uppercase text-white/80 sm:text-sm">
          Solutions
        </div>
      </div>
      <div data-meta className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-12 sm:pb-12">
        <div className="mx-auto flex max-w-[1480px] items-end justify-between gap-6 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-white/60">
          <span className="max-w-[16rem] leading-relaxed">Quality · Commitment · Performance</span>
          <span data-count className="text-2xl tracking-normal text-white sm:text-4xl">
            000
          </span>
        </div>
        <div className="mx-auto mt-4 h-px max-w-[1480px] bg-white/15">
          <div data-bar className="h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}

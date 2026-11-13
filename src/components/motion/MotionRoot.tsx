"use client";
import { useEffect } from "react";
import { registerGsap, whenReady } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * One place for the shared scroll vocabulary:
 *  [data-split]    word-mask headline reveal
 *  [data-fade]     fade/translate-in (IntersectionObserver, no GSAP cost)
 *  [data-clip]     image/graphic wipe reveal
 *  [data-parallax] scroll-linked y offset (desktop, motion-allowed only)
 *  [data-draw-on-view] SVG path (pathLength=1) that draws itself when scrolled into view
 * Section-specific choreography lives in each section component.
 */
export function MotionRoot() {
  useEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    const reduce = prefersReducedMotion();
    const cleanups: Array<() => void> = [];

    // fades — pure IO
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    const observeAll = () => document.querySelectorAll("[data-fade]").forEach((n) => io.observe(n));
    cleanups.push(whenReady(observeAll));

    if (!reduce) {
      const ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          const words = el.querySelectorAll(".sp-word");
          ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () =>
              whenReady(() => {
                words.forEach((w) => ((w as HTMLElement).style.translate = "none"));
                gsap.fromTo(words, { yPercent: 112 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.055, overwrite: true });
              }),
          });
        });

        document.querySelectorAll<HTMLElement>("[data-clip]").forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () =>
              whenReady(() =>
                gsap.to(el, { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "expo.inOut" }),
              ),
          });
        });

        document.querySelectorAll<SVGPathElement>("[data-draw-on-view]").forEach((path) => {
          gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
          ScrollTrigger.create({
            trigger: path.ownerSVGElement ?? path,
            start: "top 85%",
            once: true,
            onEnter: () => whenReady(() => gsap.to(path, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" })),
          });
        });

        gsap.matchMedia().add("(min-width: 1024px)", () => {
          document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
            const amt = parseFloat(el.dataset.parallax || "0.15") * 100;
            gsap.fromTo(
              el,
              { yPercent: -amt },
              {
                yPercent: amt,
                ease: "none",
                scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          });
        });
      });
      cleanups.push(() => ctx.revert());
    } else {
      cleanups.push(() => {});
    }

    // cursor spotlight inside buttons (fine pointers only; one delegated listener, rAF-throttled)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let raf = 0;
      const onMove = (e: PointerEvent) => {
        const btn = (e.target as Element | null)?.closest?.<HTMLElement>(".btn");
        if (!btn) return;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = btn.getBoundingClientRect();
          btn.style.setProperty("--bx", `${e.clientX - r.left}px`);
          btn.style.setProperty("--by", `${e.clientY - r.top}px`);
        });
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        document.removeEventListener("pointermove", onMove);
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    cleanups.push(() => window.removeEventListener("load", refresh));

    return () => {
      io.disconnect();
      cleanups.forEach((c) => c());
    };
  }, []);
  return null;
}

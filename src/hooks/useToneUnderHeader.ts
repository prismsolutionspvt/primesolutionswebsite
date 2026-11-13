"use client";
import { useEffect, useState } from "react";
import type { Tone } from "@/config/adaptive";

/**
 * In Prism Adaptive the navigation takes on the tone of the section currently beneath it, so it is always legible.
 * Measures the sections marked [data-adaptive] on scroll (rAF-throttled). Returns "light" for the other themes.
 */
export function useToneUnderHeader(probeY = 44): Tone {
  const [tone, setTone] = useState<Tone>("light");

  useEffect(() => {
    let raf = 0;
    let sections: HTMLElement[] = [];
    const collect = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>("[data-adaptive]"));
    };
    const compute = () => {
      raf = 0;
      if (document.documentElement.dataset.theme !== "adaptive") {
        setTone((p) => (p === "light" ? p : "light"));
        return;
      }
      let next: Tone = "light";
      // later sections paint on top of earlier ones, so search from the bottom of the page up
      for (let i = sections.length - 1; i >= 0; i--) {
        const r = sections[i].getBoundingClientRect();
        if (r.top <= probeY && r.bottom > probeY) {
          next = sections[i].dataset.adaptive === "dark" ? "dark" : "light";
          break;
        }
      }
      setTone((p) => (p === next ? p : next));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    collect();
    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(() => {
      collect();
      schedule();
    });
    ro.observe(document.body);
    // react to theme changes without re-rendering the page
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      mo.disconnect();
    };
  }, [probeY]);

  return tone;
}

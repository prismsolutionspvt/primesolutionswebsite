"use client";
import { useEffect, useRef } from "react";

/** A hairline reading-progress bar across the top whose head is the brand's four-point star. No React state: it writes styles directly. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const star = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (star.current) star.current.style.transform = `translateX(${p * window.innerWidth}px) translateX(-50%)`;
      if (wrap.current) wrap.current.style.opacity = p > 0.004 ? "1" : "0";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px] opacity-0 transition-opacity duration-300">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-accent/0 via-accent to-amber" />
      <div ref={star} className="absolute -top-[6px] left-0 h-[15px] w-[15px] text-amber drop-shadow-[0_0_6px_rgb(var(--glow)/0.9)]">
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
          <path d="M12 0Q13 10.5 24 12Q13 13.5 12 24Q11 13.5 0 12Q11 10.5 12 0Z" />
        </svg>
      </div>
    </div>
  );
}

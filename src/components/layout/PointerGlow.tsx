"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Wraps a scene and lets a soft light follow the pointer (fine pointers only). Uses CSS variables, no layout work. */
export function PointerGlow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        el.style.setProperty("--glow-o", "1");
      });
    };
    const onLeave = () => el.style.setProperty("--glow-o", "0");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ ["--glow-o" as string]: 0 }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ opacity: "var(--glow-o)", background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--glow) / 0.16), transparent 70%)" }}
      />
      {children}
    </div>
  );
}

"use client";
import { useEffect, useMemo, useRef } from "react";
import { registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

const norm = (w: string) => w.toLowerCase().replace(/[.,;:]/g, "");

/**
 * A sentence whose words light up one by one as you scroll through it (scrubbed, so it follows your pace).
 * `highlights` are phrases that glow in the accent colour. The full text stays in the DOM and in aria-label.
 */
export function ScrollWords({ text, highlights = [], className = "" }: { text: string; highlights?: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  const words = useMemo(() => {
    const tokens = text.split(" ");
    const flags = new Array<boolean>(tokens.length).fill(false);
    highlights.forEach((h) => {
      const hw = h.split(" ");
      for (let i = 0; i <= tokens.length - hw.length; i++) {
        if (hw.every((w, k) => norm(tokens[i + k]) === norm(w))) for (let k = 0; k < hw.length; k++) flags[i + k] = true;
      }
    });
    return tokens.map((w, i) => ({ w, hl: flags[i] }));
  }, [text, highlights]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll(".sw"),
        { opacity: 0.16 },
        { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 84%", end: "bottom 50%", scrub: 0.4 } },
      );
    }, el);
    return () => ctx.revert();
  }, [words]);

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map(({ w, hl }, i) => (
        <span key={i} className={`sw ${hl ? "text-accent" : ""}`} aria-hidden>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

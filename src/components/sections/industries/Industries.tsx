"use client";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { industries } from "@/content";
import { IndustryArt } from "./IndustryArt";
import { Split } from "@/components/ui/Split";

const looks = [
  { bg: "#0E2658", fg: "#FFFFFF", sub: "rgba(255,255,255,.72)", ac: "#F7A83B" },
  { bg: "#F28A1E", fg: "#0B1F4B", sub: "rgba(11,31,75,.78)", ac: "#0B1F4B" },
  { bg: "#17387C", fg: "#FFFFFF", sub: "rgba(255,255,255,.74)", ac: "#F7A83B" },
  { bg: "#F7A83B", fg: "#0B1F4B", sub: "rgba(11,31,75,.78)", ac: "#0B1F4B" },
  { bg: "#091A42", fg: "#FFFFFF", sub: "rgba(255,255,255,.72)", ac: "#F28A1E" },
  { bg: "#214A99", fg: "#FFFFFF", sub: "rgba(255,255,255,.76)", ac: "#F7A83B" },
];

export function Industries() {
  const row = useRef<HTMLDivElement>(null);
  const go = (d: number) => row.current?.scrollBy({ left: d * Math.min(480, window.innerWidth * 0.8), behavior: "smooth" });

  return (
    <section id="industries" className="surface-night relative z-10 -mt-10 overflow-hidden rounded-t-[2.5rem] py-20 sm:-mt-14 sm:rounded-t-[3.5rem] sm:py-28 lg:py-32">
      <div className="wrap flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow mb-6" data-fade>
            Industries
          </p>
          <Split as="h2" className="h-display max-w-[16ch] text-[clamp(2.3rem,7vw,5rem)] lg:text-[clamp(2.6rem,4.8vw,5rem)]" accent={["context."]}>
            {"Different industries. Same need for context."}
          </Split>
        </div>
        <div className="flex items-center gap-3" aria-hidden={false}>
          <button type="button" onClick={() => go(-1)} aria-label="Previous industries" className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next industries" className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={row} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:gap-5 sm:px-8 lg:mt-14 lg:px-12" tabIndex={0} aria-label="Industries">
        {industries.map((ind, i) => {
          const L = looks[i];
          return (
            <article key={ind.id} className="relative flex h-[27rem] w-[80vw] max-w-[24rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 sm:h-[29rem] sm:max-w-[26rem] sm:p-8" style={{ background: L.bg, color: L.fg }}>
              <div className="pointer-events-none absolute right-2 top-10 h-[26%] w-[60%] opacity-30">
                <IndustryArt kind={ind.art} color={L.ac} />
              </div>
              <span className="relative font-mono text-xs tracking-[0.2em]" style={{ color: L.sub }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative">
                <h3 className="h-display max-w-[11ch] text-[clamp(1.9rem,6vw,2.5rem)]">{ind.name}</h3>
                <p className="mt-3 max-w-[34ch] text-[0.95rem] leading-relaxed" style={{ color: L.sub }}>
                  {ind.blurb}
                </p>
                <ul className="mt-5 space-y-1.5">
                  {ind.help.slice(0, 2).map((h) => (
                    <li key={h} className="flex gap-2.5 text-[0.88rem] leading-snug">
                      <span className="mt-[0.6em] h-px w-3 shrink-0" style={{ background: L.ac, height: 2 }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
        <div className="w-2 shrink-0" aria-hidden />
      </div>
    </section>
  );
}

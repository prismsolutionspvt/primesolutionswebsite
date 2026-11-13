"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const C = 260; // centre of the 520 × 520 canvas
const R = 188;

/** Eight reasons on a ring around the prism. The ring turns so the active reason always faces the text on the right,
 *  and a beam from the prism connects to it. Nodes are buttons, so it also works with keyboard / without scroll. */
export function WhyRing({ count, active, onSelect, labels, className = "h-auto w-full max-w-[520px]" }: { count: number; active: number; onSelect: (i: number) => void; labels: string[]; className?: string }) {
  const step = 360 / count;

  // turn by the shortest way round so the ring never spins backwards through a full circle
  const [angle, setAngle] = useState(0);
  const last = useRef(0);
  useEffect(() => {
    const target = -active * step;
    const diff = ((((target - last.current) % 360) + 540) % 360) - 180;
    last.current += diff;
    setAngle(last.current);
  }, [active, step]);

  const pos = (i: number) => {
    const a = (i * step * Math.PI) / 180;
    return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
  };

  return (
    <svg viewBox="0 0 520 520" className={className} role="group" aria-label="Eight reasons to choose Prism Solutions">
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgb(var(--ink))" strokeOpacity=".14" strokeWidth="1.5" />
      <circle cx={C} cy={C} r={R - 52} fill="none" stroke="rgb(var(--ink))" strokeOpacity=".1" strokeDasharray="2 8" />
      <circle cx={C} cy={C} r={R + 36} fill="none" stroke="rgb(var(--accent))" strokeOpacity=".18" strokeWidth="1.5" />

      {/* beam from the prism to the active reason (always at 3 o'clock) */}
      <path d={`M${C + 38} ${C} L${C + R - 18} ${C}`} stroke="rgb(var(--accent))" strokeWidth="3.5" strokeLinecap="round" />
      <path pathLength={100} className="ray-flow" d={`M${C + 38} ${C} L${C + R - 18} ${C}`} stroke="rgb(var(--ink))" strokeWidth="5" fill="none" style={{ animationDuration: "2s" }} />

      {/* prism at the centre */}
      <polygon points={`${C},${C - 44} ${C - 38},${C + 26} ${C + 38},${C + 26}`} fill="rgb(var(--surface))" stroke="rgb(var(--ink))" strokeOpacity=".8" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={C - 14} cy={C + 4} r="3.5" fill="rgb(var(--accent))" />
      <circle cx={C + 14} cy={C + 4} r="3.5" fill="rgb(var(--accent))" />

      <g className="why-ring" style={{ ["--r" as string]: `${angle}deg` } as CSSProperties}>
        {labels.map((label, i) => {
          const p = pos(i);
          const on = i === active;
          return (
            <g
              key={label}
              role="button"
              tabIndex={0}
              aria-label={`Reason ${i + 1}: ${label}`}
              aria-pressed={on}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(i))}
              className="why-node cursor-pointer outline-none"
            >
              <title>{label}</title>
              <circle cx={p.x} cy={p.y} r={on ? 30 : 21} fill={on ? "rgb(var(--accent))" : "rgb(var(--bg))"} stroke={on ? "rgb(var(--accent))" : "rgb(var(--ink))"} strokeOpacity={on ? 1 : 0.5} strokeWidth="2.5" style={{ transition: "all .5s cubic-bezier(.22,1,.36,1)" }} />
              <text className="why-num" x={p.x} y={p.y + 5.5} textAnchor="middle" fontSize={on ? 18 : 14} fontWeight="700" fontFamily="var(--font-mono)" fill={on ? "rgb(11 31 75)" : "rgb(var(--ink))"} style={{ transition: "font-size .4s" }}>
                {String(i + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

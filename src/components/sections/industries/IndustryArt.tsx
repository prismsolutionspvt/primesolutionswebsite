import type { IndustryArtKind } from "@/types";

/** Line-art pattern giving each industry card its own visual identity. */
export function IndustryArt({ kind, color }: { kind: IndustryArtKind; color: string }) {
  const s = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full" aria-hidden>
      {kind === "grid" &&
        [0, 1, 2, 3].flatMap((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <rect key={`${r}${c}`} x={20 + c * 58} y={20 + r * 52} width="46" height="40" rx="6" {...s} opacity={(r + c) % 3 === 0 ? 1 : 0.35} fill={(r * 5 + c) % 7 === 0 ? color : "none"} />
          )),
        )}
      {kind === "roofs" &&
        [0, 1, 2].map((r) => <path key={r} d={`M10 ${90 + r * 56} L70 ${40 + r * 56} L130 ${90 + r * 56} L190 ${40 + r * 56} L250 ${90 + r * 56} L310 ${40 + r * 56}`} {...s} opacity={1 - r * 0.25} />)}
      {kind === "pulse" && (
        <>
          <path d="M0 120 H90 L110 60 L140 180 L162 96 L178 120 H320" {...s} strokeWidth={3} />
          <path d="M0 170 H100 L120 140 L140 196 L156 160 H320" {...s} opacity={0.35} />
          <path d="M0 70 H70 L84 46 L102 94 L114 70 H320" {...s} opacity={0.35} />
        </>
      )}
      {kind === "lines" &&
        [0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M20 ${200 - i * 30} Q 160 ${160 - i * 34} 300 ${200 - i * 36}`} {...s} opacity={0.3 + i * 0.12} />)}
      {kind === "nodes" && (
        <>
          {[[40, 60], [120, 150], [200, 50], [270, 120], [160, 210], [60, 200], [290, 210]].map(([x, y], i, a) => (
            <g key={i}>
              {i > 0 && <path d={`M${a[i - 1][0]} ${a[i - 1][1]} L${x} ${y}`} {...s} opacity={0.5} />}
              <circle cx={x} cy={y} r={i % 3 === 0 ? 9 : 6} fill={i % 3 === 0 ? color : "none"} stroke={color} strokeWidth="2" />
            </g>
          ))}
          <path d="M40 60 L200 50 L120 150 L270 120 L160 210" {...s} opacity={0.25} />
        </>
      )}
      {kind === "arches" &&
        [0, 1, 2, 3].map((i) => <path key={i} d={`M${20 + i * 76} 220 V120 A32 32 0 0 1 ${84 + i * 76} 120 V220`} {...s} opacity={1 - i * 0.18} />)}
    </svg>
  );
}

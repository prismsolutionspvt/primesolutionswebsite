import type { ReactNode } from "react";

/** One original animated line-graphic per core value. Strokes draw in via the shared `.glyph` CSS (remount to replay). */
const A = "rgb(var(--accent))";
const I = "rgb(var(--ink))";

type PProps = { d: string; i?: number; c?: string; w?: number; o?: number; dash?: string; fill?: string };
const P = ({ d, i = 0, c = I, w = 2.6, o = 1, dash, fill = "none" }: PProps) => (
  <path d={d} pathLength={1} stroke={c} strokeWidth={w} strokeOpacity={o} fill={fill} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} style={{ ["--i" as string]: i }} />
);
/** The star sits in a positioned <g>; the pop animation runs on the inner path (a CSS transform would otherwise replace the position). */
const Spark = ({ x, y, s = 1, i = 0 }: { x: number; y: number; s?: number; i?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path className="glyph-pop" style={{ ["--i" as string]: i }} d="M0 -10 Q1.2 -1.2 10 0 Q1.2 1.2 0 10 Q-1.2 1.2 -10 0 Q-1.2 -1.2 0 -10Z" fill={A} />
  </g>
);

const art: ReactNode[] = [
  // Quality — precision: concentric rings and a confirmed check
  <>
    <P d="M120 30 a70 70 0 1 0 0.1 0Z" o={0.3} i={0} />
    <P d="M120 54 a46 46 0 1 0 0.1 0Z" o={0.55} i={1} />
    <P d="M98 104 l17 19 l36 -42" c={A} w={7} i={3} />
    <Spark x={186} y={42} s={1.3} i={6} />
    <Spark x={48} y={150} s={0.8} i={7} />
  </>,
  // Commitment — two rings held together
  <>
    <P d="M96 50 a50 50 0 1 0 0.1 0Z" i={0} w={3.2} />
    <P d="M144 50 a50 50 0 1 0 0.1 0Z" c={A} i={2} w={3.2} />
    <P d="M120 76 a26 26 0 0 1 0 48" c={A} w={6} o={0.9} i={4} />
    <P d="M120 76 a26 26 0 0 0 0 48" w={6} o={0.55} i={4} />
    <Spark x={120} y={150} s={0.9} i={7} />
  </>,
  // Performance — rising bars and a trend
  <>
    <P d="M56 168 V132 M96 168 V108 M136 168 V84 M176 168 V56" w={14} o={0.28} i={0} />
    <P d="M56 168 V132 M96 168 V108 M136 168 V84 M176 168 V56" w={14} c={A} i={2} dash="1" />
    <P d="M44 118 L98 82 L132 98 L192 38" w={3.4} i={4} />
    <P d="M170 36 H194 V60" w={3.4} i={5} />
    <Spark x={40} y={44} s={0.9} i={7} />
  </>,
  // Trust — a shield with a clear signal radiating from it
  <>
    <P d="M120 30 L172 50 V100 C172 136 146 158 120 172 C94 158 68 136 68 100 V50Z" w={3.2} i={0} />
    <P d="M96 100 l18 19 l32 -38" c={A} w={7} i={3} />
    <P d="M186 74 a40 40 0 0 1 0 52" o={0.4} i={5} />
    <P d="M54 74 a40 40 0 0 0 0 52" o={0.4} i={5} />
    <Spark x={176} y={30} s={0.9} i={7} />
  </>,
  // Adaptability — three forms in one continuous cycle
  <>
    <P d="M120 34 L146 78 H94Z" w={3.2} i={0} />
    <P d="M60 126 h44 v44 h-44z" w={3.2} i={1} />
    <P d="M170 148 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0" w={3.2} c={A} i={2} />
    <P d="M150 62 C 196 70, 204 104, 190 118" o={0.55} i={4} dash="1" />
    <P d="M142 148 C 130 150, 118 150, 108 148" o={0.55} i={5} />
    <P d="M78 118 C 70 98, 80 76, 96 66" o={0.55} i={6} />
    <Spark x={206} y={50} s={0.8} i={8} />
  </>,
];

export function ValueGlyph({ index, className = "" }: { index: number; className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={`glyph ${className}`} aria-hidden fill="none">
      {art[index]}
    </svg>
  );
}

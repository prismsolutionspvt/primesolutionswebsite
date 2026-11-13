import type { ReactNode } from "react";

/** One original line-art scene per stage. Strokes draw in through the shared `.glyph` CSS animation (remount to replay). */
const A = "rgb(var(--accent))";
const I = "rgb(var(--ink))";

type PProps = { d: string; i?: number; c?: string; w?: number; fill?: string; o?: number; dash?: string };
const P = ({ d, i = 0, c = I, w = 2.6, fill = "none", o = 1, dash }: PProps) => (
  <path d={d} pathLength={1} stroke={c} strokeWidth={w} fill={fill} strokeOpacity={o} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} style={{ ["--i" as string]: i }} />
);
const Dot = ({ x, y, r = 5, i = 0, c = A }: { x: number; y: number; r?: number; i?: number; c?: string }) => (
  <circle cx={x} cy={y} r={r} fill={c} className="glyph-pop" style={{ ["--i" as string]: i }} />
);

const scenes: ReactNode[] = [
  // 01 Understand — goals, current processes, expectations
  <>
    <P d="M260 70 a110 110 0 1 0 0.1 0Z" o={0.35} i={0} />
    <P d="M260 108 a72 72 0 1 0 0.1 0Z" o={0.55} i={1} />
    <P d="M260 146 a34 34 0 1 0 0.1 0Z" c={A} w={3.4} i={2} />
    <Dot x={260} y={180} r={8} i={4} />
    <P d="M260 40 V84 M260 276 V320 M110 180 H154 M366 180 H410" o={0.45} i={3} />
    <P d="M350 250 l58 58" w={9} i={5} />
    <P d="M70 330 h70 v40 h-70z M200 330 h70 v40 h-70z" i={6} o={0.7} />
    <P d="M140 350 h60" i={7} c={A} dash="2 8" />
    <P d="M410 70 h80 a12 12 0 0 1 12 12 v40 a12 12 0 0 1 -12 12 h-44 l-18 16 v-16 h-18 a12 12 0 0 1 -12 -12 v-40 a12 12 0 0 1 12 -12Z" i={8} o={0.8} />
  </>,
  // 02 Define — scope, responsibilities, success measures
  <>
    <P d="M120 60 h200 a14 14 0 0 1 14 14 v232 a14 14 0 0 1 -14 14 H120 a14 14 0 0 1 -14 -14 V74 a14 14 0 0 1 14 -14Z" i={0} />
    <P d="M140 110 h140 M140 150 h110 M140 190 h140 M140 230 h90" o={0.4} i={1} />
    <P d="M136 108 l8 8 l14 -16 M136 148 l8 8 l14 -16 M136 188 l8 8 l14 -16" c={A} w={3.2} i={2} />
    <P d="M92 44 H350 V322 H92Z" c={A} dash="3 10" w={2.4} i={3} />
    <P d="M380 260 a70 70 0 0 1 120 -50" w={10} o={0.25} i={4} />
    <P d="M380 260 a70 70 0 0 1 82 -66" c={A} w={10} i={5} />
    <P d="M440 250 l22 -44" i={6} w={4} />
    <Dot x={414} y={110} r={20} c="rgb(var(--surface2))" i={7} />
    <Dot x={456} y={110} r={20} c="rgb(var(--surface2))" i={8} />
    <P d="M414 100 a7 7 0 1 0 0.1 0 M402 124 a12 12 0 0 1 24 0 M456 100 a7 7 0 1 0 0.1 0 M444 124 a12 12 0 0 1 24 0" i={9} o={0.8} w={2.4} />
  </>,
  // 03 Agree — onboarding, access, training, quality
  <>
    <P d="M170 60 L270 94 V178 C270 232 226 266 170 290 C114 266 70 232 70 178 V94Z" i={0} />
    <P d="M128 176 l30 32 l54 -64" c={A} w={7} i={2} />
    <P d="M330 90 h150 a14 14 0 0 1 14 14 v40 a14 14 0 0 1 -14 14 H330 a14 14 0 0 1 -14 -14 v-40 a14 14 0 0 1 14 -14Z" i={3} o={0.75} />
    <P d="M330 182 h150 a14 14 0 0 1 14 14 v40 a14 14 0 0 1 -14 14 H330 a14 14 0 0 1 -14 -14 v-40 a14 14 0 0 1 14 -14Z" i={4} o={0.75} />
    <Dot x={456} y={124} r={13} i={6} />
    <Dot x={354} y={216} r={13} c={I} i={7} />
    <P d="M340 124 h72 M380 216 h72" o={0.35} i={5} />
    <P d="M70 330 h170 M70 360 h110" o={0.4} i={8} />
    <P d="M300 316 a22 22 0 1 0 0.1 0 M322 316 h70 M376 316 v16 M392 316 v12" c={A} w={4} i={9} />
  </>,
  // 04 Deliver — services delivered, progress shared
  <>
    <P d="M60 90 h120 a10 10 0 0 1 10 10 v40 a10 10 0 0 1 -10 10 H60 a10 10 0 0 1 -10 -10 v-40 a10 10 0 0 1 10 -10Z" i={0} o={0.8} />
    <P d="M210 90 h120 a10 10 0 0 1 10 10 v40 a10 10 0 0 1 -10 10 H210 a10 10 0 0 1 -10 -10 v-40 a10 10 0 0 1 10 -10Z" i={1} o={0.8} />
    <P d="M360 90 h120 a10 10 0 0 1 10 10 v40 a10 10 0 0 1 -10 10 H360 a10 10 0 0 1 -10 -10 v-40 a10 10 0 0 1 10 -10Z" c={A} w={3.2} i={2} />
    <P d="M184 120 h12 m-6 -8 l8 8 l-8 8 M334 120 h12 m-6 -8 l8 8 l-8 8" c={A} i={3} />
    <P d="M60 220 h420" o={0.25} w={10} i={4} />
    <P d="M60 220 h300" c={A} w={10} i={5} />
    <P d="M60 270 h420" o={0.25} w={10} i={6} />
    <P d="M60 270 h210" c={A} w={10} i={7} />
    <P d="M60 320 h420" o={0.25} w={10} i={8} />
    <P d="M60 320 h140" c={A} w={10} i={9} />
    <Dot x={360} y={220} r={9} c={I} i={10} />
  </>,
  // 05 Review — performance review and improvement
  <>
    <P d="M120 300 a110 110 0 1 1 200 -60" i={0} o={0.5} />
    <P d="M308 206 l14 36 l-38 4" c={A} w={4} i={1} />
    <P d="M330 316 h170" o={0.4} i={2} />
    <P d="M350 316 v-50 M390 316 v-90 M430 316 v-70 M470 316 v-130" c={A} w={14} i={3} />
    <P d="M200 130 a44 44 0 1 0 0.1 0 M232 162 l36 36" w={7} i={4} />
    <P d="M178 130 l14 14 l26 -30" c={A} w={4} i={5} />
    <Dot x={90} y={300} r={7} i={6} c={I} />
  </>,
];

export function ApproachScene({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 520 380" className="glyph h-full w-full" aria-hidden fill="none">
      {scenes[step]}
    </svg>
  );
}

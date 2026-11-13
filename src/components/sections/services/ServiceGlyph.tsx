import type { ReactNode } from "react";
import { ICON_MAP } from "@/lib/icons";

/** Original line-graphics per service. Each stroke draws in via the .glyph CSS animation (remount to replay). */
const A = "rgb(var(--accent))";
const I = "rgb(var(--ink))";

type PProps = { d: string; i?: number; c?: string; w?: number; fill?: string; o?: number };
const P = ({ d, i = 0, c = I, w = 2.2, fill = "none", o = 1 }: PProps) => (
  <path d={d} pathLength={1} stroke={c} strokeWidth={w} fill={fill} strokeOpacity={o} strokeLinecap="round" strokeLinejoin="round" style={{ ["--i" as string]: i }} />
);
const Dot = ({ x, y, r = 4, i = 0, c = A }: { x: number; y: number; r?: number; i?: number; c?: string }) => (
  <circle cx={x} cy={y} r={r} fill={c} className="glyph-pop" style={{ ["--i" as string]: i }} />
);

const art: Record<string, ReactNode> = {
  "digital-marketing": (
    <>
      <P d="M30 40h190a8 8 0 0 1 8 8v120a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V48a8 8 0 0 1 8-8Z" />
      <P d="M22 62h206" i={1} o={0.5} />
      <P d="M44 150l42-34 32 18 46-52 40-20" c={A} w={3.4} i={2} />
      <P d="M218 62l-14 2 4 12" c={A} w={3.4} i={3} />
      <P d="M52 168v-10M96 168v-26M140 168v-18M184 168v-38" i={4} o={0.55} w={5} />
      <P d="M236 92h56a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8h-30l-16 14v-14h-10a8 8 0 0 1-8-8v-40a8 8 0 0 1 8-8Z" i={5} />
      <P d="M244 112h40M244 126h26" i={6} o={0.5} />
      <Dot x={296} y={74} i={7} r={6} />
      <Dot x={34} y={52} r={2.5} i={7} />
      <Dot x={46} y={52} r={2.5} i={8} />
    </>
  ),
  "customer-support": (
    <>
      <P d="M40 50h130a10 10 0 0 1 10 10v66a10 10 0 0 1-10 10h-70l-28 24v-24H40a10 10 0 0 1-10-10V60a10 10 0 0 1 10-10Z" />
      <P d="M56 80h96M56 102h60" i={1} o={0.5} />
      <P d="M230 100h40a10 10 0 0 1 10 10v50a10 10 0 0 1-10 10h-12v22l-24-22h-4a10 10 0 0 1-10-10v-50a10 10 0 0 1 10-10Z" c={A} w={3} i={2} />
      <Dot x={226} y={135} i={4} r={3.5} />
      <Dot x={242} y={135} i={5} r={3.5} />
      <Dot x={258} y={135} i={6} r={3.5} />
      <P d="M196 40c20-14 52-6 62 14" i={3} o={0.5} />
      <P d="M258 54l-2-14 12 6" i={4} o={0.5} />
    </>
  ),
  "appointment-setting": (
    <>
      <P d="M44 52h180a10 10 0 0 1 10 10v110a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10V62a10 10 0 0 1 10-10Z" />
      <P d="M34 90h200M82 38v26M186 38v26" i={1} />
      <P d="M62 120h18M104 120h18M146 120h18M188 120h18M62 148h18M104 148h18M146 148h18" i={2} o={0.45} w={4} />
      <circle cx="236" cy="168" r="38" fill="rgb(var(--bg))" stroke={A} strokeWidth="3.4" className="glyph-pop" style={{ ["--i" as string]: 4 }} />
      <P d="M219 168l12 12 22-26" c={A} w={4} i={5} />
    </>
  ),
  "sales-telemarketing": (
    <>
      <P d="M64 54c-12 0-26 12-22 34 8 46 52 90 98 98 22 4 34-10 34-22l-2-16-32-12-14 14c-18-8-34-24-42-42l14-14-12-32-16-2c-2 0-4-2-4-6Z" w={2.6} />
      <P d="M170 78c18 6 32 20 38 38" c={A} w={3.4} i={2} />
      <P d="M176 48c34 8 56 30 64 64" c={A} w={3} i={3} o={0.7} />
      <P d="M182 18c52 10 82 44 94 98" c={A} w={2.6} i={4} o={0.45} />
      <P d="M240 196l28-34 14 18 24-40" i={5} w={3} />
      <P d="M292 140h14v14" i={6} w={3} />
    </>
  ),
  "lead-generation": (
    <>
      <P d="M40 62h240l-92 76v50l-56 -28v-22Z" w={2.6} />
      <P d="M70 90h180" i={1} o={0.4} />
      <Dot x={72} y={28} i={2} />
      <Dot x={116} y={20} i={3} c={I} />
      <Dot x={160} y={30} i={4} />
      <Dot x={204} y={20} i={5} c={I} />
      <Dot x={248} y={28} i={6} />
      <P d="M72 36v20M116 28v28M160 38v18M204 28v28M248 36v20" i={7} o={0.35} w={1.6} />
      <Dot x={160} y={214} r={9} i={8} />
      <P d="M160 186v14" c={A} w={3} i={8} />
    </>
  ),
  "back-office-support": (
    <>
      <P d="M70 34h120l30 30v128a8 8 0 0 1-8 8H70a8 8 0 0 1-8-8V42a8 8 0 0 1 8-8Z" />
      <P d="M190 34v30h30" i={1} />
      <P d="M86 92h104M86 116h70M86 140h104M86 164h58" i={2} o={0.45} />
      <P d="M240 70h46a8 8 0 0 1 8 8v110a8 8 0 0 1-8 8h-60" c={A} w={3} i={3} o={0.7} />
      <P d="M250 100l10 10 18-22M250 140l10 10 18-22" c={A} w={3.4} i={4} />
      <Dot x={104} y={190} i={6} r={3} c={I} />
    </>
  ),
  "business-process-outsourcing": (
    <>
      <rect x="28" y="70" width="70" height="52" rx="10" fill="none" stroke={I} strokeWidth="2.4" className="glyph-pop" style={{ ["--i" as string]: 0 }} />
      <rect x="125" y="40" width="70" height="52" rx="10" fill="none" stroke={A} strokeWidth="3.4" className="glyph-pop" style={{ ["--i" as string]: 1 }} />
      <rect x="125" y="140" width="70" height="52" rx="10" fill="none" stroke={I} strokeWidth="2.4" className="glyph-pop" style={{ ["--i" as string]: 2 }} />
      <rect x="226" y="90" width="70" height="52" rx="10" fill="none" stroke={I} strokeWidth="2.4" className="glyph-pop" style={{ ["--i" as string]: 3 }} />
      <P d="M98 90l27-24M98 106l27 58M195 66l31 40M195 166l31-40" c={A} w={2.6} i={4} />
      <P d="M214 100l12 6-4-14M114 76l12-10-14-2" c={A} w={2.6} i={5} />
      <P d="M44 98h38M141 66h38M141 166h38M242 116h38" i={6} o={0.4} w={3.4} />
    </>
  ),
};

/** Services added in the admin panel have no hand-drawn illustration: they get concentric rings around the icon the owner picked. */
function Fallback({ icon }: { icon?: string }) {
  const Icon = (icon && ICON_MAP[icon]) || ICON_MAP.star;
  return (
    <>
      <P d="M160 24 a96 96 0 1 0 0.1 0Z" o={0.28} i={0} />
      <P d="M160 52 a68 68 0 1 0 0.1 0Z" o={0.5} i={1} />
      <P d="M60 120 H100 M220 120 H260" c={A} w={2.6} i={3} />
      <Dot x={60} y={120} i={4} />
      <Dot x={260} y={120} i={4} />
      <Icon x={126} y={86} width={68} height={68} stroke={A} strokeWidth={1.6} />
    </>
  );
}

export function ServiceGlyph({ id, icon, className = "" }: { id: string; icon?: string; className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={`glyph ${className}`} aria-hidden fill="none">
      {art[id] ?? <Fallback icon={icon} />}
    </svg>
  );
}

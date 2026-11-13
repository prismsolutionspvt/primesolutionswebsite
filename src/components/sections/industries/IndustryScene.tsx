import type { ReactNode } from "react";
import type { IndustrySceneKind } from "@/types";

/** Original line-art scenes, one per industry. Each has three depth layers ([data-layer]) that move at different speeds. */
const INK = "rgb(var(--ink))";
const ACC = "rgb(var(--accent))";

type SceneProps = { tone: string };

const common = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const scenes: Record<IndustrySceneKind, (p: SceneProps) => ReactNode> = {
  /** owner-created industries without a dedicated illustration reuse the neutral professional scene */
  generic: (p) => scenes.professional(p),
  healthcare: ({ tone }) => (
    <>
      <g data-layer="1" fill="none" stroke={tone} strokeOpacity=".35" strokeWidth="2">
        <circle cx="260" cy="190" r="160" />
        <circle cx="260" cy="190" r="118" />
        <circle cx="260" cy="190" r="76" />
      </g>
      <g data-layer="2" {...common}>
        <rect x="190" y="120" width="140" height="140" rx="36" fill={tone} fillOpacity=".18" stroke={INK} strokeOpacity=".8" strokeWidth="2.5" />
        <rect x="248" y="142" width="24" height="96" rx="7" fill={ACC} />
        <rect x="212" y="178" width="96" height="24" rx="7" fill={ACC} />
      </g>
      <g data-layer="3" {...common} fill="none">
        <path d="M20 312 H150 l20 -52 l32 94 l24 -72 l14 30 H500" stroke={ACC} strokeWidth="3.5" />
        <rect x="380" y="52" width="104" height="88" rx="16" fill="rgb(var(--bg))" stroke={INK} strokeOpacity=".8" strokeWidth="2.5" />
        <path d="M380 84 H484" stroke={INK} strokeOpacity=".5" strokeWidth="2" />
        <path d="M410 112 l14 14 l30 -34" stroke={ACC} strokeWidth="4" />
      </g>
    </>
  ),
  realestate: ({ tone }) => (
    <>
      <g data-layer="1" fill="none" stroke={tone} strokeOpacity=".4" strokeWidth="2">
        <circle cx="420" cy="84" r="38" fill={tone} fillOpacity=".16" />
        <path d="M0 312 H520" />
      </g>
      <g data-layer="2" {...common} fill={tone} fillOpacity=".2" stroke={INK} strokeOpacity=".75" strokeWidth="2.5">
        <rect x="50" y="160" width="74" height="152" />
        <rect x="134" y="100" width="84" height="212" />
        <rect x="228" y="176" width="64" height="136" />
        <rect x="302" y="128" width="84" height="184" />
        <path d="M150 128 h52 M150 156 h52 M150 184 h52 M150 212 h52 M150 240 h52 M318 156 h52 M318 184 h52 M318 212 h52 M66 190 h42 M66 218 h42" stroke={INK} strokeOpacity=".4" fill="none" />
      </g>
      <g data-layer="3" {...common}>
        <path d="M392 312 V248 L436 212 L480 248 V312Z" fill={ACC} fillOpacity=".22" stroke={ACC} strokeWidth="3" />
        <rect x="424" y="270" width="24" height="42" rx="4" fill="rgb(var(--bg))" stroke={ACC} strokeWidth="2.5" />
        <circle cx="96" cy="66" r="14" fill="none" stroke={ACC} strokeWidth="4" />
        <path d="M110 66 H150 M136 66 v12 M148 66 v10" fill="none" stroke={ACC} strokeWidth="4" />
      </g>
    </>
  ),
  ecommerce: ({ tone }) => (
    <>
      <g data-layer="1" fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 12">
        <path d="M24 322 C 150 190, 310 350, 492 118" />
      </g>
      <g data-layer="2" {...common}>
        <rect x="160" y="140" width="176" height="146" rx="12" fill={tone} fillOpacity=".22" stroke={INK} strokeOpacity=".8" strokeWidth="2.5" />
        <rect x="236" y="140" width="32" height="146" fill={ACC} />
        <rect x="190" y="236" width="30" height="16" rx="3" fill="rgb(var(--bg))" stroke={INK} strokeOpacity=".5" />
        <path d="M160 140 l30 -34 h146 l0 34" fill={tone} fillOpacity=".12" stroke={INK} strokeOpacity=".6" strokeWidth="2" />
      </g>
      <g data-layer="3" {...common}>
        <path d="M384 190 h84 l14 112 h-112z" fill="rgb(var(--bg))" stroke={INK} strokeOpacity=".8" strokeWidth="2.5" />
        <path d="M406 190 v-20 a20 20 0 0 1 40 0 v20" fill="none" stroke={INK} strokeOpacity=".8" strokeWidth="2.5" />
        <circle cx="492" cy="118" r="10" fill={ACC} />
        <circle cx="492" cy="118" r="22" fill="none" stroke={ACC} strokeOpacity=".4" strokeWidth="2" />
      </g>
    </>
  ),
  saas: ({ tone }) => (
    <>
      <g data-layer="1" fill={tone} fillOpacity=".35">
        {[0, 1, 2, 3, 4, 5].flatMap((r) => [0, 1, 2, 3, 4, 5, 6, 7].map((c) => <circle key={`${r}${c}`} cx={40 + c * 62} cy={36 + r * 60} r="2.6" />))}
      </g>
      <g data-layer="2" {...common}>
        <rect x="110" y="66" width="270" height="176" rx="20" fill={tone} fillOpacity=".12" stroke={INK} strokeOpacity=".35" strokeWidth="2" />
        <rect x="140" y="98" width="270" height="176" rx="20" fill={tone} fillOpacity=".2" stroke={INK} strokeOpacity=".55" strokeWidth="2" />
        <rect x="170" y="130" width="270" height="176" rx="20" fill="rgb(var(--bg))" stroke={INK} strokeOpacity=".85" strokeWidth="2.5" />
        <circle cx="198" cy="158" r="5" fill={ACC} />
        <circle cx="216" cy="158" r="5" fill={INK} fillOpacity=".3" />
        <circle cx="234" cy="158" r="5" fill={INK} fillOpacity=".3" />
        <path d="M198 196 h160 M198 222 h110 M198 248 h140" stroke={INK} strokeOpacity=".35" strokeWidth="3" />
      </g>
      <g data-layer="3" {...common} fill="none" stroke={ACC} strokeWidth="5">
        <path d="M88 300 l-30 -26 l30 -26" />
        <path d="M130 248 l30 26 l-30 26" />
        <circle cx="448" cy="86" r="9" fill={ACC} stroke="none" />
        <path d="M448 95 V140" strokeWidth="2.5" strokeOpacity=".5" />
      </g>
    </>
  ),
  professional: ({ tone }) => (
    <>
      <g data-layer="1">
        <circle cx="330" cy="190" r="150" fill={tone} fillOpacity=".14" />
        <circle cx="330" cy="190" r="104" fill="none" stroke={tone} strokeOpacity=".4" strokeWidth="2" />
      </g>
      <g data-layer="2" {...common} fill="rgb(var(--bg))" stroke={INK} strokeOpacity=".8" strokeWidth="2.5">
        <rect x="110" y="86" width="172" height="224" rx="14" transform="rotate(-7 196 198)" fillOpacity=".7" />
        <rect x="118" y="82" width="172" height="224" rx="14" transform="rotate(-2 204 194)" />
        <rect x="128" y="76" width="172" height="224" rx="14" transform="rotate(4 214 188)" />
        <path d="M156 120 h96 M156 150 h116 M156 180 h80 M156 210 h104" stroke={INK} strokeOpacity=".35" strokeWidth="3" transform="rotate(4 214 188)" />
      </g>
      <g data-layer="3" {...common}>
        {[
          [372, 70],
          [402, 110],
          [432, 86],
          [462, 150],
        ].map(([x, h], i) => (
          <rect key={i} x={x} y={300 - h * 1.1} width="20" height={h * 1.1} rx="4" fill={i % 2 ? tone : ACC} fillOpacity={i % 2 ? 0.7 : 1} />
        ))}
        <path d="M356 310 H486" stroke={INK} strokeOpacity=".5" strokeWidth="2.5" />
        <path d="M326 70 l50 -26" fill="none" stroke={ACC} strokeWidth="4" />
      </g>
    </>
  ),
  finance: ({ tone }) => (
    <>
      <g data-layer="1" fill="none" stroke={tone} strokeOpacity=".4" strokeWidth="2">
        <path d="M0 280 C 120 200, 220 330, 340 230 S 480 150, 520 170" />
        <path d="M0 316 C 130 240, 230 360, 350 270 S 490 190, 520 206" />
      </g>
      <g data-layer="2" {...common}>
        <path d="M260 66 L366 102 V192 C366 254 314 294 260 318 C206 294 154 254 154 192 V102Z" fill={tone} fillOpacity=".2" stroke={INK} strokeOpacity=".85" strokeWidth="2.5" />
        <path d="M212 190 l34 36 l66 -78" fill="none" stroke={ACC} strokeWidth="9" />
      </g>
      <g data-layer="3" {...common}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <ellipse cx="82" cy={300 - i * 22} rx="48" ry="15" fill={ACC} fillOpacity={0.35 + i * 0.25} stroke={INK} strokeOpacity=".5" strokeWidth="2" />
          </g>
        ))}
        <path d="M392 300 l32 -30 l30 14 l46 -74" fill="none" stroke={ACC} strokeWidth="4" />
        <circle cx="470" cy="210" r="8" fill={ACC} />
      </g>
    </>
  ),
};

export function IndustryScene({ kind, tone }: { kind: IndustrySceneKind; tone: string }) {
  return (
    <svg viewBox="0 0 520 380" className="h-full w-full" aria-hidden fill="none">
      {scenes[kind]({ tone })}
    </svg>
  );
}

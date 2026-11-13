/**
 * An original assistant robot on a landline telephone — drawn for Prism in the brand palette.
 * All motion is CSS (see `.robot-*` in globals.css) and is disabled under prefers-reduced-motion.
 * `ringing` adds the sound-wave / bell animation to the telephone.
 */
export function RobotScene({ ringing = false }: { ringing?: boolean }) {
  const NAVY = "#0B1F4B";
  const ORANGE = "#F28A1E";
  const AMBER = "#F7A83B";
  return (
    <svg viewBox="0 0 260 200" className={`robot h-full w-full ${ringing ? "is-ringing" : ""}`} aria-hidden fill="none">
      {/* desk */}
      <rect x="14" y="170" width="232" height="9" rx="4.5" fill={NAVY} fillOpacity=".14" />

      {/* telephone: base, rotary dial, bell */}
      <g className="robot-phone">
        <path d="M156 172 h84 l-9 -34 h-66z" fill={NAVY} />
        <rect x="164" y="128" width="68" height="10" rx="5" fill={NAVY} />
        <circle cx="198" cy="156" r="13" fill="#fff" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle key={a} cx={198 + 8 * Math.cos((a * Math.PI) / 180)} cy={156 + 8 * Math.sin((a * Math.PI) / 180)} r="1.9" fill={NAVY} />
        ))}
        <circle cx="198" cy="156" r="3.2" fill={ORANGE} />
        <g className="robot-bell">
          <path d="M176 128 a22 14 0 0 1 44 0" fill={ORANGE} />
          <circle cx="198" cy="112" r="3.5" fill={AMBER} />
        </g>
        {/* ring waves */}
        <g className="robot-waves" stroke={ORANGE} strokeWidth="2.6" strokeLinecap="round">
          <path d="M158 104 q-9 -12 0 -24" />
          <path d="M148 110 q-15 -18 0 -36" />
          <path d="M238 104 q9 -12 0 -24" />
          <path d="M248 110 q15 -18 0 -36" />
        </g>
      </g>

      {/* coiled cord from handset to base */}
      <path className="robot-cord" d="M124 100 c-6 22 22 8 20 28 c-2 18 22 -2 32 14" stroke={NAVY} strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />

      {/* robot */}
      <g className="robot-body">
        {/* torso */}
        <rect x="38" y="112" width="78" height="62" rx="20" fill={NAVY} />
        <circle cx="77" cy="140" r="9" fill={ORANGE} />
        <circle cx="77" cy="140" r="14" fill="none" stroke={AMBER} strokeOpacity=".5" strokeWidth="2" />
        {/* head */}
        <g className="robot-head">
          <line x1="77" y1="38" x2="77" y2="22" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
          <path className="robot-star" d="M77 6 Q79 18 91 20 Q79 22 77 34 Q75 22 63 20 Q75 18 77 6Z" fill={ORANGE} />
          <rect x="36" y="38" width="82" height="64" rx="22" fill="#fff" stroke={NAVY} strokeWidth="4" />
          <rect x="46" y="52" width="62" height="34" rx="14" fill={NAVY} />
          <g className="robot-eyes" fill={AMBER}>
            <rect x="58" y="62" width="9" height="14" rx="4.5" />
            <rect x="87" y="62" width="9" height="14" rx="4.5" />
          </g>
          <rect x="28" y="60" width="9" height="22" rx="4.5" fill={NAVY} />
          <rect x="117" y="60" width="9" height="22" rx="4.5" fill={NAVY} />
        </g>
        {/* arm holding the handset */}
        <g className="robot-arm">
          <path d="M108 126 C 124 124, 128 112, 128 98" stroke={NAVY} strokeWidth="11" strokeLinecap="round" />
          <g className="robot-handset">
            <rect x="120" y="52" width="16" height="54" rx="8" fill={NAVY} />
            <rect x="118" y="46" width="20" height="16" rx="8" fill={ORANGE} />
            <rect x="118" y="96" width="20" height="14" rx="7" fill={ORANGE} />
          </g>
          <circle cx="128" cy="100" r="8.5" fill="#fff" stroke={NAVY} strokeWidth="3" />
        </g>
      </g>
    </svg>
  );
}

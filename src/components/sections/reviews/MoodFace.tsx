"use client";
import { motion, useReducedMotion } from "framer-motion";

/** One mood per rating (0 = nothing chosen yet). Colours sit around the brand's navy and orange. */
export const MOODS = [
  { label: "Tap a star", color: "#8FA0C4" },
  { label: "That was rough", color: "#E4572E" },
  { label: "Could be better", color: "#F28A1E" },
  { label: "Pretty good", color: "#F7A83B" },
  { label: "Really great", color: "#4FB286" },
  { label: "Brilliant!", color: "#1FB6A6" },
] as const;

/** Mouth control-point height per rating: frown → flat → big smile. Same path structure, so framer-motion morphs it. */
const MOUTH_Y = [128, 106, 117, 128, 150, 170];
const mouth = (r: number) => `M 64 126 Q 100 ${MOUTH_Y[r]} 136 126`;

/**
 * A face that reacts to the rating: the mouth morphs from a frown to a grin, the eyes squint when delighted,
 * cheeks appear, and the whole disc takes the mood colour. Purely decorative (aria-hidden); the rating itself is a
 * real radio group.
 */
export function MoodFace({ rating }: { rating: number }) {
  const reduce = useReducedMotion();
  const { color } = MOODS[rating];
  const t = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 220, damping: 16 };
  const happy = rating >= 4;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]" aria-hidden>
      {/* soft mood-coloured halo */}
      <motion.div className="absolute inset-[-8%] rounded-full blur-3xl" animate={{ backgroundColor: color, opacity: rating ? 0.42 : 0.18 }} transition={{ duration: reduce ? 0 : 0.6 }} />
      {/* slowly turning dashed ring */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgb(var(--ink))" strokeOpacity=".16" strokeWidth="1.2" strokeDasharray="2 9" className="mood-spin" />
      </svg>
      <motion.svg viewBox="0 0 200 200" className="relative h-full w-full" animate={reduce ? undefined : { rotate: rating ? [0, -4, 4, 0] : 0, scale: rating ? [1, 1.06, 1] : 1 }} transition={{ duration: 0.5 }} key={rating}>
        <motion.circle cx="100" cy="100" r="78" animate={{ fill: color }} transition={{ duration: reduce ? 0 : 0.5 }} />
        <circle cx="100" cy="100" r="78" fill="url(#moodShade)" />
        <defs>
          <radialGradient id="moodShade" cx="35%" cy="28%" r="80%">
            <stop offset="0" stopColor="#fff" stopOpacity=".45" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#0B1F4B" stopOpacity=".18" />
          </radialGradient>
        </defs>
        {/* cheeks */}
        <motion.ellipse cx="58" cy="116" rx="11" ry="7" fill="#fff" animate={{ opacity: happy ? 0.35 : 0 }} transition={t} />
        <motion.ellipse cx="142" cy="116" rx="11" ry="7" fill="#fff" animate={{ opacity: happy ? 0.35 : 0 }} transition={t} />
        {/* eyes (they squint into happy arcs at 5) */}
        <motion.ellipse cx="72" cy="88" rx="8" fill="#0B1F4B" animate={{ ry: rating === 5 ? 3 : rating === 1 ? 6 : 9, cy: rating === 5 ? 90 : 88 }} transition={t} />
        <motion.ellipse cx="128" cy="88" rx="8" fill="#0B1F4B" animate={{ ry: rating === 5 ? 3 : rating === 1 ? 6 : 9, cy: rating === 5 ? 90 : 88 }} transition={t} />
        {/* brows tilt with the mood */}
        <motion.path d="M 58 70 L 86 70" stroke="#0B1F4B" strokeWidth="5" strokeLinecap="round" animate={{ rotate: rating === 1 ? 14 : rating === 2 ? 6 : rating >= 4 ? -6 : 0, y: rating >= 4 ? -4 : 0 }} style={{ originX: "72px", originY: "70px" }} transition={t} />
        <motion.path d="M 114 70 L 142 70" stroke="#0B1F4B" strokeWidth="5" strokeLinecap="round" animate={{ rotate: rating === 1 ? -14 : rating === 2 ? -6 : rating >= 4 ? 6 : 0, y: rating >= 4 ? -4 : 0 }} style={{ originX: "128px", originY: "70px" }} transition={t} />
        {/* mouth: one path that morphs */}
        <motion.path fill="none" stroke="#0B1F4B" strokeWidth="7" strokeLinecap="round" animate={{ d: mouth(rating) }} transition={t} d={mouth(0)} />
      </motion.svg>
    </div>
  );
}

const Star = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-[0.42em] w-[0.42em] shrink-0 text-accent" fill="currentColor">
    <path d="M12 0Q13 10.5 24 12Q13 13.5 12 24Q11 13.5 0 12Q11 10.5 12 0Z" />
  </svg>
);

/**
 * A slow, looping line of brand phrases that opens the closing scene.
 * Hover pauses it, and the phrase under the cursor lights up in the accent colour. Static under reduced motion.
 */
export function FooterMarquee({ phrases }: { phrases: string[] }) {
  const row = (key: string) =>
    phrases.map((p, i) => (
      <span key={`${key}${i}`} className="marquee-item inline-flex items-center gap-[0.5em] pr-[0.5em]">
        <span className={`marquee-text ${i === 0 ? "text-ink" : "text-ink/30"}`}>{p}</span>
        <Star />
      </span>
    ));
  return (
    <div className="marquee overflow-hidden border-y border-line py-5 sm:py-7" role="group" aria-label={phrases.join(". ")}>
      <div className="marquee-track" aria-hidden>
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

/** The brand's four-point star. */
export const STAR_PATH = "M12 0Q13 10.5 24 12Q13 13.5 12 24Q11 13.5 0 12Q11 10.5 12 0Z";

/** Read-only rating display (server-safe). */
export function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-1" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${className} ${i <= value ? "text-accent" : "text-line"}`} fill="currentColor" aria-hidden>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

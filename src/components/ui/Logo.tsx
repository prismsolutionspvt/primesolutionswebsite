import { useId } from "react";

/**
 * Vector re-creation of the Prism arc + star mark so it can follow the active theme.
 * The original raster logo lives at /public/brand/logo-source.webp — replace the paths
 * below (or swap this component for <Image/>) when final vector artwork is supplied.
 */
export function PrismMark({ className = "", title }: { className?: string; title?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 132 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} fill="none">
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#F28A1E" />
          <stop offset="1" stopColor="#F7A83B" />
        </linearGradient>
      </defs>
      <path
        data-mark="arc"
        d="M2 62C30 20 72 1 112 9C76 9 36 28 2 62Z"
        fill={`url(#${id}g)`}
      />
      <path
        data-mark="star"
        d="M120 8 Q122 20 132 22 Q122 24 120 36 Q118 24 108 22 Q118 20 120 8Z"
        fill="#F7A83B"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="font-display text-[1.45rem] font-extrabold italic tracking-tight">Prism</span>
      <span className="mt-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.42em] opacity-80">Solutions</span>
    </span>
  );
}

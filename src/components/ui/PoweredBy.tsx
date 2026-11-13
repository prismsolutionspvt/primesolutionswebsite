import { ArrowUpRight } from "lucide-react";
import { poweredBy as defaults } from "@/config/site";

/**
 * "Powered by FRX Technologies" — an intentional brand credit, not legal small print.
 * The whole pill is the link (opens in a new tab). Colours come from theme tokens, so it stays legible in
 * Light, Dark and Prism Adaptive, and on the always-white preloader. Used in the preloader and the footer.
 */
export function PoweredBy({ className = "", label = defaults.label, href = defaults.href }: { className?: string; label?: string; href?: string }) {
  const poweredBy = { label, href };
  return (
    <a
      href={poweredBy.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Powered by ${poweredBy.label} (opens in a new tab)`}
      className={`powered-by group relative inline-flex min-h-[46px] items-center gap-3 overflow-hidden rounded-full px-5 ${className}`}
    >
      <span aria-hidden className="powered-by-sheen" />
      <span className="relative font-mono text-[0.66rem] font-medium uppercase tracking-[0.3em] text-muted">Powered by</span>
      <span className="relative font-display text-[1.06rem] font-semibold tracking-tight text-ink">{poweredBy.label}</span>
      <ArrowUpRight className="relative h-4 w-4 text-accent-text transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

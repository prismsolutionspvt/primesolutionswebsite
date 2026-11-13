import { commitment } from "@/content";

/** The five service commitments from the portfolio as a quiet row. Each column lights up on hover: a line draws across the top, the number turns accent. */
export function CommitmentGrid() {
  return (
    <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-5">
      {commitment.items.map((c, i) => (
        <li key={c.title} className="group relative bg-bg p-6 transition-colors duration-500 hover:bg-surface sm:p-7">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100" />
          <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/0 blur-2xl transition-colors duration-700 group-hover:bg-accent/25" />
          <p className="relative font-mono text-xs text-muted transition-colors duration-300 group-hover:text-accent-text">{String(i + 1).padStart(2, "0")}</p>
          <h3 className="relative mt-4 font-display text-[1.25rem] font-semibold leading-tight tracking-tight transition-transform duration-500 group-hover:translate-x-1">{c.title}</h3>
          <p className="relative mt-2.5 text-[0.93rem] leading-relaxed text-muted">{c.text}</p>
        </li>
      ))}
    </ol>
  );
}

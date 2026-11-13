import type { LucideIcon } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";

type CardProps = { icon: LucideIcon; label: string; value: string; href?: string; copy?: boolean; emptyText?: string };

/** A contact detail with a layered hover: the chip fills, the border and glow rise, and the value underlines. */
export function ContactCard({ icon: Icon, label, value, href, copy, emptyText }: CardProps) {
  const empty = !value;
  return (
    <div className={`group relative min-w-0 overflow-hidden rounded-2xl border p-4 transition-all duration-500 ${empty ? "border-dashed border-line" : "border-line bg-surface/60 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_14px_40px_-18px_rgb(var(--glow)/0.7)]"}`}>
      <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/0 blur-2xl transition-colors duration-500 group-hover:bg-accent/25" />
      <div className="relative flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-line text-accent-text transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-105 group-hover:border-accent group-hover:bg-accent group-hover:text-[#0B1F4B]">
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-muted">{label}</span>
        </span>
        {copy && !empty && <CopyButton value={value} label={label.toLowerCase()} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100" />}
      </div>
      <p className="relative mt-3 text-[0.92rem] font-medium leading-snug">
        {empty ? (
          <span className="text-muted">{emptyText}</span>
        ) : href ? (
          <a className="link-u break-all" href={href}>
            {value}
          </a>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

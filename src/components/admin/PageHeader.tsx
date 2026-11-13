import type { ReactNode } from "react";

export function PageHeader({ title, description, actions, eyebrow = "Manage" }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0 max-w-2xl">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="h-display text-[clamp(1.9rem,4.4vw,2.8rem)]">{title}</h1>
        {description && <p className="mt-3 text-[0.98rem] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions}
    </header>
  );
}

/** A titled block on a page (used to stack several forms / lists). */
export function Block({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      {title && (
        <div className="mb-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

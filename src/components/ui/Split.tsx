import { createElement, type ReactNode } from "react";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  children: string;
  className?: string;
  /** Words to render in the accent colour */
  accent?: string[];
  id?: string;
};

/**
 * Server-rendered word masks. Full text stays in the DOM for SEO/screen readers;
 * <MotionRoot/> animates [data-split] on scroll. "\n" forces a line break.
 */
export function Split({ as = "h2", children, className = "", accent = [], id }: Props) {
  const lines = children.split("\n");
  const out: ReactNode[] = [];
  lines.forEach((line, li) => {
    line.split(" ").forEach((w, wi) => {
      if (!w) return;
      const isAccent = accent.includes(w) || accent.includes(w.replace(/[.,]/g, ""));
      out.push(
        <span key={`${li}-${wi}`} className="sp-mask" aria-hidden>
          <span className={`sp-word ${isAccent ? "text-accent" : ""}`}>{w}</span>
        </span>,
        " ",
      );
    });
    if (li < lines.length - 1) out.push(<br key={`br${li}`} className="hidden md:block" />);
  });
  return createElement(
    as,
    { className, "data-split": "", "aria-label": children.replace(/\n/g, " "), id },
    out,
  );
}

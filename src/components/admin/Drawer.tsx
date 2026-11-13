"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Slide-over panel: full screen on phones, a wide side sheet on desktop. Focus is trapped; Escape closes. */
export function Drawer({ open, onClose, title, subtitle, footer, children, z = 100 }: { open: boolean; onClose: () => void; title: string; subtitle?: string; footer?: ReactNode; children: ReactNode; z?: number }) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("input,textarea,select")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      // a nested dialog (image picker / confirm) handles its own Escape
      if (e.key === "Escape" && !document.querySelector('[aria-modal="true"][data-nested]') && !document.querySelector('[role="alertdialog"]')) closeRef.current();
      if (e.key !== "Tab" || !panel.current) return;
      if (document.querySelector('[aria-modal="true"][data-nested]') || document.querySelector('[role="alertdialog"]')) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const [a, z2] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z2.focus();
      } else if (!e.shiftKey && document.activeElement === z2) {
        e.preventDefault();
        a.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: z }}>
      <div aria-hidden className="adm-fade absolute inset-0 bg-[#040A1A]/55 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title} className="adm-slide relative flex h-full w-full max-w-2xl flex-col bg-bg shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.5)]">
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-ink transition hover:bg-surface2">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">{children}</div>
        {footer && <footer className="flex flex-col-reverse gap-3 border-t border-line bg-surface/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">{footer}</footer>}
      </div>
    </div>
  );
}

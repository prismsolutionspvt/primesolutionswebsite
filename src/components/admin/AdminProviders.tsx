"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";

type ToastKind = "ok" | "error";
type ToastItem = { id: number; kind: ToastKind; text: string };
type ConfirmOptions = { title: string; body?: ReactNode; confirmLabel?: string; danger?: boolean };
type Ctx = { toast: (kind: ToastKind, text: string) => void; confirm: (o: ConfirmOptions) => Promise<boolean> };

const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => {
  const c = useContext(AdminCtx);
  if (!c) throw new Error("useAdmin must be used inside <AdminProviders>");
  return c;
};

/** Success / error toasts and an accessible confirmation dialog (used for every destructive action). */
export function AdminProviders({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [ask, setAsk] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);

  const toast = useCallback((kind: ToastKind, text: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 3800);
  }, []);

  const confirm = useCallback(
    (o: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        returnTo.current = document.activeElement;
        setAsk({ ...o, resolve });
      }),
    [],
  );
  const answer = (v: boolean) => {
    ask?.resolve(v);
    setAsk(null);
    (returnTo.current as HTMLElement | null)?.focus?.();
  };

  useEffect(() => {
    if (!ask) return;
    panel.current?.querySelector<HTMLElement>("[data-cancel]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") answer(false);
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>("button"));
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask]);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);
  return (
    <AdminCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${t.kind === "ok" ? "border-[#2F8071]/40 bg-bg/95" : "border-red-500/50 bg-bg/95"}`}>
            {t.kind === "ok" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8071]" aria-hidden /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />}
            <p className="leading-snug">{t.text}</p>
            <button type="button" onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))} aria-label="Dismiss" className="-mr-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {ask && (
        <div className="fixed inset-0 z-[210] grid place-items-center bg-[#040A1A]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && answer(false)}>
          <div ref={panel} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-3xl border border-line bg-bg p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              {ask.danger && (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-500">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </span>
              )}
              <div>
                <h2 id="confirm-title" className="font-display text-xl font-semibold">
                  {ask.title}
                </h2>
                {ask.body && <div className="mt-2 text-sm leading-relaxed text-muted">{ask.body}</div>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" data-cancel onClick={() => answer(false)} className="btn btn-ghost !min-h-[44px]">
                Cancel
              </button>
              <button type="button" onClick={() => answer(true)} className={`btn !min-h-[44px] ${ask.danger ? "bg-red-600 text-white hover:bg-red-700" : "btn-primary"}`}>
                {ask.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminCtx.Provider>
  );
}

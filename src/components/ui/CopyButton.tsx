"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies `value` to the clipboard with a clear "Copied" confirmation (announced to screen readers). */
export function CopyButton({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 1800);
    } catch {
      /* clipboard unavailable: the value is still shown and selectable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? `${label} copied` : `Copy ${label}`}
      title={done ? "Copied" : `Copy ${label}`}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-all duration-300 hover:border-accent hover:bg-accent hover:text-[#0B1F4B] focus-visible:opacity-100 ${className}`}
    >
      {done ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span className="sr-only" role="status">
        {done ? "Copied" : ""}
      </span>
    </button>
  );
}

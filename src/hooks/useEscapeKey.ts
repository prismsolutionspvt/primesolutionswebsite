"use client";
import { useEffect } from "react";

/** Calls `handler` when Escape is pressed, while `active` is true. */
export function useEscapeKey(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handler();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler, active]);
}

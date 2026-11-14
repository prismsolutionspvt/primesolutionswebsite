"use client";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/**
 * Branded error screen for anything that fails while rendering. It deliberately shows NO technical detail
 * (no message, stack, path or digest): details stay in the server logs.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // kept out of the visitor's view; the digest ties this to the server log entry
    console.error("[page error]", error.digest ?? "no-digest");
  }, [error]);

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden px-5 py-16 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_45%_at_50%_35%,rgb(var(--glow)/0.14),transparent_70%)]" />
      <div className="relative max-w-lg" role="alert">
        <p className="eyebrow mb-4">Something went wrong</p>
        <h1 className="h-display text-[clamp(2.2rem,7vw,3.6rem)]">We hit a snag.</h1>
        <p className="mx-auto mt-5 max-w-md text-[1.02rem] leading-relaxed text-muted">The page could not be shown right now. Please try again. If it keeps happening, contact us and we will sort it out.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-primary w-full sm:w-auto">
            <RotateCcw className="h-[18px] w-[18px]" aria-hidden /> Try again
          </button>
          <a href="/" className="btn btn-ghost w-full sm:w-auto">
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
}

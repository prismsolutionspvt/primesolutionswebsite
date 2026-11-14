"use client";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/** An admin page failed to load (for example the database is unreachable). No technical detail is shown. */
export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin error]", error.digest ?? "no-digest");
  }, [error]);
  return (
    <div role="alert" className="rounded-3xl border border-line bg-bg p-8 text-center sm:p-12">
      <h1 className="font-display text-2xl font-semibold">This page could not be loaded.</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">The database may be temporarily unreachable. Nothing you saved is lost. Try again in a moment.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6 !min-h-[46px]">
        <RotateCcw className="h-4 w-4" aria-hidden /> Try again
      </button>
    </div>
  );
}

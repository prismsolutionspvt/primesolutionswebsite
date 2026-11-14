"use client";

/** Last-resort screen if the root layout itself fails. Self-contained (no app CSS), no technical detail shown. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff", color: "#0B1F4B", display: "grid", minHeight: "100vh", placeItems: "center", textAlign: "center", padding: 24 }}>
        <main role="alert">
          <h1 style={{ fontSize: 32, margin: "0 0 12px" }}>We hit a snag.</h1>
          <p style={{ maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.6, color: "#465476" }}>The website could not be shown right now. Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ background: "#F28A1E", color: "#0B1F4B", border: 0, borderRadius: 999, padding: "14px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

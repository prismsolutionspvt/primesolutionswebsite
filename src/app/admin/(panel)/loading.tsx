/** Shown inside the admin frame while a page loads its data. */
export default function PanelLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-6">
      <span className="sr-only">Loading…</span>
      <div className="h-4 w-24 rounded-full bg-line" />
      <div className="h-12 w-2/3 max-w-md rounded-2xl bg-line" />
      <div className="h-4 w-full max-w-xl rounded-full bg-line" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-3xl bg-line/70" />
        ))}
      </div>
    </div>
  );
}

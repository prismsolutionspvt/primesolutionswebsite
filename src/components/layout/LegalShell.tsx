import { ArrowLeft } from "lucide-react";
import { PrismMark, Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <div className="wrap flex items-center justify-between py-5">
        <a href="/" className="flex items-center gap-2.5" aria-label="Prism Solutions home">
          <PrismMark className="h-7 w-auto" />
          <Wordmark />
        </a>
        <ThemeToggle />
      </div>
      <article className="wrap max-w-3xl py-16 sm:py-24">
        <a href="/" className="link-u mb-10 inline-flex min-h-[44px] items-center gap-2 text-sm text-muted">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </a>
        <h1 className="h-display text-5xl sm:text-6xl">{title}</h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">{children}</div>
      </article>
    </main>
  );
}

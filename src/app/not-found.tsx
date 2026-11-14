import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

/** Branded 404. Shows nothing technical: no path, no stack, just a way home. */
export default function NotFound() {
  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden px-5 py-16 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_45%_at_50%_35%,rgb(var(--glow)/0.16),transparent_70%)]" />
      <div className="relative max-w-lg">
        <a href="/" aria-label="Prism Solutions home" className="mb-10 inline-flex">
          <BrandLogo height={60} priority />
        </a>
        <p className="eyebrow mb-4">Error 404</p>
        <h1 className="h-display text-[clamp(2.4rem,8vw,4.2rem)]">
          This page took a <span className="text-accent">different path.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[1.02rem] leading-relaxed text-muted">The page you are looking for does not exist or has moved. Let&apos;s get you back to something useful.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="/" className="btn btn-primary group w-full sm:w-auto">
            Back to home
            <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </a>
          <a href="/#contact" className="btn btn-ghost w-full sm:w-auto">
            Contact us
          </a>
        </div>
      </div>
    </main>
  );
}

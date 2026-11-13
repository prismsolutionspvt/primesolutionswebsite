import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getAdmin } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  link_failed: "That sign-in link could not be used. Links work once, expire quickly, and must be opened in the same browser you requested them from. Please request a new one.",
  rate_limited: "Too many attempts. Please wait a minute and try again.",
};

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden px-5 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_45%_at_50%_30%,rgb(var(--glow)/0.16),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,rgb(var(--line)/0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--line)/0.8)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(60%_55%_at_50%_40%,black,transparent)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo height={64} priority />
        </div>
        <div className="rounded-[2rem] border border-line bg-bg/90 p-7 shadow-[0_40px_90px_-40px_rgb(var(--ink)/0.45)] backdrop-blur sm:p-9">
          <p className="eyebrow flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Owner access
          </p>
          <h1 className="h-display mt-3 text-3xl sm:text-4xl">Sign in to manage the website</h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
            This area is private. Enter the owner’s email address and we’ll send a one-time sign-in link. There is no password.
          </p>
          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-[#F28A1E]/40 bg-[#F28A1E]/10 p-3 text-sm leading-relaxed">
              {ERRORS[error] ?? ERRORS.link_failed}
            </p>
          )}
          {!isSupabaseConfigured && (
            <p role="alert" className="mt-5 rounded-xl border border-line bg-surface p-3 text-sm text-muted">
              Supabase is not configured on this server (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).
            </p>
          )}
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        <a href="/" className="link-u mx-auto mt-6 flex min-h-[44px] w-fit items-center gap-2 text-sm text-muted">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to the website
        </a>
      </div>
    </main>
  );
}

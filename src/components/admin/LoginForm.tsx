"use client";
import { useActionState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { requestSignInLink, type LinkState } from "@/admin/actions/auth";

const idle: LinkState = { status: "idle", message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(requestSignInLink, idle);

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-line bg-surface p-6 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-accent" aria-hidden />
        <p className="mt-4 font-display text-xl font-semibold">Check your inbox</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{state.message}</p>
        <p className="mt-4 text-xs leading-relaxed text-muted">Open the link in this same browser. Nothing arrived after a few minutes? Check spam, then request a new one.</p>
      </div>
    );
  }

  const bad = state.status === "invalid" || state.status === "limited" || state.status === "unavailable";
  return (
    <form action={action} noValidate className="space-y-4">
      <label htmlFor="email" className="block text-sm font-semibold">
        Email address
      </label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={160}
          placeholder="you@example.com"
          aria-invalid={bad}
          aria-describedby={bad ? "login-error" : undefined}
          className="h-14 w-full rounded-2xl border border-line bg-bg pl-12 pr-4 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
        />
      </div>
      {bad && (
        <p id="login-error" role="alert" className="text-sm text-[#C2410C]">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary group w-full !min-h-[54px] disabled:opacity-70">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
        {pending ? "Sending link…" : "Email me a sign-in link"}
        {!pending && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />}
      </button>
    </form>
  );
}

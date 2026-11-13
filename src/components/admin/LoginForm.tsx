"use client";
import { useActionState, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import { requestSignInLink, signInWithPassword, type LinkState, type PasswordState } from "@/admin/actions/auth";

const idleLink: LinkState = { status: "idle", message: "" };
const idlePw: PasswordState = { status: "idle", message: "" };
const input =
  "h-14 w-full rounded-2xl border border-line bg-bg pl-12 pr-4 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 aria-[invalid=true]:border-red-500";

/** Password sign-in first; a one-time email link is available as the backup way in. */
export function LoginForm() {
  const [mode, setMode] = useState<"password" | "link">("password");
  return mode === "password" ? <PasswordForm onSwitch={() => setMode("link")} /> : <LinkForm onSwitch={() => setMode("password")} />;
}

function PasswordForm({ onSwitch }: { onSwitch: () => void }) {
  const [state, action, pending] = useActionState(signInWithPassword, idlePw);
  const [show, setShow] = useState(false);
  const bad = state.status === "error";
  return (
    <form action={action} noValidate className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
          <input id="email" name="email" type="email" inputMode="email" autoComplete="username" required maxLength={160} placeholder="you@example.com" aria-invalid={bad} aria-describedby={bad ? "login-error" : undefined} className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold">
          Password
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required maxLength={128} aria-invalid={bad} aria-describedby={bad ? "login-error" : undefined} className={`${input} pr-14`} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {bad && (
        <p id="login-error" role="alert" className="text-sm text-[#C2410C]">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary group w-full !min-h-[54px] disabled:opacity-70">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
        {pending ? "Signing in…" : "Sign in"}
        {!pending && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />}
      </button>
      <button type="button" onClick={onSwitch} className="link-u mx-auto flex min-h-[44px] items-center text-sm text-muted">
        Forgot your password? Email me a sign-in link instead
      </button>
    </form>
  );
}

function LinkForm({ onSwitch }: { onSwitch: () => void }) {
  const [state, action, pending] = useActionState(requestSignInLink, idleLink);

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
      <label htmlFor="link-email" className="block text-sm font-semibold">
        Email address
      </label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
        <input id="link-email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={160} placeholder="you@example.com" aria-invalid={bad} aria-describedby={bad ? "login-error" : undefined} className={input} />
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
      <button type="button" onClick={onSwitch} className="link-u mx-auto flex min-h-[44px] items-center text-sm text-muted">
        Back to password sign-in
      </button>
    </form>
  );
}

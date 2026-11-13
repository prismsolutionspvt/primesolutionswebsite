"use client";
import { useActionState, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { changeOwnerPassword, type ChangeState } from "@/admin/actions/auth";

const idle: ChangeState = { status: "idle", message: "" };
const field = "h-12 w-full rounded-xl border border-line bg-bg px-4 pr-12 text-[0.95rem] outline-none transition focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16)]";

/** Lets the signed-in owner set (or change) the password. It goes straight to Supabase Auth; this app never stores or logs it. */
export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeOwnerPassword, idle);
  const [show, setShow] = useState(false);

  return (
    <form action={action} noValidate className="space-y-4" key={state.status === "done" ? "done" : "form"}>
      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold">
          New password
        </label>
        <div className="relative">
          <input id="new-password" name="password" type={show ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required className={field} aria-describedby="pw-help" />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p id="pw-help" className="mt-1.5 text-xs leading-relaxed text-muted">
          At least 12 characters. A short sentence of unrelated words is both strong and easy to remember. Do not reuse a password from anywhere else.
        </p>
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold">
          Repeat the new password
        </label>
        <input id="confirm-password" name="confirm" type={show ? "text" : "password"} autoComplete="new-password" maxLength={128} required className={field} />
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-[#C2410C]">
          {state.message}
        </p>
      )}
      {state.status === "done" && (
        <p role="status" className="flex items-center gap-2 text-sm text-[#2F8071]">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary !min-h-[46px] disabled:opacity-70">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}

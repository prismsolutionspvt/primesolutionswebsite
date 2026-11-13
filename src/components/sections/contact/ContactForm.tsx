"use client";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { submitEnquiry, validate } from "@/lib/enquiry";
import type { Enquiry, EnquiryErrors } from "@/types";

const empty: Enquiry = { name: "", email: "", company: "", phone: "", service: "", message: "" };

const field =
  "peer w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-base text-ink placeholder:text-muted/60 outline-none transition-all duration-300 focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16),0_8px_30px_-12px_rgb(var(--accent)/0.45)] aria-[invalid=true]:border-red-500";

export function ContactForm() {
  const { services } = useContent();
  const [data, setData] = useState<Enquiry>(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [mode, setMode] = useState<"saved" | "preview">("preview");
  // spam / duplicate protection: a hidden honeypot, the time the form was opened, and a one-per-submission token
  const [trap, setTrap] = useState("");
  const meta = useRef({ token: "", start: 0 });
  useEffect(() => {
    meta.current = { token: crypto.randomUUID(), start: Date.now() };
  }, []);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const s = services.find((x) => x.id === id);
      if (s) setData((d) => ({ ...d, service: s.name }));
    };
    window.addEventListener("prism:service-interest", on);
    return () => window.removeEventListener("prism:service-interest", on);
  }, [services]);

  const set = (k: keyof Enquiry) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return; // never submit twice
    const er = validate(data);
    setErrors(er);
    if (Object.keys(er).length) {
      const first = Object.keys(er)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setStatus("loading");
    setServerError("");
    const res = await submitEnquiry(data, { token: meta.current.token, elapsed: Date.now() - meta.current.start, trap });
    if (res.ok) {
      setMode(res.mode);
      setStatus("done");
      setData(empty);
      meta.current = { token: crypto.randomUUID(), start: Date.now() };
    } else {
      setServerError(res.error);
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div role="status" className="grid min-h-[26rem] place-items-center rounded-3xl border border-line bg-surface p-8 text-center">
        <div>
          <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
          <h3 className="h-display mt-5 text-3xl">{mode === "saved" ? "Thank you. We have your enquiry." : "Thank you. Your details look complete."}</h3>
          <p className="mx-auto mt-3 max-w-sm text-muted">
            {mode === "saved"
              ? "Your enquiry has been saved and will be reviewed by the Prism team, who will be in touch about your requirements."
              : "This site is not connected to its database yet, so nothing has been stored. Please contact us directly using the details on this page."}
          </p>
          <button type="button" onClick={() => setStatus("idle")} className="btn btn-ghost mt-7">
            Send another inquiry
          </button>
        </div>
      </div>
    );
  }

  const Err = ({ k }: { k: keyof Enquiry }) =>
    errors[k] ? (
      <p id={`e-${k}`} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
        {errors[k]}
      </p>
    ) : null;
  const a = (k: keyof Enquiry) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });
  const label = "mb-2 block text-sm font-semibold";

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-3xl border border-line bg-surface p-5 sm:p-8" aria-label="Contact form">
      {/* honeypot: invisible to people, tempting to bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={trap} onChange={(e) => setTrap(e.target.value)} className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="f-name" className={label}>
            Full name
          </label>
          <input id="f-name" name="name" autoComplete="name" placeholder="Adam Williams" value={data.name} onChange={set("name")} className={field} {...a("name")} />
          <Err k="name" />
        </div>
        <div>
          <label htmlFor="f-email" className={label}>
            Business email
          </label>
          <input id="f-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="adam@company.com" value={data.email} onChange={set("email")} className={field} {...a("email")} />
          <Err k="email" />
        </div>
        <div>
          <label htmlFor="f-company" className={label}>
            Company name <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="f-company" name="company" autoComplete="organization" placeholder="Williams & Co." value={data.company} onChange={set("company")} className={field} />
        </div>
        <div>
          <label htmlFor="f-phone" className={label}>
            Phone number <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+1 555 000 0000" value={data.phone} onChange={set("phone")} className={field} {...a("phone")} />
          <Err k="phone" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-service" className={label}>
            Service of interest
          </label>
          <select id="f-service" name="service" value={data.service} onChange={set("service")} className={`${field} appearance-none bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-11`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...a("service")}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <Err k="service" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-message" className={label}>
            Project requirements
          </label>
          <textarea id="f-message" name="message" rows={5} placeholder="Tell us about your business, what you need and any timelines." value={data.message} onChange={set("message")} className={`${field} resize-y`} {...a("message")} />
          <Err k="message" />
        </div>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {serverError}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={status === "loading"} className="btn btn-primary group w-full disabled:opacity-70 sm:w-auto">
          {status === "loading" ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send Inquiry <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </button>
        <p className="text-xs leading-relaxed text-muted sm:max-w-[16rem]">Fields marked optional can be left blank.</p>
      </div>
    </form>
  );
}

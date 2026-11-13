"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitReview } from "@/app/actions/public";
import { PointerGlow } from "@/components/layout/PointerGlow";
import { MOODS, MoodFace } from "./MoodFace";
import { STAR_PATH, Stars } from "./Stars";

const MAX = 800;
const field =
  "w-full rounded-xl border border-line bg-bg px-4 py-3.5 text-base text-ink placeholder:text-muted/60 outline-none transition-all duration-300 focus:border-accent focus:shadow-[0_0_0_4px_rgb(var(--accent)/0.16),0_8px_30px_-12px_rgb(var(--accent)/0.45)] aria-[invalid=true]:border-red-500";

type Particle = { id: number; dx: number; dy: number; r: number; s: number; c: string };
const COLORS = ["#F28A1E", "#F7A83B", "#0B1F4B", "#1FB6A6", "#E4572E", "#5B72B0"];
const burst = (n: number, spread: number, seed: number): Particle[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + seed;
    const d = spread * (0.55 + ((i * 37) % 10) / 22);
    return { id: i, dx: Math.cos(a) * d, dy: Math.sin(a) * d - spread * 0.15, r: ((i * 53) % 360) - 180, s: 0.6 + ((i * 17) % 10) / 12, c: COLORS[i % COLORS.length] };
  });

function Sparkles({ items }: { items: Particle[] }) {
  return (
    <>
      {items.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 24 24"
          aria-hidden
          className="burst-p pointer-events-none absolute left-1/2 top-1/2 -ml-2.5 -mt-2.5 h-5 w-5"
          style={{ color: p.c, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--r" as string]: `${p.r}deg`, ["--s" as string]: p.s }}
          fill="currentColor"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </>
  );
}

/**
 * "Leave a review" — expressive on purpose:
 *  • five prism-stars light up as you hover, burst into sparkles when chosen, and drive a face that changes mood;
 *  • a live preview of the review tilts toward the pointer while you type;
 *  • sending ends in a confetti of stars.
 * Honest by design: reviews arrive as PENDING and appear on the site only after the owner approves them.
 * Keyboard: the stars are a radio group (arrow keys). Reduced-motion visitors get the same flow without the effects.
 */
export function ReviewComposer({ enabled }: { enabled: boolean }) {
  const reduce = useReducedMotion();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [text, setText] = useState("");
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [burstAt, setBurstAt] = useState<{ star: number; n: number } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const meta = useRef({ token: "", start: 0 });
  useEffect(() => {
    meta.current = { token: crypto.randomUUID(), start: Date.now() };
  }, []);

  const shown = hover || rating;
  const mood = MOODS[shown];
  const sparks = useMemo(() => burst(12, 70, burstAt?.n ?? 0), [burstAt?.n]);
  const cloud = useMemo(() => burst(44, 340, confetti), [confetti]);

  const choose = (i: number) => {
    setRating(i);
    setErrors((e) => ({ ...e, rating: "" }));
    if (!reduce) setBurstAt({ star: i, n: Date.now() % 1000 });
  };
  const onStarKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      choose(Math.min(5, (rating || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      choose(Math.max(1, (rating || 2) - 1));
    }
  };

  // live preview tilt
  const card = useRef<HTMLDivElement>(null);
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = card.current;
    if (!el || reduce || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
  };
  const untilt = () => card.current && (card.current.style.transform = "");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const er: Record<string, string> = {};
    if (rating < 1) er.rating = "Please choose a star rating.";
    if (name.trim().length < 2) er.name = "Please enter your name.";
    if (text.trim().length < 10) er.text = "Please write at least 10 characters.";
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(er.rating ? "rv-stars" : er.name ? "rv-name" : "rv-text")?.focus();
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      const r = await submitReview({ name, company, rating, text, trap, token: meta.current.token, elapsed: Date.now() - meta.current.start });
      if (r.ok) {
        setStatus("done");
        if (!reduce) setConfetti((c) => c + 1.7);
      } else {
        setErrors(r.fieldErrors ?? {});
        setServerError(r.error);
        setStatus("error");
      }
    } catch {
      setServerError("We could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  const again = () => {
    setStatus("idle");
    setRating(0);
    setHover(0);
    setName("");
    setCompany("");
    setText("");
    setErrors({});
    meta.current = { token: crypto.randomUUID(), start: Date.now() };
  };

  if (!enabled) {
    return (
      <p className="mx-auto max-w-md rounded-3xl border border-dashed border-line p-8 text-center text-muted">
        Reviews are not available right now. Please check back soon.
      </p>
    );
  }

  return (
    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
      {/* the mood stage */}
      <div className="lg:col-span-5">
        <MoodFace rating={shown} />
        <div className="mt-8 text-center">
          <div className="relative mx-auto flex w-fit gap-1.5 sm:gap-2.5" role="radiogroup" aria-label="Your rating" aria-describedby={errors.rating ? "rv-rating-err" : undefined} onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => {
              const on = i <= shown;
              return (
                <button
                  key={i}
                  id={i === 1 ? "rv-stars" : undefined}
                  type="button"
                  role="radio"
                  aria-checked={rating === i}
                  aria-label={`${i} star${i > 1 ? "s" : ""}: ${MOODS[i].label}`}
                  tabIndex={rating === i || (!rating && i === 1) ? 0 : -1}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(0)}
                  onClick={() => choose(i)}
                  onKeyDown={onStarKey}
                  className="group relative grid h-12 w-12 place-items-center rounded-full transition-transform duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95 sm:h-14 sm:w-14"
                >
                  <svg viewBox="0 0 24 24" className={`h-9 w-9 transition-all duration-300 sm:h-10 sm:w-10 ${on ? "scale-110 text-accent drop-shadow-[0_0_10px_rgb(var(--glow)/0.8)]" : "text-ink/20 group-hover:text-ink/40"} ${rating === i && !reduce ? "star-pop" : ""}`} fill="currentColor" aria-hidden>
                    <path d={STAR_PATH} />
                  </svg>
                  {burstAt?.star === i && <Sparkles key={burstAt.n} items={sparks} />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 h-9 overflow-hidden" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={mood.label} initial={reduce ? false : { y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? undefined : { y: -22, opacity: 0 }} transition={{ duration: 0.22 }} className="font-display text-2xl font-semibold tracking-tight" style={{ color: shown ? mood.color : undefined }}>
                {mood.label}
              </motion.p>
            </AnimatePresence>
          </div>
          {errors.rating && (
            <p id="rv-rating-err" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.rating}
            </p>
          )}
        </div>
      </div>

      {/* the form / thank-you */}
      <div className="relative lg:col-span-7">
        <PointerGlow className="rounded-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {status === "done" ? (
                <motion.div key="done" initial={reduce ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} role="status" className="relative grid min-h-[26rem] place-items-center text-center">
                  <Sparkles key={confetti} items={cloud} />
                  <div className="relative">
                    <svg viewBox="0 0 64 64" className="mx-auto h-20 w-20" aria-hidden>
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgb(var(--accent))" strokeWidth="3" className="rv-draw" pathLength={1} />
                      <path d="M20 33 l9 9 l16 -19" fill="none" stroke="rgb(var(--accent))" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="rv-draw rv-draw-2" pathLength={1} />
                    </svg>
                    <h3 className="h-display mt-5 text-3xl sm:text-4xl">Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}!</h3>
                    <p className="mx-auto mt-3 max-w-sm text-muted">Your review has been received. Our team reads every one, and it will appear on this page once it has been approved.</p>
                    <button type="button" onClick={again} className="btn btn-ghost mt-7">
                      Write another review
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={onSubmit} noValidate aria-label="Leave a review" initial={false} exit={reduce ? undefined : { opacity: 0, y: -10 }}>
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={trap} onChange={(e) => setTrap(e.target.value)} className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0" />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="rv-name" className="mb-2 block text-sm font-semibold">
                        Your name
                      </label>
                      <input id="rv-name" name="name" autoComplete="name" maxLength={80} placeholder="Adam Williams" value={name} onChange={(e) => setName(e.target.value)} className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "rv-name-err" : undefined} />
                      {errors.name && (
                        <p id="rv-name-err" role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="rv-company" className="mb-2 block text-sm font-semibold">
                        Company <span className="font-normal text-muted">(optional)</span>
                      </label>
                      <input id="rv-company" name="company" autoComplete="organization" maxLength={80} placeholder="Williams & Co." value={company} onChange={(e) => setCompany(e.target.value)} className={field} />
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex items-end justify-between">
                      <label htmlFor="rv-text" className="block text-sm font-semibold">
                        Your review
                      </label>
                      <span className="flex items-center gap-2 font-mono text-[0.68rem] tabular-nums text-muted" aria-live="off">
                        <svg viewBox="0 0 36 36" className="h-5 w-5 -rotate-90" aria-hidden>
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(var(--line))" strokeWidth="4" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke={text.length > MAX * 0.9 ? "#E4572E" : "rgb(var(--accent))"} strokeWidth="4" strokeLinecap="round" strokeDasharray={88} strokeDashoffset={88 - 88 * Math.min(1, text.length / MAX)} style={{ transition: "stroke-dashoffset .25s" }} />
                        </svg>
                        {text.length}/{MAX}
                      </span>
                    </div>
                    <textarea id="rv-text" name="text" rows={5} maxLength={MAX} placeholder="Tell others what it was like to work with Prism Solutions…" value={text} onChange={(e) => setText(e.target.value)} className={`${field} resize-y`} aria-invalid={!!errors.text} aria-describedby={errors.text ? "rv-text-err" : undefined} />
                    {errors.text && (
                      <p id="rv-text-err" role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.text}
                      </p>
                    )}
                  </div>

                  {/* live preview */}
                  <div className="mt-6" aria-hidden={!text && !name}>
                    <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted">Live preview</p>
                    <div ref={card} onPointerMove={tilt} onPointerLeave={untilt} className="rounded-2xl border border-line bg-bg p-4 transition-transform duration-200 will-change-transform sm:p-5">
                      <Stars value={rating} />
                      <p className="mt-3 min-h-[2.8em] whitespace-pre-line break-words text-[0.97rem] leading-relaxed">{text.trim() ? `“${text.trim()}”` : <span className="text-muted">Your words will appear here as you type.</span>}</p>
                      <p className="mt-3 text-sm font-semibold">
                        {name.trim() || <span className="font-normal text-muted">Your name</span>}
                        {company.trim() && <span className="font-normal text-muted">, {company.trim()}</span>}
                      </p>
                    </div>
                  </div>

                  {status === "error" && (
                    <p role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                      {serverError}
                    </p>
                  )}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="min-w-0 max-w-xs flex-1 text-xs leading-relaxed text-muted">Reviews are checked by our team before they are published. We never publish your email, and we do not ask for it.</p>
                    <button type="submit" disabled={status === "sending"} className="btn btn-primary group w-full shrink-0 whitespace-nowrap disabled:opacity-70 sm:w-auto">
                      {status === "sending" ? <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden /> : <Send className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />}
                      {status === "sending" ? "Sending…" : "Send my review"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </PointerGlow>
        {status === "done" && <CheckCircle2 className="sr-only" />}
      </div>
    </div>
  );
}

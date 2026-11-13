"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { whenReady } from "@/lib/gsap";
import { markDismissed, markShown, pickAnnouncement, type Stores } from "@/lib/announcements";
import { useContent } from "@/components/providers/ContentProvider";
import type { Announcement } from "@/types";

const stores = (): Stores => ({ local: localStorage, session: sessionStorage });

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Announcement presentation: a cinematic modal (a bottom sheet on phones) with a staged entrance (blurred backdrop,
 * image reveal, word-by-word title), a prism light sweep and a magnetic-feeling CTA.
 * One announcement at a time: the highest priority eligible one. It waits for the preloader, honours the owner's
 * schedule and frequency rules, traps focus while open, closes with Escape / backdrop / the close button, and respects
 * prefers-reduced-motion. If the owner turns the close button off, it closes itself after 12 seconds (or via its
 * link), so a visitor can never be trapped. No sound, ever.
 */
export function AnnouncementHost() {
  const { announcements } = useContent();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  // choose the single announcement to show, once the preloader has finished
  useEffect(() => {
    const pick = pickAnnouncement(announcements, stores());
    if (!pick) return;
    let timer = 0;
    const off = whenReady(() => {
      timer = window.setTimeout(() => {
        opener.current = document.activeElement;
        setActive(pick);
        setOpen(true);
        markShown(pick, stores());
      }, Math.max(0, pick.delaySeconds) * 1000);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, [announcements]);

  const close = useCallback(() => {
    setOpen(false);
    if (active) markDismissed(active, stores());
    (opener.current as HTMLElement | null)?.focus?.();
  }, [active]);

  // keyboard: Escape closes (when allowed); Tab is kept inside the dialog; background scroll is locked
  useEffect(() => {
    if (!open || !active) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = dialog.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active.dismissible) return close();
      if (e.key !== "Tab" || !dialog.current) return;
      const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const [a, z] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, active, close]);

  // not dismissible → auto-close so nobody is ever stuck behind it
  useEffect(() => {
    if (!open || !active || active.dismissible) return;
    const id = window.setTimeout(close, 12000);
    return () => window.clearTimeout(id);
  }, [open, active, close]);

  const external = active?.ctaUrl ? /^https?:\/\//i.test(active.ctaUrl) : false;
  const words = active?.title.split(" ") ?? [];
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence onExitComplete={() => setActive(null)}>
      {open && active && (
        <motion.div key={active.id} className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.35 }}>
          {/* backdrop */}
          <div aria-hidden onClick={active.dismissible ? close : undefined} className="absolute inset-0 bg-[#040A1A]/70 backdrop-blur-md" />

          <motion.div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ann-title"
            aria-describedby={active.shortDescription ? "ann-desc" : undefined}
            initial={reduce ? false : { y: 60, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { y: 40, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            className="relative grid max-h-[92svh] w-full max-w-4xl overflow-hidden rounded-t-[2rem] border border-white/10 bg-bg text-ink shadow-[0_50px_120px_-30px_rgba(0,0,0,0.7)] sm:rounded-[2rem] md:grid-cols-[1.05fr_1fr]"
          >
            {/* prism light sweep across the card, once */}
            {!reduce && <motion.span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 z-20 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" initial={{ x: "0%" }} animate={{ x: "420%" }} transition={{ duration: 1.4, delay: 0.5, ease: "easeInOut" }} />}

            {active.dismissible && (
              <button type="button" onClick={close} aria-label="Close announcement" className="absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-bg/80 text-ink backdrop-blur transition hover:rotate-90 hover:bg-accent hover:text-[#0B1F4B]">
                <X className="h-5 w-5" />
              </button>
            )}

            {/* image side */}
            {active.imageUrl ? (
              <motion.div className="relative h-44 overflow-hidden bg-surface2 sm:h-56 md:h-auto md:min-h-[26rem]" initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 1, ease, delay: 0.15 }}>
                <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.25 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease }}>
                  <Image src={active.imageUrl} alt="" fill priority sizes="(max-width: 768px) 100vw, 480px" className="object-cover" />
                </motion.div>
              </motion.div>
            ) : (
              <div aria-hidden className="relative hidden min-h-[16rem] overflow-hidden bg-[#0B1F4B] md:block">
                <div className="absolute inset-0 [background:radial-gradient(60%_60%_at_30%_40%,rgb(242_138_30/0.55),transparent_70%)]" />
                <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto h-3/4 w-3/4 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="100 30 40 150 160 150" strokeLinejoin="round" />
                  <path d="M10 112 L72 112 M128 112 L190 70 M128 112 L190 112 M128 112 L190 154" strokeLinecap="round" stroke="#F7A83B" />
                </svg>
              </div>
            )}

            {/* text side */}
            <div className="relative flex min-h-0 flex-col justify-center overflow-y-auto p-6 sm:p-9">
              <h2 id="ann-title" aria-label={active.title} className="h-display text-[clamp(1.7rem,4.4vw,2.6rem)] leading-[1.05]">
                {words.map((w, i) => (
                  <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top" aria-hidden>
                    <motion.span className="inline-block" initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.7, ease, delay: 0.3 + i * 0.05 }}>
                      {w}&nbsp;
                    </motion.span>
                  </span>
                ))}
              </h2>
              {active.shortDescription && (
                <motion.p id="ann-desc" className="mt-4 text-[1.02rem] leading-relaxed text-muted" initial={reduce ? false : { y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }}>
                  {active.shortDescription}
                </motion.p>
              )}
              {active.detail && (
                <motion.p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed text-muted" initial={reduce ? false : { y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.65 }}>
                  {active.detail}
                </motion.p>
              )}
              {active.ctaText && active.ctaUrl && (
                <motion.div className="mt-7" initial={reduce ? false : { y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.75 }}>
                  <a
                    href={active.ctaUrl}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => {
                      if (!external) close();
                    }}
                    className="btn btn-primary group w-full sm:w-auto"
                  >
                    {active.ctaText}
                    <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </a>
                </motion.div>
              )}
              {!active.dismissible && !reduce && (
                <motion.span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 12, ease: "linear" }} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/config";
import { services } from "@/content";
import { PrismMark, Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useEscapeKey, useNavScroll } from "@/hooks";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrolled, hidden } = useNavScroll(open);
  const [dd, setDd] = useState(false);
  const [mSvc, setMSvc] = useState(false);
  const ddRef = useRef<HTMLLIElement>(null);

  useEscapeKey(() => {
    setOpen(false);
    setDd(false);
  });

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDd(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);

  const close = () => {
    setOpen(false);
    setDd(false);
  };

  return (
    <>
      <header
        style={scrolled ? undefined : { background: "transparent" }}
        className={`${scrolled ? "" : "surface-night"} fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out ${hidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="wrap pt-3 sm:pt-4">
          <nav
            aria-label="Primary"
            className={`flex h-14 items-center justify-between gap-3 rounded-full pl-4 pr-2 transition-all duration-500 sm:h-[60px] sm:pl-6 ${
              scrolled
                ? "border border-line bg-bg/85 shadow-[0_8px_30px_-12px_rgb(11_31_75/0.25)] backdrop-blur-md"
                : "border border-transparent bg-transparent"
            }`}
          >
            <a href="/#top" className="flex items-center gap-2.5 text-ink" aria-label="Prism Solutions — home">
              <PrismMark className="h-7 w-auto" />
              <Wordmark />
            </a>

            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((l) =>
                "dropdown" in l ? (
                  <li key={l.label} className="relative" ref={ddRef} onMouseEnter={() => setDd(true)} onMouseLeave={() => setDd(false)}>
                    <button
                      type="button"
                      aria-expanded={dd}
                      aria-haspopup="true"
                      onClick={() => setDd((v) => !v)}
                      className="flex min-h-[44px] items-center gap-1 rounded-full px-4 text-[0.92rem] font-medium text-ink/80 transition-colors hover:text-ink"
                    >
                      {l.label}
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${dd ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {dd && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute left-1/2 top-full w-[640px] -translate-x-1/2 pt-3"
                        >
                          <div className="grid grid-cols-2 gap-1 rounded-3xl border border-line bg-surface p-3 shadow-[0_30px_80px_-30px_rgb(11_31_75/0.45)]">
                            {services.map((s) => (
                              <a
                                key={s.id}
                                href={`/#services`}
                                onClick={() => {
                                  setDd(false);
                                  window.dispatchEvent(new CustomEvent("prism:service", { detail: s.id }));
                                }}
                                className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-surface2"
                              >
                                <span className="mt-0.5 font-mono text-[0.7rem] text-accent-text">{s.index}</span>
                                <span>
                                  <span className="flex items-center gap-1 text-[0.95rem] font-semibold text-ink">
                                    {s.name}
                                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                                  </span>
                                  <span className="mt-0.5 block text-[0.78rem] leading-snug text-muted">
                                    {s.items.slice(0, 2).join(" · ")}
                                  </span>
                                </span>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="flex min-h-[44px] items-center rounded-full px-4 text-[0.92rem] font-medium text-ink/80 transition-colors hover:text-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ),
              )}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a href="/#contact" className="btn btn-primary hidden !min-h-[44px] px-5 sm:inline-flex">
                Get in Touch
              </a>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 text-ink lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="surface-night fixed inset-0 z-[60] flex flex-col overflow-y-auto"
          >
            <div className="wrap flex h-[72px] shrink-0 items-center justify-between pt-3">
              <span className="flex items-center gap-2.5 text-white">
                <PrismMark className="h-7 w-auto" />
                <Wordmark />
              </span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <ul className="wrap flex flex-1 flex-col justify-center gap-1 py-6">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {"dropdown" in l ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMSvc((v) => !v)}
                        aria-expanded={mSvc}
                        className="flex min-h-[56px] w-full items-center justify-between font-display text-[2.1rem] font-semibold tracking-tight text-white"
                      >
                        {l.label}
                        <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${mSvc ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {mSvc && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            {services.map((s) => (
                              <li key={s.id}>
                                <a
                                  href="/#services"
                                  onClick={() => {
                                    close();
                                    window.dispatchEvent(new CustomEvent("prism:service", { detail: s.id }));
                                  }}
                                  className="flex min-h-[48px] items-center gap-3 border-l border-white/15 pl-4 text-[1.02rem] text-white/80"
                                >
                                  <span className="font-mono text-xs text-accent">{s.index}</span>
                                  {s.name}
                                </a>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <a href={l.href} onClick={close} className="flex min-h-[56px] items-center font-display text-[2.1rem] font-semibold tracking-tight text-white">
                      {l.label}
                    </a>
                  )}
                </motion.li>
              ))}
            </ul>
            <div className="wrap pb-8">
              <a href="/#contact" onClick={close} className="btn btn-primary w-full">
                Get in Touch
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

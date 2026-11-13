"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { navLinks } from "@/config/site";
import { services, serviceGroups } from "@/content";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useActiveSection, useEscapeKey, useNavScroll } from "@/hooks";

const SECTION_IDS = navLinks.map((l) => l.id);

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrolled, hidden } = useNavScroll(open);
  const active = useActiveSection(SECTION_IDS);
  const [dd, setDd] = useState(false);
  const [mSvc, setMSvc] = useState(false);
  const ddRef = useRef<HTMLLIElement>(null);

  // sliding hover indicator ("magic line")
  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const moveTo = (el: HTMLElement | null) => {
    if (!el || !listRef.current) return setPill(null);
    const a = el.getBoundingClientRect();
    const b = listRef.current.getBoundingClientRect();
    setPill({ x: a.left - b.left, w: a.width });
  };

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
  const pickService = (id: string) => {
    close();
    window.dispatchEvent(new CustomEvent("prism:service", { detail: id }));
  };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="wrap pt-3 sm:pt-4">
          <nav
            aria-label="Primary"
            className={`flex h-[60px] items-center justify-between gap-3 rounded-full pl-3 pr-2 transition-all duration-500 sm:h-[64px] sm:pl-4 ${
              scrolled
                ? "border border-line bg-bg/80 shadow-[0_10px_40px_-18px_rgb(var(--ink)/0.35)] backdrop-blur-xl"
                : "border border-transparent bg-transparent"
            }`}
          >
            <a href="/#top" aria-label="Prism Solutions — home" className="shrink-0 rounded-xl transition-opacity hover:opacity-90">
              <BrandLogo height={48} priority />
            </a>

            <ul ref={listRef} onMouseLeave={() => moveTo(null)} className="relative hidden items-center lg:flex">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-1.5 left-0 rounded-full bg-surface2 transition-[transform,width,opacity] duration-300 ease-out"
                style={{ width: pill?.w ?? 0, transform: `translateX(${pill?.x ?? 0}px)`, opacity: pill ? 1 : 0 }}
              />
              {navLinks.map((l) => {
                const isActive = active === l.id;
                const base = "relative z-10 flex min-h-[44px] items-center gap-1 rounded-full px-4 text-[0.92rem] font-medium transition-colors";
                return "dropdown" in l ? (
                  <li key={l.id} className="relative" ref={ddRef} onMouseEnter={(e) => { moveTo(e.currentTarget); setDd(true); }} onMouseLeave={() => setDd(false)}>
                    <button
                      type="button"
                      aria-expanded={dd}
                      aria-haspopup="true"
                      onClick={() => setDd((v) => !v)}
                      onFocus={(e) => moveTo(e.currentTarget.parentElement)}
                      className={`${base} ${isActive ? "text-ink" : "text-ink/70 hover:text-ink"}`}
                    >
                      {l.label}
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${dd ? "rotate-180" : ""}`} />
                      {isActive && <span className="absolute inset-x-4 bottom-1.5 h-px bg-accent" />}
                    </button>
                    <AnimatePresence>
                      {dd && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute left-1/2 top-full w-[680px] -translate-x-1/2 pt-3"
                        >
                          <div className="rounded-3xl border border-line bg-bg p-4 shadow-[0_30px_80px_-30px_rgb(var(--ink)/0.45)]">
                            {serviceGroups.map((g) => (
                              <div key={g.id} className="mb-2 last:mb-0">
                                <p className="px-3 pb-1 pt-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-accent-text">{g.label}</p>
                                <div className="grid grid-cols-2 gap-0.5">
                                  {services.filter((s) => s.group === g.id).map((s) => (
                                    <a key={s.id} href="/#services" onClick={() => pickService(s.id)} className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.93rem] font-semibold text-ink transition-colors hover:bg-surface2">
                                      <span className="flex items-center gap-3">
                                        <span className="font-mono text-[0.68rem] font-medium text-muted">{s.index}</span>
                                        {s.name}
                                      </span>
                                      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li key={l.id} onMouseEnter={(e) => moveTo(e.currentTarget)}>
                    <a href={l.href} onFocus={(e) => moveTo(e.currentTarget.parentElement)} aria-current={isActive ? "true" : undefined} className={`${base} ${isActive ? "text-ink" : "text-ink/70 hover:text-ink"}`}>
                      {l.label}
                      {isActive && <span className="absolute inset-x-4 bottom-1.5 h-px bg-accent" />}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a href="/#contact" className="btn btn-primary hidden !min-h-[44px] px-5 sm:inline-flex">
                Get in Touch
              </a>
              <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface2 lg:hidden">
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
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-bg"
          >
            <div className="wrap flex h-[76px] shrink-0 items-center justify-between pt-3">
              <BrandLogo height={42} />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button type="button" onClick={close} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <ul className="wrap flex flex-1 flex-col justify-center gap-0.5 py-6">
              {navLinks.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  {"dropdown" in l ? (
                    <>
                      <button type="button" onClick={() => setMSvc((v) => !v)} aria-expanded={mSvc} className="flex min-h-[56px] w-full items-center justify-between font-display text-[2.1rem] font-semibold tracking-tight text-ink">
                        {l.label}
                        <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${mSvc ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {mSvc && (
                          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                            {services.map((s) => (
                              <li key={s.id}>
                                <a href="/#services" onClick={() => pickService(s.id)} className="flex min-h-[48px] items-center gap-3 border-l border-line pl-4 text-[1.02rem] text-muted">
                                  <span className="font-mono text-xs text-accent-text">{s.index}</span>
                                  {s.name}
                                </a>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <a href={l.href} onClick={close} className="flex min-h-[56px] items-center font-display text-[2.1rem] font-semibold tracking-tight text-ink">
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

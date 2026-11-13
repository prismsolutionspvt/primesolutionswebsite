"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { buildWhatsappLink } from "@/config/site";
import { useContent } from "@/components/providers/ContentProvider";
import { WhatsappIcon } from "@/components/ui/SocialIcons";
import { playRing } from "@/lib/ringSound";
import { RobotScene } from "./RobotScene";

const SOUND_KEY = "prism-sound";

/**
 * Floating WhatsApp contact with a small assistant scene.
 * - Desktop: hovering (or keyboard-focusing) the button opens the scene; clicking opens WhatsApp.
 * - Touch: the first tap opens the scene, the "Chat on WhatsApp" button (or a second tap) opens WhatsApp.
 * - Sound is OFF by default, never autoplays, and only plays after an explicit click/tap while enabled.
 */
export function WhatsAppWidget() {
  const { settings } = useContent();
  const waHref = buildWhatsappLink(settings.whatsapp);
  const [open, setOpen] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [sound, setSound] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);
  const touchMode = useRef(false);

  useEffect(() => {
    touchMode.current = window.matchMedia("(hover: none)").matches;
    try {
      setSound(localStorage.getItem(SOUND_KEY) === "on");
    } catch {}
  }, []);

  const ring = useCallback(
    (withSound: boolean) => {
      setRinging(true);
      window.setTimeout(() => setRinging(false), 1800);
      if (withSound && sound) playRing();
    },
    [sound],
  );

  const openPanel = (explicit: boolean) => {
    window.clearTimeout(timer.current);
    setOpen(true);
    if (!ringing) setRinging(true);
    window.setTimeout(() => setRinging(false), 1800);
    if (explicit && sound) playRing();
  };
  const closePanel = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  // close on Escape and on outside tap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) closePanel();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {}
    if (next) {
      playRing(); // explicit click — safe to play, and confirms that sound is on
      setRinging(true);
      window.setTimeout(() => setRinging(false), 1800);
    }
  };

  if (!settings.whatsapp.enabled) return null;
  return (
    <div
      ref={root}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 sm:bottom-6 sm:right-6"
      onMouseEnter={() => !touchMode.current && openPanel(false)}
      onMouseLeave={() => {
        if (touchMode.current) return;
        timer.current = window.setTimeout(closePanel, 220);
      }}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) closePanel();
      }}
    >
      {/* the scene */}
      <div
        id="whatsapp-panel"
        role="dialog"
        aria-label="Chat with Prism Solutions on WhatsApp"
        aria-hidden={!open}
        className={`absolute bottom-[72px] right-0 w-[min(88vw,320px)] origin-bottom-right transition-all duration-500 ease-out ${open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-90 opacity-0"}`}
      >
        <div className="overflow-hidden rounded-[1.75rem] border border-line bg-bg shadow-[0_30px_80px_-24px_rgb(var(--ink)/0.5)]">
          <div className="relative bg-surface2 px-4 pt-4">
            <button type="button" onClick={closePanel} aria-label="Close" className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-bg hover:text-ink">
              <X className="h-4 w-4" />
            </button>
            {/* tapping the telephone rings it */}
            <button type="button" onClick={() => ring(true)} aria-label="Ring the telephone" className="block aspect-[13/10] w-full cursor-pointer" tabIndex={open ? 0 : -1}>
              <RobotScene ringing={ringing} />
            </button>
          </div>
          <div className="p-5 pt-4">
            <p className="font-display text-[1.35rem] font-semibold leading-tight tracking-tight">Need assistance? Let&apos;s talk.</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">Message the Prism team on WhatsApp and tell us what you need.</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
              className="mt-4 flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-[0.95rem] font-semibold text-[#06361b] transition-transform duration-300 hover:scale-[1.02]"
            >
              <WhatsappIcon className="h-5 w-5" /> Chat on WhatsApp
            </a>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              tabIndex={open ? 0 : -1}
              className="mt-3 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full text-[0.82rem] font-medium text-muted transition-colors hover:text-ink"
            >
              {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {sound ? "Telephone sound on — tap to mute" : "Telephone sound off — tap to enable"}
            </button>
          </div>
        </div>
      </div>

      {/* the floating button */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Prism Solutions on WhatsApp"
        aria-expanded={open}
        aria-controls="whatsapp-panel"
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && openPanel(false)}
        onClick={(e) => {
          // touch: first tap shows the scene; the next tap (or the button inside it) opens WhatsApp
          if (touchMode.current && !open) {
            e.preventDefault();
            openPanel(true);
          }
        }}
        className="whatsapp-fab group relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#25D366] text-white hover:scale-105 active:scale-95"
      >
        <span className="wa-icon flex h-8 w-8 items-center justify-center">
          <WhatsappIcon className="block h-8 w-8" />
        </span>
      </a>
    </div>
  );
}

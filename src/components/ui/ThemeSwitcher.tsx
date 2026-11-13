"use client";
import { useEffect, useState, type KeyboardEvent } from "react";
import { Contrast, Moon, Sun } from "lucide-react";
import { THEMES, THEME_LABELS, applyTheme, readTheme, type ThemeId } from "@/lib/theme";

const ICONS = { light: Sun, dark: Moon, adaptive: Contrast } as const;

/**
 * One switcher, three options: Light · Dark · Prism Adaptive (a curated mix of light and dark sections).
 * It is a radio group (arrow keys move between options). Local state only: switching changes a single
 * attribute on <html>, so no page component re-renders.
 */
export function ThemeSwitcher({ className = "", labeled = false }: { className?: string; labeled?: boolean }) {
  const [theme, setTheme] = useState<ThemeId>("light");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const choose = (id: ThemeId, el: HTMLElement) => {
    if (id === theme) return;
    const r = el.getBoundingClientRect();
    setTheme(id);
    applyTheme(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = THEMES[(i + (e.key === "ArrowRight" ? 1 : THEMES.length - 1)) % THEMES.length];
    const btn = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-theme-id="${next}"]`);
    if (btn) {
      btn.focus();
      choose(next, btn);
    }
  };

  const index = THEMES.indexOf(theme);

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`relative grid h-11 shrink-0 grid-cols-3 items-center rounded-full border border-ink/15 bg-surface2/70 p-1 ${labeled ? "w-full" : "w-[120px]"} ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-accent shadow-[0_4px_14px_-4px_rgb(var(--glow)/0.7)] transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {THEMES.map((id, i) => {
        const Icon = ICONS[id];
        const on = id === theme;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={THEME_LABELS[id]}
            title={THEME_LABELS[id]}
            data-theme-id={id}
            tabIndex={on ? 0 : -1}
            onClick={(e) => choose(id, e.currentTarget)}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative z-10 flex h-9 items-center justify-center gap-1.5 rounded-full text-[0.78rem] font-semibold transition-colors duration-300 ${on ? "text-[#0B1F4B]" : "text-ink/65 hover:text-ink"}`}
          >
            <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden />
            {labeled && <span className="truncate">{id === "adaptive" ? "Adaptive" : THEME_LABELS[id]}</span>}
          </button>
        );
      })}
    </div>
  );
}

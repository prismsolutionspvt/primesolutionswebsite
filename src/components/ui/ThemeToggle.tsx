"use client";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-fade");
    root.dataset.theme = next;
    try {
      localStorage.setItem("prism-theme", next);
    } catch {}
    setTheme(next);
    window.setTimeout(() => root.classList.remove("theme-fade"), 500);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Dark mode"
      className={`group relative flex h-11 w-[68px] shrink-0 items-center rounded-full border border-ink/20 bg-surface2/60 p-1 transition-colors hover:border-ink/50 ${className}`}
    >
      <span
        className={`absolute left-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-accent text-navy transition-transform duration-500 ease-out ${
          theme === "dark" ? "translate-x-[24px]" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
            <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
          </svg>
        )}
      </span>
    </button>
  );
}

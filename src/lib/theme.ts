import { prefersReducedMotion } from "@/lib/motion";

export const THEME_KEY = "prism-theme";
export const THEMES = ["light", "dark", "adaptive"] as const;
export type ThemeId = (typeof THEMES)[number];

export const THEME_LABELS: Record<ThemeId, string> = {
  light: "Light",
  dark: "Dark",
  adaptive: "Prism Adaptive",
};

export const isTheme = (v: unknown): v is ThemeId => typeof v === "string" && (THEMES as readonly string[]).includes(v);

/** The theme currently applied to <html> (set before first paint by the boot script in app/layout.tsx). */
export function readTheme(): ThemeId {
  const t = typeof document !== "undefined" ? document.documentElement.dataset.theme : undefined;
  return isTheme(t) ? t : "light";
}

type ViewTransitionDoc = Document & { startViewTransition?: (update: () => void) => { ready: Promise<void> } };

/**
 * Switch theme. Only the `data-theme` attribute changes (pure CSS variables), so nothing re-renders or remounts
 * and no animation restarts. Where supported, the View Transitions API crossfades with a circular reveal from
 * the control that was clicked — a single GPU-composited snapshot instead of transitions on every element.
 */
export function applyTheme(next: ThemeId, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const commit = () => {
    root.dataset.theme = next;
  };
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}

  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    commit();
    return;
  }
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = doc.startViewTransition(commit);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}

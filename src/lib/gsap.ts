"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function registerGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export const READY_EVENT = "prism:ready";

/** True once the preloader has finished (or was skipped). */
export function isReady() {
  return typeof document !== "undefined" && !document.documentElement.classList.contains("is-preloading");
}

/** Run `fn` when the preloader is done (immediately if already). Returns cleanup. */
export function whenReady(fn: () => void) {
  if (isReady()) {
    fn();
    return () => {};
  }
  const h = () => fn();
  window.addEventListener(READY_EVENT, h, { once: true });
  return () => window.removeEventListener(READY_EVENT, h);
}

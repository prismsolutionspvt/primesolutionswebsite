"use client";
import { useEffect, useRef, useState } from "react";

/** Tracks whether the page has scrolled and whether the header should hide (scrolling down past the hero). */
export function useNavScroll(locked: boolean) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > last.current && y > 480 && !locked);
      last.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [locked]);

  return { scrolled, hidden };
}

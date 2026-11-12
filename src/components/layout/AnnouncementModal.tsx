"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { announcement } from "@/content";
import { useEscapeKey } from "@/hooks";

/** Renders nothing until an admin enables an announcement (content/copy.ts → later admin panel). */
export function AnnouncementModal() {
  const [open, setOpen] = useState(false);
  const key = "prism-announcement-dismissed";

  useEffect(() => {
    if (!announcement.enabled || !announcement.showOnLoad || !announcement.heading) return;
    try {
      const t = Number(localStorage.getItem(key) || 0);
      if (Date.now() - t < announcement.dismissDays * 864e5) return;
    } catch {}
    const id = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(key, String(Date.now()));
    } catch {}
  };

  useEscapeKey(close, open);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={announcement.heading} className="fixed inset-0 z-[90] grid place-items-center bg-[#040A1A]/70 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface p-7 shadow-2xl">
        <button type="button" onClick={close} aria-label="Close announcement" className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full hover:bg-surface2">
          <X className="h-5 w-5" />
        </button>
        {announcement.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={announcement.imageUrl} alt="" className="mb-5 w-full rounded-2xl" />
        )}
        <h2 className="h-display text-2xl">{announcement.heading}</h2>
        <p className="mt-3 text-muted">{announcement.text}</p>
      </div>
    </div>
  );
}

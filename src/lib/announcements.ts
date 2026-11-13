import type { Announcement } from "@/types";

/**
 * Which announcement (if any) may be shown to THIS visitor right now. Pure logic with injected storage so it can be
 * tested. The per-visitor memory is only a convenience for not nagging people; nothing here is a security control.
 */
export type Store = { getItem(k: string): string | null; setItem(k: string, v: string): void };
export type Stores = { local: Store; session: Store };
type Memory = { version: string; lastShown: number; dismissed: boolean };

const mkey = (id: string) => `prism-ann:${id}`;
const skey = (a: Announcement) => `prism-ann-s:${a.id}:${a.version}`;

export function readMemory(a: Announcement, s: Stores): Memory {
  try {
    const m = JSON.parse(s.local.getItem(mkey(a.id)) ?? "null") as Memory | null;
    if (m && m.version === a.version) return m;
  } catch {}
  return { version: a.version, lastShown: 0, dismissed: false }; // never seen, or edited since: treated as new
}

export function writeMemory(a: Announcement, m: Memory, s: Stores) {
  try {
    s.local.setItem(mkey(a.id), JSON.stringify(m));
  } catch {}
}

export function markShown(a: Announcement, s: Stores, now = Date.now()) {
  writeMemory(a, { ...readMemory(a, s), lastShown: now }, s);
  try {
    s.session.setItem(skey(a), "1");
  } catch {}
}

export function markDismissed(a: Announcement, s: Stores) {
  writeMemory(a, { ...readMemory(a, s), dismissed: true }, s);
}

const seenThisSession = (a: Announcement, s: Stores) => {
  try {
    return s.session.getItem(skey(a)) === "1";
  } catch {
    return false;
  }
};

/** Does the owner's schedule + frequency allow this announcement to appear right now for this visitor? */
export function eligible(a: Announcement, s: Stores, now = Date.now()): boolean {
  if (!a.showOnLoad) return false;
  if (a.startsAt && Date.parse(a.startsAt) > now) return false;
  if (a.endsAt && Date.parse(a.endsAt) <= now) return false;
  const m = readMemory(a, s);
  if (m.dismissed && !a.reappearAfterDismiss) return false; // closed once: stays closed until the owner edits it
  if (a.frequency === "once_per_session") return !seenThisSession(a, s);
  if (a.frequency === "once_per_visitor") return !m.lastShown || (a.reappearDays > 0 && now - m.lastShown > a.reappearDays * 864e5);
  return !(m.dismissed && seenThisSession(a, s)); // every visit: each page load, but not again in this session once dismissed
}

/** The single announcement to show: highest priority, then most recently started. Never more than one. */
export function pickAnnouncement(list: Announcement[], s: Stores, now = Date.now()): Announcement | undefined {
  return [...list]
    .sort((a, b) => b.priority - a.priority || Date.parse(b.startsAt ?? "0") - Date.parse(a.startsAt ?? "0"))
    .find((a) => eligible(a, s, now));
}

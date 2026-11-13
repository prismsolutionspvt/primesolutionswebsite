"use client";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";

/**
 * The "Admin Panel" shortcut. It is NOT in the page for visitors:
 *  • nothing is requested unless a Supabase sign-in cookie exists in this browser;
 *  • even then it only renders after the SERVER confirms this session is the owner (/api/admin/session).
 * It carries no data and reveals no operations. Hiding it is a convenience; the real protection is the server and the database.
 */
export function AdminEntry({ className = "" }: { className?: string }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!/(^|;\s*)sb-[^=]*-auth-token/.test(document.cookie)) return;
    let alive = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d) => alive && setOk(d.admin === true))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  if (!ok) return null;
  return (
    <a href="/admin" className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-4 text-sm font-semibold text-ink transition hover:bg-accent hover:text-[#0B1F4B] ${className}`}>
      <LayoutDashboard className="h-4 w-4" aria-hidden /> Admin panel
    </a>
  );
}

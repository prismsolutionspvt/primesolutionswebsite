"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Building2, CircleHelp, ExternalLink, Factory, Gem, Images, Inbox, Layers, LayoutDashboard, LogOut, Megaphone, Menu, Palette, Phone, Quote, Route, Settings, Sparkles, Target, Users, X, type LucideIcon } from "lucide-react";
import { signOutAction } from "@/admin/actions/auth";
import { BrandLogo } from "@/components/ui/BrandLogo";

type Item = { href: string; label: string; icon: LucideIcon; badge?: "enquiries" | "testimonials" };
const GROUPS: { title: string; items: Item[] }[] = [
  { title: "", items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }] },
  {
    title: "Website content",
    items: [
      { href: "/admin/company", label: "Company Content", icon: Building2 },
      { href: "/admin/mission-vision", label: "Mission & Vision", icon: Target },
      { href: "/admin/values", label: "Core Values", icon: Gem },
      { href: "/admin/why", label: "Why Prism", icon: Sparkles },
      { href: "/admin/approach", label: "Our Approach", icon: Route },
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/industries", label: "Industries", icon: Factory },
      { href: "/admin/team", label: "Team Management", icon: Users },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote, badge: "testimonials" },
      { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
    ],
  },
  {
    title: "Visitors",
    items: [
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: "enquiries" },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/media", label: "Media Library", icon: Images },
      { href: "/admin/contact", label: "Contact & Social", icon: Phone },
      { href: "/admin/appearance", label: "Website Appearance", icon: Palette },
      { href: "/admin/settings", label: "Admin Settings", icon: Settings },
    ],
  },
];

/** The admin frame: a deep-navy sidebar (a drawer on phones), a top bar with “View website”, and the signed-in owner. */
export function AdminShell({ email, badges, children }: { email: string; badges: { enquiries: number; testimonials: number }; children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const active = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));

  const nav = (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-6">
      {GROUPS.map((g, gi) => (
        <div key={gi} className={gi ? "mt-6" : ""}>
          {g.title && <p className="mb-2 px-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/45">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const on = active(it.href);
              const n = it.badge ? badges[it.badge] : 0;
              return (
                <li key={it.href}>
                  <a href={it.href} aria-current={on ? "page" : undefined} className={`group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[0.92rem] font-medium transition ${on ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white"}`}>
                    <span aria-hidden className={`absolute -left-3 top-2 h-[calc(100%-1rem)] w-1 rounded-r-full bg-[#F28A1E] transition-transform ${on ? "scale-y-100" : "scale-y-0"}`} />
                    <it.icon className={`h-[18px] w-[18px] shrink-0 transition ${on ? "text-[#F7A83B]" : "group-hover:text-[#F7A83B]"}`} aria-hidden />
                    <span className="flex-1 truncate">{it.label}</span>
                    {n > 0 && <span className="grid min-w-[22px] place-items-center rounded-full bg-[#F28A1E] px-1.5 text-[0.7rem] font-bold text-[#0B1F4B]" aria-label={`${n} waiting`}>{n > 99 ? "99+" : n}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-3 px-5 py-5">
      <span className="rounded-xl bg-white px-2.5 py-1.5">
        <BrandLogo height={30} />
      </span>
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/55">Admin</span>
    </div>
  );

  return (
    <div className="min-h-[100svh] bg-surface lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100svh] flex-col bg-[#0B1F4B] lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_40%_at_0%_0%,rgb(242_138_30/0.22),transparent_70%)]" />
        <div className="relative flex min-h-0 flex-1 flex-col">
          {brand}
          {nav}
          <div className="border-t border-white/10 p-4">
            <p className="truncate text-xs text-white/60" title={email}>{email}</p>
            <form action={signOutAction}>
              <button type="submit" className="mt-2 flex min-h-[40px] w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-white/75 transition hover:bg-white/8 hover:text-white">
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[120] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div aria-hidden className="adm-fade absolute inset-0 bg-[#040A1A]/60" onClick={() => setOpen(false)} />
          <div className="adm-slide-l relative flex h-full w-[min(86vw,320px)] flex-col bg-[#0B1F4B]">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full text-white/80 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            <div className="border-t border-white/10 p-4">
              <p className="truncate text-xs text-white/60">{email}</p>
              <form action={signOutAction}>
                <button type="submit" className="mt-2 flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-white/80 hover:bg-white/10">
                  <LogOut className="h-4 w-4" aria-hidden /> Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:px-8">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <p className="hidden font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted lg:block">Prism Solutions · Website manager</p>
          <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold transition hover:border-accent">
            View website <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}

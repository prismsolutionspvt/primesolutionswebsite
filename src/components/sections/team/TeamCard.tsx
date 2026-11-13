"use client";
import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import type { TeamMember } from "@/types";

const filled = (v: string) => v.trim().length > 0;

/**
 * One profile slot. Every field is admin-editable; empty fields show an elegant placeholder
 * (an upload-style portrait frame and soft skeleton lines) — nothing is invented.
 * On fine pointers the portrait tilts toward the cursor with a moving glare; a swoosh draws around it on hover.
 */
export function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const tilt = useRef<HTMLDivElement>(null);
  const hasPhoto = filled(member.photoUrl);
  const num = String(index + 1).padStart(2, "0");

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tilt.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${nx * 9}deg`);
    el.style.setProperty("--rx", `${ny * -9}deg`);
    el.style.setProperty("--gx", `${(nx + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(ny + 0.5) * 100}%`);
  };
  const onLeave = () => {
    const el = tilt.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <article className="group flex gap-5 md:block" aria-label={filled(member.name) ? member.name : `Team profile ${num}`}>
      <div className="w-[7.5rem] shrink-0 md:w-full" style={{ perspective: "900px" }}>
        <div
          ref={tilt}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="team-tilt relative mx-auto aspect-[4/5] w-full max-w-[340px]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] border border-line bg-surface2 transition-colors duration-500 group-hover:border-accent/60 md:rounded-b-[2rem]">
            {hasPhoto ? (
              <Image src={member.photoUrl} alt={filled(member.name) ? `Portrait of ${member.name}` : `Team member ${num}`} fill sizes="(max-width: 768px) 120px, 340px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-surface2 to-surface">
                <svg aria-hidden viewBox="0 0 100 125" className="absolute inset-0 h-full w-full">
                  <path d="M12 125 V50 a38 38 0 0 1 76 0 V125" fill="none" stroke="rgb(var(--ink))" strokeOpacity=".12" strokeWidth=".7" strokeDasharray="2 3" />
                  <path d="M22 125 V50 a28 28 0 0 1 56 0 V125" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".35" strokeWidth=".7" />
                </svg>
                <div className="relative text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-dashed border-ink/30 text-ink/45 transition-all duration-500 group-hover:scale-110 group-hover:border-accent group-hover:text-accent md:h-14 md:w-14">
                    <ImagePlus className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
                  </span>
                  <span className="mt-3 hidden font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted md:block">Portrait</span>
                </div>
              </div>
            )}
            {/* glare that follows the cursor */}
            <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(260px circle at var(--gx, 50%) var(--gy, 30%), rgb(255 255 255 / 0.28), transparent 65%)", mixBlendMode: "soft-light" }} />
          </div>

          {/* swoosh that draws around the frame on hover */}
          <svg aria-hidden viewBox="0 0 100 125" className="pointer-events-none absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] overflow-visible">
            <path d="M6 125 V50 a44 44 0 0 1 88 0 V125" pathLength={1} fill="none" stroke="rgb(var(--accent))" strokeWidth="1.1" strokeLinecap="butt" className="team-arc" transform="translate(0 -2)" />
          </svg>
          <span className="absolute -left-2 top-6 rounded-full border border-line bg-bg px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.2em] text-muted transition-colors duration-300 group-hover:border-accent group-hover:text-accent-text">{num}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 md:mt-8 md:text-center">
        {filled(member.name) ? (
          <h3 className="font-display text-[1.5rem] font-semibold leading-tight tracking-tight sm:text-[1.75rem]">{member.name}</h3>
        ) : (
          <div aria-hidden className="mx-0 h-6 w-3/5 rounded-full bg-ink/10 md:mx-auto" />
        )}
        {filled(member.designation) ? (
          <p className="mt-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent-text">{member.designation}</p>
        ) : (
          <div aria-hidden className="mx-0 mt-3 h-3 w-2/5 rounded-full bg-accent/25 md:mx-auto" />
        )}
        {filled(member.description) ? (
          <p className="mx-auto mt-4 max-w-[34ch] text-[0.98rem] leading-relaxed text-muted">{member.description}</p>
        ) : (
          <div aria-hidden className="mx-auto mt-5 space-y-2.5">
            <div className="h-2.5 w-full rounded-full bg-ink/[0.07]" />
            <div className="h-2.5 w-[88%] rounded-full bg-ink/[0.07] md:mx-auto" />
            <div className="h-2.5 w-[62%] rounded-full bg-ink/[0.07] md:mx-auto" />
          </div>
        )}
      </div>
    </article>
  );
}

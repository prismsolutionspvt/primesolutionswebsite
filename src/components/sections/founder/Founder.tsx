import Image from "next/image";
import { founder as founderContent } from "@/content";
import type { Founder as FounderData } from "@/types";

/** Reusable founder / leadership note. Pure presentation: pass the data in (today from content, later from the admin API). */
export function FounderNote({ founder }: { founder: FounderData }) {
  return (
    <section id="founder" className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* swoosh echoing the logo, behind the portrait */}
      <svg aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
        <path d="M-40 560 C 260 160, 760 40, 1260 130" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".28" strokeWidth="2" />
      </svg>
      <div className="wrap relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <figure className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-t-[999px] rounded-b-[2rem] border border-line bg-surface2 lg:mx-0" data-clip>
            {founder.photoUrl && (
              <Image src={founder.photoUrl} alt={`Portrait of ${founder.name}`} fill sizes="(max-width: 1024px) 80vw, 340px" className="object-cover" />
            )}
          </figure>
        </div>
        <div className="lg:col-span-8">
          <p className="eyebrow mb-6" data-fade>
            A note from our leadership
          </p>
          <svg viewBox="0 0 40 30" className="mb-5 h-8 w-10 text-accent" fill="currentColor" aria-hidden data-fade>
            <path d="M0 30V17Q0 3 14 0v6Q7 8 7 14h7v16Zm22 0V17Q22 3 36 0v6q-7 2-7 8h7v16Z" />
          </svg>
          <blockquote className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-snug tracking-tight" data-fade>
            {founder.message}
          </blockquote>
          <div className="mt-10 flex items-center gap-4 border-t border-line pt-6" data-fade>
            <span aria-hidden className="h-px w-10 bg-accent" />
            <div>
              <p className="font-display text-xl font-semibold">{founder.name}</p>
              {founder.designation && <p className="text-sm text-muted">{founder.designation}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The homepage section: renders nothing until a real name and message are supplied (no empty placeholder is shown). */
export function Founder() {
  if (!founderContent.name.trim() || !founderContent.message.trim()) return null;
  return <FounderNote founder={founderContent} />;
}

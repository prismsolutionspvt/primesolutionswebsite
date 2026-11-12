import Image from "next/image";
import { founder } from "@/content";
import { PrismMark } from "@/components/ui/Logo";
import { Split } from "@/components/ui/Split";

/** Ready for real content: set name, designation, message and photoUrl in /content/copy.ts (later: admin). */
export function Founder() {
  const hasMessage = founder.message.trim().length > 0;
  return (
    <section id="founder" className="relative py-16 sm:py-20 lg:py-24">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-3">
          <figure className="relative mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-t-[999px] rounded-b-[2rem] border border-line bg-surface2/70 lg:mx-0" data-clip>
            {founder.photoUrl ? (
              <Image src={founder.photoUrl} alt={founder.name ? `Portrait of ${founder.name}` : "Founder portrait"} fill sizes="(max-width: 1024px) 80vw, 420px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center text-ink/30">
                  <PrismMark className="mx-auto h-12 w-auto opacity-60" />
                  <p className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.22em]">Portrait to be added</p>
                </div>
              </div>
            )}
          </figure>
        </div>

        <div className="lg:col-span-8 lg:col-start-5">
          <p className="eyebrow mb-6" data-fade>
            From the Leadership
          </p>
          <Split as="h2" className="h-display text-[clamp(2.2rem,6vw,3.6rem)]">
            {founder.heading}
          </Split>
          <div className="mt-8 max-w-xl" data-fade>
            {hasMessage ? (
              <blockquote className="text-xl leading-relaxed text-ink sm:text-2xl">{founder.message}</blockquote>
            ) : (
              <p className="border-l-2 border-accent pl-5 text-xl leading-relaxed text-ink sm:text-2xl">{founder.placeholder}</p>
            )}
            <div className="mt-8 border-t border-line pt-5">
              <p className="font-display text-lg font-semibold">{founder.name || "Name to be confirmed"}</p>
              <p className="text-sm text-muted">{founder.designation || "Designation to be confirmed"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

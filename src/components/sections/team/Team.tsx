import { adaptiveProps } from "@/config/adaptive";
import { team, teamIntro } from "@/content";
import { Split } from "@/components/ui/Split";
import { TeamCard } from "./TeamCard";

/** "Meet the People Behind Prism" — three profile slots, fed entirely by `content/team.ts` (admin-ready). */
export function Team() {
  return (
    <section id="team" {...adaptiveProps("team")} className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* swoosh echoing the logo, drawn once as the section enters */}
      <svg aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block">
        <path data-draw-on-view pathLength={1} d="M-40 560 C 260 160, 760 40, 1260 130" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="wrap relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-6" data-fade>
            {teamIntro.eyebrow}
          </p>
          <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,5rem)] lg:text-[clamp(2.6rem,4.8vw,5rem)]" accent={["Prism"]}>
            {teamIntro.heading}
          </Split>
          <p className="mx-auto mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted lg:text-lg" data-fade>
            {teamIntro.text}
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8 lg:mt-20 lg:gap-14" data-fade>
          {team.map((m, i) => (
            <div key={m.id} className={i === 1 ? "md:-translate-y-8 lg:-translate-y-12" : i === 2 ? "md:translate-y-4" : ""}>
              <TeamCard member={m} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { adaptiveProps } from "@/config/adaptive";
import { about } from "@/content";
import { Split } from "@/components/ui/Split";
import { AboutScene } from "./AboutScene";

/** Company overview (portfolio section 01) with the scroll-driven positioning scene. Mission, vision and values follow as their own scenes. */
export function About() {
  return (
    <section id="about" {...adaptiveProps("about")} className="relative py-20 sm:py-28 lg:py-36">
      <div className="wrap">
        <p className="eyebrow mb-6" data-fade>
          {about.eyebrow}
        </p>
        <Split as="h2" className="h-display max-w-[18ch] text-[clamp(2.3rem,7vw,5.6rem)] lg:text-[clamp(2.8rem,5.2vw,5.6rem)]" accent={["BPO", "Digital", "Services"]}>
          {about.heading}
        </Split>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-2 lg:gap-14">
          {about.overview.map((p, i) => (
            <p key={i} data-fade style={{ ["--d" as string]: `${i * 0.1}s` }} className={`text-[1.05rem] leading-relaxed lg:text-lg ${i === 0 ? "text-ink" : "text-muted"}`}>
              {p}
            </p>
          ))}
        </div>

        <div className="mt-14 lg:mt-20">
          <AboutScene />
        </div>

        <p className="mt-12 max-w-3xl border-l-2 border-accent pl-5 font-display text-[clamp(1.25rem,2.2vw,1.7rem)] font-medium leading-snug tracking-tight lg:mt-16" data-fade>
          {about.principlesLine}
        </p>
      </div>
    </section>
  );
}

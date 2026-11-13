import { about, values } from "@/content";
import { Split } from "@/components/ui/Split";
import { AboutScene } from "./AboutScene";

export function About() {
  return (
    <section id="about" className="relative py-20 sm:py-28 lg:py-36">
      <div className="wrap">
        <p className="eyebrow mb-6" data-fade>
          {about.eyebrow}
        </p>
        <Split as="h2" className="h-display max-w-[20ch] text-[clamp(2.3rem,7vw,5.6rem)] lg:text-[clamp(2.8rem,5.2vw,5.6rem)]" accent={["business", "growth."]}>
          {about.heading}
        </Split>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-2 lg:gap-14">
          {about.overview.map((p, i) => (
            <p key={i} data-fade style={{ ["--d" as string]: `${i * 0.1}s` }} className={`text-[1.05rem] leading-relaxed ${i === 0 ? "text-ink lg:text-lg" : "text-muted lg:text-lg"}`}>
              {p}
            </p>
          ))}
        </div>

        <div className="mt-14 lg:mt-20">
          <AboutScene />
        </div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-line bg-line lg:mt-28 lg:grid-cols-2">
          {[
            { label: "Our Mission", text: about.mission },
            { label: "Our Vision", text: about.vision },
          ].map((b) => (
            <div key={b.label} className="bg-bg p-7 sm:p-10" data-fade>
              <p className="eyebrow">{b.label}</p>
              <p className="mt-5 font-display text-[clamp(1.25rem,2.2vw,1.65rem)] font-medium leading-snug tracking-tight">{b.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 lg:mt-24">
          <p className="eyebrow mb-8" data-fade>
            Our Core Values
          </p>
          <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((v, i) => (
              <li key={v.word} data-fade style={{ ["--d" as string]: `${i * 0.07}s` }} className="group border-t border-line pt-5 transition-colors hover:border-accent">
                <p className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-display text-[1.7rem] font-semibold tracking-tight transition-colors group-hover:text-accent">{v.word}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{v.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

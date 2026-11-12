import { ArrowUpRight } from "lucide-react";
import { about, principles } from "@/content";
import { Split } from "@/components/ui/Split";
import { AboutGraphic } from "./AboutGraphic";

export function About() {
  return (
    <section id="about" className="relative py-20 sm:py-28 lg:py-36">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-6" data-fade>
            Who we are
          </p>
          <Split as="h2" className="h-display max-w-[15ch] text-[clamp(2.4rem,7.4vw,6rem)] lg:text-[clamp(3rem,5.6vw,6rem)]" accent={["Partner", "Progress."]}>
            {about.heading}
          </Split>
          <p className="mt-8 max-w-xl text-xl leading-snug text-ink sm:text-2xl" data-fade>
            {about.paragraphs[0]}
          </p>

          <ul className="mt-10 grid max-w-2xl gap-6 border-t border-line pt-8 sm:grid-cols-3" data-fade>
            {principles.map((p, i) => (
              <li key={p.word}>
                <p className="font-mono text-xs text-accent-text">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-1 font-display text-xl font-semibold tracking-tight">{p.word}</p>
                <p className="mt-1 text-sm leading-snug text-muted">{p.line}</p>
              </li>
            ))}
          </ul>

          <a href="#contact" className="btn btn-primary group mt-10" data-fade>
            Talk to Our Team
            <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="lg:col-span-5">
          <AboutGraphic />
        </div>
      </div>
    </section>
  );
}

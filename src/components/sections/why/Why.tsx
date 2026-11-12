import { ArrowUpRight } from "lucide-react";
import { why } from "@/content";
import { Split } from "@/components/ui/Split";

export function Why() {
  return (
    <section id="why" className="relative py-20 sm:py-28 lg:py-36">
      <div className="wrap">
        <p className="eyebrow mb-6" data-fade>
          Why Prism
        </p>
        <Split as="h2" className="h-display max-w-[18ch] text-[clamp(2.2rem,6.4vw,5rem)] lg:text-[clamp(2.6rem,4.8vw,5rem)]" accent={["Matters."]}>
          {why.heading}
        </Split>

        <ol className="mt-12 grid gap-x-16 lg:mt-16 lg:grid-cols-2">
          {why.items.map((it, i) => (
            <li key={it.title} data-fade style={{ ["--d" as string]: `${(i % 2) * 0.08}s` }} className="group flex gap-5 border-t border-line py-6 sm:gap-7 sm:py-7">
              <span className="w-8 font-mono text-xs text-accent-text sm:text-sm">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{it.title}</h3>
                <p className="mt-1.5 text-[0.98rem] leading-relaxed text-muted">{it.text}</p>
              </div>
            </li>
          ))}
          <li data-fade className="flex items-center border-t border-line py-6 sm:py-7 lg:border-b-0">
            <a href="#contact" className="btn btn-ghost group">
              Discuss your needs
              <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </li>
        </ol>
      </div>
    </section>
  );
}

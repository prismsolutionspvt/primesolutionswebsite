import { adaptiveProps } from "@/config/adaptive";
import { testimonials } from "@/content";
import { Split } from "@/components/ui/Split";

/**
 * Only approved (status === "published") entries are ever shown. Until genuine testimonials exist,
 * the section renders clearly-labelled layout samples with no invented names or quotes.
 */
export function Testimonials() {
  const published = testimonials.filter((t) => t.status === "published");
  const featured = [...published].sort((a, b) => Number(b.featured) - Number(a.featured));

  if (featured.length === 0) return null; // nothing is shown until genuine, approved testimonials exist

  return (
    <section id="testimonials" {...adaptiveProps("testimonials", [])} className="relative bg-surface2/50 py-24 sm:py-32">
      <div className="wrap">
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6" data-fade>
              Client Voices
            </p>
            <Split as="h2" className="h-display text-[clamp(2.2rem,7vw,4.8rem)] lg:text-[clamp(2.6rem,4.4vw,4.8rem)]" accent={["words."]}>
              {"In our clients' own words."}
            </Split>
          </div>
          <p className="max-w-md text-[1.02rem] leading-relaxed text-muted lg:col-span-4" data-fade>
            Genuine, approved client feedback will be published here as engagements begin.
          </p>
        </div>

        {featured.length > 0 ? (
          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <li key={t.id} className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-7">
                <blockquote className="text-lg leading-relaxed">“{t.text}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  {t.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photoUrl} alt={t.name} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <span className="h-11 w-11 rounded-full bg-line" />
                  )}
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-muted">
                      {t.designation}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-14">
            <ul className="grid gap-5 md:grid-cols-3" aria-label="Testimonial layout preview (placeholders)">
              {[0, 1, 2].map((i) => (
                <li key={i} data-fade style={{ ["--d" as string]: `${i * 0.1}s` }} className={`relative rounded-3xl border border-dashed border-ink/25 p-7 ${i === 1 ? "md:translate-y-8" : ""}`}>
                  <span className="absolute right-5 top-5 rounded-full bg-surface2 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted">Sample layout</span>
                  <svg viewBox="0 0 40 30" className="h-7 w-9 text-accent" fill="currentColor" aria-hidden>
                    <path d="M0 30V17Q0 3 14 0v6Q7 8 7 14h7v16Zm22 0V17Q22 3 36 0v6q-7 2-7 8h7v16Z" />
                  </svg>
                  <div aria-hidden className="mt-6 space-y-3">
                    <div className="h-2.5 w-full rounded-full bg-line" />
                    <div className="h-2.5 w-[94%] rounded-full bg-line" />
                    <div className="h-2.5 w-[70%] rounded-full bg-line" />
                  </div>
                  <div className="mt-8 flex items-center gap-3">
                    <span className="h-11 w-11 rounded-full bg-line" aria-hidden />
                    <span className="text-sm text-muted">
                      Customer name
                      <br />
                      Designation, Company
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-14 max-w-xl text-sm leading-relaxed text-muted">
              These are layout samples, not real reviews. No client has been quoted. Approved testimonials added by the administrator will replace them automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

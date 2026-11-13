import Image from "next/image";
import { adaptiveProps } from "@/config/adaptive";
import { getSiteContent } from "@/lib/content/fetch";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Split } from "@/components/ui/Split";
import { ReviewComposer } from "./ReviewComposer";
import { Stars } from "./Stars";

/**
 * Approved reviews + the "Leave a review" composer. Only reviews the owner has approved ever appear (the database
 * refuses to show anything else to visitors); nothing is invented, so with no reviews yet there is simply an invitation.
 */
export async function Reviews() {
  const { reviewsIntro, testimonials } = await getSiteContent();
  // Without a configured database a review cannot be stored, so the composer says so instead of pretending.
  const canSubmit = isSupabaseConfigured;

  return (
    <section id="reviews" {...adaptiveProps("reviews")} className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <svg aria-hidden viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block">
        <path data-draw-on-view pathLength={1} d="M-40 120 C 300 460, 760 640, 1260 420" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".28" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="wrap relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-6" data-fade>
            {reviewsIntro.eyebrow}
          </p>
          <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,5rem)] lg:text-[clamp(2.6rem,4.8vw,5rem)]" accent={["review."]}>
            {reviewsIntro.heading}
          </Split>
          <p className="mx-auto mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted lg:text-lg" data-fade>
            {reviewsIntro.text}
          </p>
        </div>

        <div className="mt-14 lg:mt-20" data-fade>
          <ReviewComposer enabled={canSubmit} />
        </div>

        {testimonials.length > 0 && (
          <div className="mt-20 lg:mt-28">
            <p className="eyebrow mb-8 text-center" data-fade>
              What people say
            </p>
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <li key={t.id} data-fade style={{ ["--d" as string]: `${(i % 3) * 0.08}s` }} className={`review-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-7 transition-all duration-500 hover:-translate-y-1.5 hover:rotate-0 hover:border-accent/60 hover:shadow-[0_24px_60px_-28px_rgb(var(--glow)/0.55)] ${i % 3 === 0 ? "md:-rotate-[0.6deg]" : i % 3 === 2 ? "md:rotate-[0.6deg]" : ""}`}>
                  <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/0 blur-2xl transition-colors duration-700 group-hover:bg-accent/25" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {t.rating ? <Stars value={t.rating} /> : <span />}
                      {t.featured && <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-accent-text">Featured</span>}
                    </div>
                    <blockquote className="mt-5 whitespace-pre-line break-words text-[1.04rem] leading-relaxed">“{t.text}”</blockquote>
                  </div>
                  <figcaption className="relative mt-8 flex items-center gap-3">
                    {t.photoUrl ? (
                      <Image src={t.photoUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 font-display text-lg font-semibold text-accent-text" aria-hidden>
                        {t.name.trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{t.name}</span>
                      {(t.designation || t.company) && <span className="block truncate text-sm text-muted">{[t.designation, t.company].filter(Boolean).join(", ")}</span>}
                    </span>
                  </figcaption>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

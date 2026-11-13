import { ArrowUpRight, Mail } from "lucide-react";
import { navLinks, poweredBy, site, whatsappLink } from "@/config/site";
import { commitment, services } from "@/content";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { Split } from "@/components/ui/Split";
import { CommitmentList } from "./CommitmentList";
import { PointerGlow } from "./PointerGlow";

/** The closing scene: commitments, one big way to get in touch, and the quiet details. */
export function Footer() {
  const year = new Date().getFullYear();
  const { email, phone, address } = site.contact;

  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface">
      <PointerGlow>
        {/* swoosh motif, drawn once on entry by MotionRoot ([data-draw-on-view]) */}
        <svg aria-hidden viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
          <path data-draw-on-view pathLength={1} d="M-40 480 C 300 120, 800 20, 1260 110" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <div className="wrap relative pt-20 sm:pt-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-6" data-fade>
                Our commitment
              </p>
              <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,5rem)] lg:text-[clamp(2.6rem,4.4vw,4.8rem)]" accent={["Progress."]}>
                {commitment.heading}
              </Split>
              <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-muted" data-fade>
                {commitment.text}
              </p>
            </div>
            <div className="lg:col-span-7" data-fade>
              <CommitmentList />
            </div>
          </div>

          {/* the big way to get in touch */}
          <div className="mt-20 border-t border-line pt-14 sm:mt-28 sm:pt-20">
            <p className="eyebrow mb-5 flex items-center gap-3" data-fade>
              <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-accent live-dot" />
              Say hello
            </p>
            <a
              href={`mailto:${email}`}
              className="group relative block w-fit max-w-full break-words font-display text-[clamp(1.55rem,6.2vw,4.6rem)] font-semibold leading-[1.05] tracking-tightest"
            >
              <span className="bg-[linear-gradient(rgb(var(--accent)),rgb(var(--accent)))] bg-[length:0%_3px] bg-[position:0_100%] bg-no-repeat pb-1 transition-[background-size] duration-700 ease-out group-hover:bg-[length:100%_3px]">{email}</span>
              <ArrowUpRight className="ml-2 inline h-[0.7em] w-[0.7em] -translate-x-1 translate-y-1 text-accent opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden />
            </a>
            <p className="mt-5 max-w-lg text-[1.02rem] text-muted">Tell us about your business goals and we will take it from there.</p>
          </div>

          {/* details */}
          <div className="mt-20 grid gap-12 border-t border-line pt-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <BrandLogo height={72} />
              <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-muted">{site.description}</p>
              <div className="mt-6 flex gap-3">
                {site.social.instagram && (
                  <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Prism Solutions on Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-line transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent">
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                )}
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Prism Solutions" className="grid h-11 w-11 place-items-center rounded-full border border-line transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent">
                  <WhatsappIcon className="h-5 w-5" />
                </a>
              </div>
            </div>

            <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
              <div>
                <p className="eyebrow mb-4">Explore</p>
                <ul className="space-y-1">
                  {navLinks.map((l) => (
                    <li key={l.id}>
                      <a href={l.href} className="link-u inline-flex min-h-[40px] items-center text-[0.98rem] text-ink/85">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="eyebrow mb-4">Services</p>
                <ul className="space-y-1">
                  {services.map((s) => (
                    <li key={s.id}>
                      <a href="/#services" className="link-u inline-flex min-h-[40px] items-center text-[0.98rem] text-ink/85">
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="eyebrow mb-4">Contact</p>
                <ul className="space-y-3 text-[0.98rem] text-ink/85">
                  <li className="flex items-start gap-2">
                    <Mail className="mt-1 h-4 w-4 shrink-0 text-accent-text" aria-hidden />
                    <a className="link-u break-all" href={`mailto:${email}`}>
                      {email}
                    </a>
                  </li>
                  {phone && (
                    <li>
                      <a className="link-u" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                        {phone}
                      </a>
                    </li>
                  )}
                  <li className="text-muted">{address || site.locationLabel}</li>
                </ul>
              </div>
            </nav>
          </div>

          <div className="mt-14 flex flex-col gap-5 border-t border-line py-7 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:pr-20">
            <p>
              © {year} {site.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="/privacy" className="link-u inline-flex min-h-[40px] items-center">
                Privacy Policy
              </a>
              <a href="/terms" className="link-u inline-flex min-h-[40px] items-center">
                Terms
              </a>
              <a
                href={poweredBy.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Powered by ${poweredBy.label} (opens in a new tab)`}
                className="group relative inline-flex min-h-[44px] items-center gap-2.5 overflow-hidden rounded-full border border-line px-5 text-[0.95rem] transition-colors duration-300 hover:border-accent"
              >
                <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-accent/15 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <span className="relative">Powered by</span>
                <span className="relative font-display font-semibold tracking-tight text-ink">{poweredBy.label}</span>
                <ArrowUpRight className="relative h-4 w-4 text-accent-text transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>
            </div>
          </div>
          {/* keeps the last row clear of the floating WhatsApp button */}
          <div className="h-16 sm:h-4" />
        </div>
      </PointerGlow>
    </footer>
  );
}

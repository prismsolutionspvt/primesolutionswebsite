import { ArrowUpRight } from "lucide-react";
import { adaptiveProps } from "@/config/adaptive";
import { site, whatsappLink } from "@/config/site";
import { commitment, cta, footer } from "@/content";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ContactCard } from "@/components/ui/ContactCard";
import { PoweredBy } from "@/components/ui/PoweredBy";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { Split } from "@/components/ui/Split";
import { Magnetic } from "@/components/motion/Magnetic";
import { Mail, MapPin, Phone } from "lucide-react";
import { CommitmentGrid } from "./CommitmentGrid";
import { FooterMarquee } from "./FooterMarquee";
import { PointerGlow } from "./PointerGlow";

/**
 * The closing scene. A looping brand line, the service commitments, large navigation that dims its siblings on hover,
 * contact details (all admin-managed settings), the logo, and a clear "Powered by FRX Technologies" credit.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const { email, phone, address } = site.contact;

  return (
    <footer id="footer" {...adaptiveProps("footer")} className="relative overflow-hidden border-t border-line bg-bg">
      <PointerGlow>
        <FooterMarquee phrases={footer.marquee} />

        <div className="wrap relative pt-16 sm:pt-24">
          {/* closing statement + commitments (portfolio section 10) */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-6" data-fade>
              {commitment.eyebrow}
            </p>
            <Split as="h2" className="h-display text-[clamp(2.3rem,7vw,5.2rem)] lg:text-[clamp(2.8rem,5vw,5.2rem)]" accent={["Progress."]}>
              {commitment.heading}
            </Split>
            <p className="mx-auto mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-muted" data-fade>
              {commitment.text}
            </p>
          </div>
          <div data-fade>
            <CommitmentGrid />
          </div>

          {/* navigation + contact */}
          <div className="mt-20 grid gap-14 lg:mt-28 lg:grid-cols-12 lg:gap-16">
            <nav aria-label="Footer" className="lg:col-span-7">
              <p className="eyebrow mb-5">Explore</p>
              <ul className="footer-list border-b border-line">
                {footer.explore.map((l, i) => (
                  <li key={l.label}>
                    <a href={l.href} className="footer-link group relative flex items-baseline gap-5 border-t border-line py-3.5 sm:py-4">
                      <span aria-hidden className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100" />
                      <span className="w-7 font-mono text-xs text-muted transition-colors duration-300 group-hover:text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-display text-[clamp(1.7rem,3.6vw,3rem)] font-semibold leading-none tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-3">{l.label}</span>
                      {l.hint && <span className="ml-auto hidden max-w-[15rem] text-right text-sm text-muted opacity-0 transition-all duration-500 sm:block sm:translate-x-2 group-hover:translate-x-0 group-hover:opacity-100">{l.hint}</span>}
                      <ArrowUpRight className="h-6 w-6 shrink-0 -translate-x-2 self-center text-accent opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 sm:ml-0" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-5">
              <p className="eyebrow mb-5">Get in touch</p>
              <div className="grid gap-3">
                <ContactCard icon={Mail} label="Email" value={email} href={`mailto:${email}`} copy />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ContactCard icon={Phone} label="Phone" value={phone} href={phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined} copy emptyText="Phone number coming soon" />
                  <ContactCard icon={MapPin} label="Location" value={address || site.locationLabel} />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Magnetic strength={0.45}>
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Prism Solutions" className="grid h-12 w-12 place-items-center rounded-full border border-line transition-all duration-300 hover:border-[#25D366] hover:bg-[#25D366] hover:text-white hover:shadow-[0_0_24px_-4px_rgb(37_211_102/0.7)]">
                    <WhatsappIcon className="h-5 w-5" />
                  </a>
                </Magnetic>
                {site.social.instagram && (
                  <Magnetic strength={0.45}>
                    <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Prism Solutions on Instagram" className="grid h-12 w-12 place-items-center rounded-full border border-line transition-all duration-300 hover:border-accent hover:bg-accent hover:text-[#0B1F4B] hover:shadow-[0_0_24px_-4px_rgb(var(--glow)/0.8)]">
                      <InstagramIcon className="h-5 w-5" />
                    </a>
                  </Magnetic>
                )}
              </div>
              <div className="mt-8">
                <Magnetic>
                  <a href="/#contact" className="btn btn-primary group !min-h-[54px] px-7">
                    {cta.button}
                    <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>

          {/* the finish: logo, credit, legal */}
          <div className="mt-20 flex flex-col items-center gap-9 border-t border-line pb-24 pt-14 text-center sm:pb-16 lg:mt-28">
            <div className="relative">
              <div aria-hidden className="absolute inset-0 -z-10 scale-125 rounded-full bg-accent/25 blur-3xl" />
              <BrandLogo height={84} />
            </div>

            <PoweredBy />

            <div className="flex flex-col items-center gap-3 text-sm text-muted">
              <p className="max-w-xl text-[0.78rem] leading-relaxed">{footer.note}</p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
                <p>
                  © {year} {site.name}. All rights reserved.
                </p>
                {footer.legal.map((l) => (
                  <a key={l.label} href={l.href} className="link-u inline-flex min-h-[40px] items-center">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PointerGlow>
    </footer>
  );
}

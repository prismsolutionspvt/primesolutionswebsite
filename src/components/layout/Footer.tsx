import { site, navLinks, whatsappLink } from "@/lib/config";
import { services } from "@/content";
import { PrismMark, Wordmark } from "@/components/ui/Logo";
import { InstagramIcon, LinkedinIcon, WhatsappIcon } from "@/components/ui/SocialIcons";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="surface-night relative overflow-hidden border-t border-line">
      <div className="wrap pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="/#top" className="inline-flex items-center gap-3" aria-label="Prism Solutions — back to top">
              <PrismMark className="h-9 w-auto" />
              <Wordmark className="text-white" />
            </a>
            <p className="mt-6 max-w-sm text-[1.02rem] leading-relaxed text-muted">{site.description}</p>
            <div className="mt-7 flex gap-3">
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">
                <WhatsappIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="eyebrow mb-4">Explore</p>
              <ul className="space-y-1">
                {navLinks.map((l) => (
                  <li key={l.label}>
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
            <div className="hidden sm:block">
              <p className="eyebrow mb-4">Contact</p>
              <ul className="space-y-3 text-[0.98rem] text-ink/85">
                <li>{site.contact.email ? <a className="link-u" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> : <span className="text-muted">Email: to be confirmed</span>}</li>
                <li>{site.contact.phone ? <a className="link-u" href={`tel:${site.contact.phone}`}>{site.contact.phone}</a> : <span className="text-muted">Phone: to be confirmed</span>}</li>
                <li>{site.contact.address || <span className="text-muted">Office: to be confirmed</span>}</li>
              </ul>
            </div>
          </nav>
        </div>

        <div aria-hidden className="mt-16 select-none font-display text-[clamp(4rem,21vw,19rem)] font-extrabold italic leading-[0.8] tracking-tightest text-ink/[0.06]">
          Prism
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-7 pr-16 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em]">Quality · Commitment · Performance</p>
          <div className="flex gap-6">
            <a href="/privacy" className="link-u inline-flex min-h-[40px] items-center">
              Privacy Policy
            </a>
            <a href="/terms" className="link-u inline-flex min-h-[40px] items-center">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

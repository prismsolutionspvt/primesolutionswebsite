import { Mail, MapPin, Phone } from "lucide-react";
import { site, whatsappLink } from "@/lib/config";
import { cta } from "@/content";
import { Split } from "@/components/ui/Split";
import { InstagramIcon, LinkedinIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { ContactForm } from "./ContactForm";

const pending = "To be confirmed";

/** Closing call to action and contact in one place. */
export function Contact() {
  const rows = [
    { icon: Mail, label: "Email", value: site.contact.email, href: site.contact.email ? `mailto:${site.contact.email}` : "" },
    { icon: Phone, label: "Phone", value: site.contact.phone, href: site.contact.phone ? `tel:${site.contact.phone.replace(/[^\d+]/g, "")}` : "" },
    { icon: MapPin, label: "Office", value: site.contact.address, href: "" },
  ];
  return (
    <section id="contact" className="surface-night relative z-10 -mt-10 overflow-hidden rounded-t-[2.5rem] py-20 sm:-mt-14 sm:rounded-t-[3.5rem] sm:py-28 lg:py-36">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-6" data-fade>
            Contact
          </p>
          <Split as="h2" className="h-display text-[clamp(2.4rem,7.6vw,5.2rem)] lg:text-[clamp(2.8rem,4.6vw,5rem)]" accent={["Forward."]}>
            {cta.heading}
          </Split>
          <p className="mt-6 max-w-sm text-[1.05rem] leading-relaxed text-muted" data-fade>
            {cta.text}
          </p>

          <dl className="mt-10 divide-y divide-line border-y border-line" data-fade>
            {rows.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4 py-4">
                <Icon className="h-5 w-5 shrink-0 text-accent-text" aria-hidden />
                <dt className="w-16 text-sm text-muted">{label}</dt>
                <dd className="text-[0.98rem] font-medium">
                  {value ? href ? <a className="link-u" href={href}>{value}</a> : value : <span className="text-muted">{pending}</span>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3" data-fade>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-[44px]">
              <WhatsappIcon className="h-5 w-5 text-[#25D366]" /> WhatsApp us
            </a>
            <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Prism Solutions on LinkedIn" className="btn btn-ghost !min-h-[44px] !w-[44px] !px-0">
              <LinkedinIcon className="h-5 w-5" />
            </a>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Prism Solutions on Instagram" className="btn btn-ghost !min-h-[44px] !w-[44px] !px-0">
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-7" data-fade>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

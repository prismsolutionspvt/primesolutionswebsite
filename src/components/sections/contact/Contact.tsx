import { Mail, MapPin, Phone } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import { cta } from "@/content";
import { Split } from "@/components/ui/Split";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { ContactForm } from "./ContactForm";

const STARS: [number, number, number, string][] = [
  [8, 14, 22, "0s"],
  [88, 22, 16, "1.1s"],
  [74, 78, 26, "2.1s"],
  [14, 84, 14, "0.6s"],
];

/** Closing call to action and contact in one place. Contact values come from `config/site.ts`. */
export function Contact() {
  const { email, phone, address } = site.contact;
  const rows = [
    { icon: Mail, label: "Email", node: <a className="link-u break-all" href={`mailto:${email}`}>{email}</a> },
    { icon: Phone, label: "Phone", node: phone ? <a className="link-u" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> : <span className="text-muted">Available on request</span> },
    { icon: MapPin, label: "Location", node: <span>{address || site.locationLabel}</span> },
  ];

  return (
    <section id="contact" className="relative isolate overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* ambient scene: a swoosh that draws itself, and a few slow-blinking stars */}
      <svg aria-hidden viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 -z-10 h-full w-full">
        <path data-draw-on-view pathLength={1} d="M-40 640 C 320 200, 820 60, 1260 150" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />
        <path data-draw-on-view pathLength={1} d="M-40 700 C 360 280, 840 140, 1260 240" fill="none" stroke="rgb(var(--ink))" strokeOpacity=".1" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {STARS.map(([x, y, size, delay]) => (
        <svg key={`${x}${y}`} aria-hidden viewBox="0 0 24 24" className="twinkle pointer-events-none absolute -z-10 text-accent" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, animationDelay: delay }} fill="currentColor">
          <path d="M12 0Q13 10.5 24 12Q13 13.5 12 24Q11 13.5 0 12Q11 10.5 12 0Z" />
        </svg>
      ))}

      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-6 flex items-center gap-3" data-fade>
            <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-accent live-dot" />
            Let&apos;s connect
          </p>
          <Split as="h2" className="h-display text-[clamp(2.4rem,7.4vw,5.2rem)] lg:text-[clamp(2.8rem,4.6vw,5rem)]" accent={["Forward."]}>
            {cta.heading}
          </Split>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted" data-fade>
            {cta.text}
          </p>

          <dl className="mt-10 divide-y divide-line border-y border-line" data-fade>
            {rows.map(({ icon: Icon, label, node }) => (
              <div key={label} className="group flex items-center gap-4 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-accent-text transition-all duration-300 group-hover:border-accent group-hover:bg-accent/10">
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <dt className="w-16 text-sm text-muted">{label}</dt>
                <dd className="min-w-0 text-[0.98rem] font-medium">{node}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3" data-fade>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-[44px]">
              <WhatsappIcon className="h-5 w-5 text-[#25D366]" /> WhatsApp us
            </a>
            {site.social.instagram && (
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Prism Solutions on Instagram" className="btn btn-ghost !min-h-[44px] !w-[44px] !px-0">
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-7" data-fade>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

import { Mail, MapPin, Phone } from "lucide-react";
import { adaptiveProps } from "@/config/adaptive";
import { site, whatsappLink } from "@/config/site";
import { cta } from "@/content";
import { Split } from "@/components/ui/Split";
import { ContactCard } from "@/components/ui/ContactCard";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { PointerGlow } from "@/components/layout/PointerGlow";
import { ContactForm } from "./ContactForm";

/** Stars sit in the gutters and corners only — never behind the heading or the form. [left %, top %, size px, delay] */
const STARS: [number, number, number, string][] = [
  [47, 5, 18, "0s"],
  [95, 9, 22, "1.1s"],
  [51, 94, 14, "2.1s"],
  [3, 96, 20, "0.6s"],
];

/** Closing call to action and contact in one place. Every contact value comes from `config/site.ts` (admin-managed later). */
export function Contact() {
  const { email, phone, address } = site.contact;

  return (
    <section id="contact" {...adaptiveProps("contact")} className="relative isolate overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* ambient scene: a swoosh that draws itself, a soft glow, and a few slow-blinking stars */}
      <svg aria-hidden viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full sm:block">
        <path data-draw-on-view pathLength={1} d="M-40 640 C 320 200, 820 60, 1260 150" fill="none" stroke="rgb(var(--accent))" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />
        <path data-draw-on-view pathLength={1} d="M-40 700 C 360 280, 840 140, 1260 240" fill="none" style={{ stroke: "rgb(var(--chalk) / var(--chalk-o1))" }} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div aria-hidden data-parallax="0.1" className="pointer-events-none absolute -right-24 top-[12%] -z-10 h-[460px] w-[460px] rounded-full opacity-70" style={{ background: "radial-gradient(circle, rgb(var(--glow) / 0.2), transparent 68%)" }} />
      {STARS.map(([x, y, size, delay]) => (
        <svg key={`${x}${y}`} aria-hidden viewBox="0 0 24 24" className="twinkle pointer-events-none absolute -z-10 text-accent" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, animationDelay: delay }} fill="currentColor">
          <path d="M12 0Q13 10.5 24 12Q13 13.5 12 24Q11 13.5 0 12Q11 10.5 12 0Z" />
        </svg>
      ))}

      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-6 flex items-center gap-3" data-fade>
            <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-accent live-dot" />
            {cta.eyebrow}
          </p>
          <Split as="h2" className="h-display text-[clamp(2.4rem,7.4vw,5.2rem)] lg:text-[clamp(2.8rem,4.6vw,5rem)]" accent={["Forward."]}>
            {cta.heading}
          </Split>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted" data-fade>
            {cta.text}
          </p>

          {/* email and phone sit side by side; both are admin-managed settings */}
          <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-3" data-fade>
            <ContactCard icon={Mail} label="Email" value={email} href={`mailto:${email}`} copy />
            <ContactCard icon={Phone} label="Phone" value={phone} href={phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined} copy emptyText="Phone number coming soon" />
          </div>
          <div className="mt-3" data-fade>
            <ContactCard icon={MapPin} label="Location" value={address || site.locationLabel} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3" data-fade>
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
          <PointerGlow className="rounded-3xl">
            <ContactForm />
          </PointerGlow>
          <p className="mt-4 max-w-xl text-[0.8rem] leading-relaxed text-muted">{cta.fineprint}</p>
        </div>
      </div>
    </section>
  );
}

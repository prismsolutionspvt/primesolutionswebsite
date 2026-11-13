import { Preloader } from "@/components/motion/Preloader";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { AnnouncementHost } from "@/components/layout/AnnouncementHost";
import { About, Approach, Contact, Direction, Faq, Hero, Industries, Reviews, Services, Team, Values, Why } from "@/components/sections";
import { getSiteContent } from "@/lib/content/fetch";

export default async function Home() {
  const c = await getSiteContent();
  const { settings, visibility: show } = c;
  const same = [settings.social.instagramUrl, ...settings.social.links.map((l) => l.url)].filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.company.name,
    url: settings.company.url,
    description: settings.seo.description,
    slogan: settings.company.tagline,
    ...(settings.contact.email ? { email: settings.contact.email } : {}),
    ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
    ...(same.length ? { sameAs: same } : {}),
    // Nothing the owner has not entered is ever published here.
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Preloader />
      <MotionRoot />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        {show.about && <About />}
        {show.direction && c.direction.mission.text && <Direction />}
        {show.values && c.values.length > 0 && <Values />}
        {show.team && c.team.length > 0 && <Team />}
        {show.services && c.services.length > 0 && <Services />}
        {show.why && c.why.items.length > 0 && <Why />}
        {show.industries && c.industries.length > 0 && <Industries />}
        {show.approach && c.approach.stages.length > 0 && <Approach />}
        {show.reviews && <Reviews />}
        {show.faq && c.faqs.length > 0 && <Faq />}
        {show.contact && <Contact />}
      </main>
      <Footer />
      <WhatsAppWidget />
      <AnnouncementHost />
    </>
  );
}

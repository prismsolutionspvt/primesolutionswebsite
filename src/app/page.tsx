import { Preloader } from "@/components/motion/Preloader";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { AnnouncementModal } from "@/components/layout/AnnouncementModal";
import { About, Approach, Contact, Direction, Faq, Hero, Industries, Services, Team, Testimonials, Values, Why } from "@/components/sections";
import { site } from "@/config/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    slogan: site.tagline,
    email: site.contact.email,
    // No street address or phone is published until the client confirms them.
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Preloader />
      <MotionRoot />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Direction />
        <Values />
        <Team />
        <Services />
        <Why />
        <Industries />
        <Approach />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <WhatsAppWidget />
      <AnnouncementModal />
    </>
  );
}

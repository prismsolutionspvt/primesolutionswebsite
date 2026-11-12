import { Preloader } from "@/components/motion/Preloader";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { AnnouncementModal } from "@/components/layout/AnnouncementModal";
import { site } from "@/lib/config";
import { About, Approach, Contact, Faq, Founder, Hero, Industries, Services, Testimonials, Why } from "@/components/sections";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    slogan: site.tagline,
    // No address, phone or registration details until confirmed by the client.
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Preloader />
      <MotionRoot />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Why />
        <Industries />
        <Approach />
        <Founder />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
      <AnnouncementModal />
    </>
  );
}

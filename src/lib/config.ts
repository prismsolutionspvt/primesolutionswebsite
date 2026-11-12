/**
 * Central, replaceable site configuration.
 * Everything unconfirmed by the client stays empty here and is read from env vars,
 * so it can later be driven by an admin panel / CMS without touching components.
 */
const env = (v: string | undefined) => (v && v.trim().length > 0 ? v.trim() : "");

export const site = {
  name: "Prism Solutions",
  tagline: "Your Partner in Business Growth.",
  positioning: "Digital Growth. Business Support. Better Connections.",
  principles: ["Quality", "Commitment", "Performance"] as const,
  url: env(process.env.NEXT_PUBLIC_SITE_URL) || "https://example.com",
  description:
    "Prism Solutions brings digital marketing, sales development, lead generation, customer support and back-office services together as one integrated partner for growing businesses.",
  contact: {
    email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    phone: env(process.env.NEXT_PUBLIC_CONTACT_PHONE),
    address: env(process.env.NEXT_PUBLIC_CONTACT_ADDRESS),
    /** Digits only, international format. Empty = wa.me opens with a contact chooser. */
    whatsappNumber: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER).replace(/\D/g, ""),
  },
  social: {
    instagram: env(process.env.NEXT_PUBLIC_INSTAGRAM_URL) || "https://www.instagram.com/",
    linkedin: env(process.env.NEXT_PUBLIC_LINKEDIN_URL) || "https://www.linkedin.com/",
  },
  enquiryEndpoint: env(process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT),
};

export const whatsappMessage =
  "Hello Prism Solutions, I would like to discuss my business requirements.";

export function whatsappLink(message = whatsappMessage) {
  const base = site.contact.whatsappNumber
    ? `https://wa.me/${site.contact.whatsappNumber}`
    : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const navLinks = [
  { label: "Home", href: "/#top" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services", dropdown: true },
  { label: "Industries", href: "/#industries" },
  { label: "Our Approach", href: "/#approach" },
  { label: "Contact", href: "/#contact" },
] as const;

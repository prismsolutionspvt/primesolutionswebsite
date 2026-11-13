import type { SiteSettings } from "@/types";

/**
 * CENTRAL SITE SETTINGS — the single place for company details, contact info and social links.
 * Components read from here; nothing else hardcodes these values.
 *
 * Source of truth: confirmed values below + NEXT_PUBLIC_* environment overrides (see .env.example).
 * Future: the admin panel / CMS fills the same `SiteSettings` shape.
 *
 * Unconfirmed values (phone, office address, WhatsApp number, Instagram) stay EMPTY. Never invent them.
 */
const env = (v: string | undefined) => (v && v.trim().length > 0 ? v.trim() : "");

export const settings: SiteSettings = {
  company: {
    name: "Prism Solutions",
    tagline: "Your Partner in Business Growth.",
    // The portfolio identifies the company as US-based but gives no city or state.
    locationLabel: "United States",
    url: env(process.env.NEXT_PUBLIC_SITE_URL) || "https://example.com",
    description:
      "Prism Solutions is a US-based BPO and Digital Services company: customer support, sales and telemarketing, appointment setting, lead generation, back-office support and digital marketing from one partner.",
  },
  contact: {
    // Confirmed by the client.
    email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL) || "prismsolutions.pvt@gmail.com",
    phone: env(process.env.NEXT_PUBLIC_CONTACT_PHONE),
    address: env(process.env.NEXT_PUBLIC_CONTACT_ADDRESS),
    whatsappNumber: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER).replace(/\D/g, ""),
  },
  social: {
    instagram: env(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  },
  enquiryEndpoint: env(process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT),
};

/** Back-compat alias used across components. */
export const site = {
  name: settings.company.name,
  tagline: settings.company.tagline,
  url: settings.company.url,
  description: settings.company.description,
  locationLabel: settings.company.locationLabel,
  contact: settings.contact,
  social: settings.social,
  enquiryEndpoint: settings.enquiryEndpoint,
};

export const whatsappMessage = "Hello Prism Solutions, I would like to discuss my business requirements.";

export function whatsappLink(message = whatsappMessage) {
  const base = settings.contact.whatsappNumber ? `https://wa.me/${settings.contact.whatsappNumber}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const navLinks = [
  { label: "Home", href: "/#top", id: "top" },
  { label: "About", href: "/#about", id: "about" },
  { label: "Services", href: "/#services", id: "services", dropdown: true },
  { label: "Industries", href: "/#industries", id: "industries" },
  { label: "Our Approach", href: "/#approach", id: "approach" },
  { label: "Contact", href: "/#contact", id: "contact" },
] as const;

/** WhatsApp deep link from the admin-managed settings (`number` = digits only incl. country code; "" opens the chooser). */
export function buildWhatsappLink(wa: { number: string; message: string }) {
  const base = wa.number ? `https://wa.me/${wa.number}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(wa.message)}`;
}

/** Attribution link shown at the bottom of the site (defaults; the live value comes from Admin → Website Appearance). */
export const poweredBy = { label: "FRX Technologies", href: "https://frxtechnologiesprv.netlify.app/" } as const;

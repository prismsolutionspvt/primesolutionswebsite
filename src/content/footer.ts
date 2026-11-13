import type { FooterContent } from "@/types";

/** Footer content (admin-editable later). Contact details, Instagram and WhatsApp come from `config/site.ts`. */
export const footer: FooterContent = {
  marquee: ["Your Partner in Business Growth.", "Quality", "Commitment", "Performance"],
  explore: [
    { label: "About", href: "/#about", hint: "Who we are" },
    { label: "Services", href: "/#services", hint: "Seven services, one partner" },
    { label: "Industries", href: "/#industries", hint: "Where our services fit" },
    { label: "Our Approach", href: "/#approach", hint: "How we work" },
    { label: "Our Team", href: "/#team", hint: "The people behind Prism" },
    { label: "FAQ", href: "/#faq", hint: "Questions, asked" },
    { label: "Contact", href: "/#contact", hint: "Start a conversation" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
  note: "Specific service scope, delivery arrangements, timelines, and commercial terms are confirmed through individual client discussions and written agreements.",
};

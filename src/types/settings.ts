/**
 * Shape of every value the future admin panel will manage as "settings".
 * Today they are built from defaults + environment variables in `src/config/site.ts`;
 * later the same shape can be filled from an API/database without touching components.
 */
export type SiteSettings = {
  company: {
    name: string;
    tagline: string;
    /** e.g. "United States" — a confirmed, non-specific location label */
    locationLabel: string;
    url: string;
    description: string;
  };
  contact: {
    email: string;
    phone: string;
    /** Full office address. Empty until confirmed by the client. */
    address: string;
    /** Digits only, international format. Empty = WhatsApp opens with a contact chooser. */
    whatsappNumber: string;
  };
  social: {
    instagram: string;
  };
  enquiryEndpoint: string;
};

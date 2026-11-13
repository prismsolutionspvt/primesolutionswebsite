import type { Industry } from "@/types";

/**
 * Source: portfolio section 08. These are potential areas of service fit only.
 * They do NOT imply existing client engagements or specialist certifications.
 */
export const industriesIntro = {
  eyebrow: "Industries",
  heading: "Where our services fit.",
  text: "Our service mix is relevant to a range of organizations. The exact scope is adapted to each industry’s workflows, customer expectations, and compliance requirements.",
  disclaimer:
    "Industry examples indicate potential areas of service fit and do not imply existing client engagements or specialist certifications.",
};

export const industries: Industry[] = [
  {
    id: "healthcare",
    name: "Healthcare & Wellness",
    summary: "Administrative coordination, appointment support, and customer inquiry handling.",
    note: "Subject to client policies and applicable privacy requirements.",
    fits: ["back-office-support", "appointment-setting", "customer-support"],
    scene: "healthcare",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    summary: "Lead research, inquiry handling, appointment coordination, and marketing support.",
    fits: ["lead-generation", "customer-support", "appointment-setting", "digital-marketing"],
    scene: "realestate",
  },
  {
    id: "ecommerce",
    name: "E-commerce & Retail",
    summary: "Customer support, order-related inquiry routing, product promotion, and digital marketing support.",
    fits: ["customer-support", "sales-telemarketing", "digital-marketing"],
    scene: "ecommerce",
  },
  {
    id: "saas",
    name: "SaaS & Technology",
    summary: "Lead generation, appointment setting, customer onboarding assistance, and business development support.",
    fits: ["lead-generation", "appointment-setting", "customer-support"],
    scene: "saas",
  },
  {
    id: "professional-services",
    name: "Professional Services",
    summary: "Prospect research, administrative support, client communication, and marketing coordination.",
    fits: ["lead-generation", "back-office-support", "customer-support", "digital-marketing"],
    scene: "professional",
  },
  {
    id: "finance-insurance",
    name: "Finance & Insurance",
    summary: "Non-advisory administrative and customer support activities.",
    note: "Subject to applicable regulatory and client controls.",
    fits: ["back-office-support", "customer-support"],
    scene: "finance",
  },
];

import type { Industry } from "@/types";

/**
 * Source: portfolio section 08. These are potential areas of service fit only.
 * They do NOT imply existing client engagements or specialist certifications.
 */
export const industriesIntro = {
  eyebrow: "Industries",
  heading: "Where our services fit.",
  text: "Our service mix is relevant to a range of organisations. The exact scope is adapted to each industry's workflows, customer expectations and compliance requirements.",
  disclaimer:
    "Industry examples indicate potential areas of service fit and do not imply existing client engagements or specialist certifications.",
};

export const industries: Industry[] = [
  {
    id: "healthcare",
    name: "Healthcare & Wellness",
    summary: "Administrative coordination and patient-facing communication.",
    services: ["Administrative coordination", "Appointment support", "Customer enquiry handling"],
    note: "Subject to client policies and applicable privacy requirements.",
    scene: "healthcare",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    summary: "Staying responsive to buyers, sellers and tenants.",
    services: ["Lead research", "Enquiry handling", "Appointment coordination", "Marketing support"],
    scene: "realestate",
  },
  {
    id: "ecommerce",
    name: "E-commerce & Retail",
    summary: "Supporting customers and promoting products online.",
    services: ["Customer support", "Order-related enquiry routing", "Product promotion", "Digital marketing support"],
    scene: "ecommerce",
  },
  {
    id: "saas",
    name: "SaaS & Technology",
    summary: "Filling the pipeline and helping new customers get started.",
    services: ["Lead generation", "Appointment setting", "Customer onboarding assistance", "Business development support"],
    scene: "saas",
  },
  {
    id: "professional-services",
    name: "Professional Services",
    summary: "Keeping outreach, administration and communication organised.",
    services: ["Prospect research", "Administrative support", "Client communication", "Marketing coordination"],
    scene: "professional",
  },
  {
    id: "finance-insurance",
    name: "Finance & Insurance",
    summary: "Non-advisory administrative and customer support activities.",
    services: ["Administrative support activities", "Customer support activities"],
    note: "Non-advisory only, subject to applicable regulatory and client controls.",
    scene: "finance",
  },
];

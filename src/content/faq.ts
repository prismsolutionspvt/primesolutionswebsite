import type { Faq } from "@/types";

type FaqCategoryId = "services" | "engagement" | "start";

/**
 * Answers are drawn only from the company portfolio. No availability, language, volume, certification or results claims.
 * Keep them concise; add a new entry here and it appears in the FAQ, the topic filters and the FAQ structured data.
 */
export const faqIntro = {
  eyebrow: "FAQ",
  heading: "Questions, asked.",
  text: "What businesses ask before getting in touch.",
};

export const faqCategories: { id: FaqCategoryId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "services", label: "Services" },
  { id: "engagement", label: "Working together" },
  { id: "start", label: "Getting started" },
];

export const faqs: Faq[] = [
  {
    category: "services",
    q: "What services can Prism handle?",
    a: "Customer support, appointment setting, sales and telemarketing, lead generation, back-office support, and Business Process Outsourcing, alongside digital marketing services such as social media, search engine optimization, paid advertising, content, design, and websites. You can engage support for a defined activity or for a broader set of related processes.",
  },
  {
    category: "engagement",
    q: "Can Prism provide dedicated customer support teams?",
    a: "Yes, through dedicated resource support: assigned personnel supporting agreed activities and working routines. Customer support covers inbound inquiry handling and customer assistance, outbound follow-up and communication, basic issue triage and escalation coordination, and customer relationship support. Scope and responsibilities are defined with you before work begins.",
  },
  {
    category: "services",
    q: "Does Prism handle inbound and outbound calls?",
    a: "Prism handles inbound inquiries and customer assistance, outbound follow-up and customer communication, and outbound calling and campaign execution for sales and telemarketing. Product and service introductions follow approved scripts, and communication channels are defined with each client.",
  },
  {
    category: "services",
    q: "Can Prism support appointment setting and lead generation?",
    a: "Yes. Appointment setting covers prospect outreach and initial engagement, lead qualification based on agreed criteria, calendar coordination and appointment confirmation, and follow-up support with handoff notes for sales teams. Lead generation covers target market and account research, prospect identification, qualification against client-defined criteria, CRM updates, and agreed campaign reporting.",
  },
  {
    category: "start",
    q: "How does onboarding work?",
    a: "Once Prism understands your goals and processes and you have agreed scope, responsibilities, and success measures, onboarding covers access, training, and quality requirements. Delivery then begins, with progress shared through defined reporting.",
  },
  {
    category: "engagement",
    q: "Can services be tailored to a business?",
    a: "Yes. Prism’s solutions are designed around each organization’s requirements, operating environment, and customer expectations, and service scope can be adjusted as business needs and workloads evolve.",
  },
  {
    category: "engagement",
    q: "How is service quality monitored?",
    a: "Through agreed workflows, review points, and performance monitoring, together with quality reviews and feedback loops appropriate to the service being delivered. Performance is reviewed periodically so practical improvements can be identified.",
  },
  {
    category: "start",
    q: "How can a business request a proposal?",
    a: "Use the contact form below, or email prismsolutions.pvt@gmail.com, with your business goals, operational challenges, or customer experience priorities. Prism welcomes the opportunity to understand your requirements and discuss how it can support your team. Scope, delivery arrangements, timelines, and commercial terms are confirmed through client discussions and written agreements.",
  },
  {
    category: "engagement",
    q: "What engagement models are available?",
    a: "Project-based support with a defined scope, deliverables, timeline, and acceptance criteria; dedicated resource support with assigned personnel; and ongoing managed support with agreed workflows, reporting, and review points.",
  },
  {
    category: "start",
    q: "How is client information handled?",
    a: "With respect for client information and in line with the access and data-handling procedures agreed with you. Specific arrangements are confirmed with each client.",
  },
];

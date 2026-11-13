import type { Faq, FaqCategoryId } from "@/types";

/** Answers are drawn only from the company portfolio. No availability, language, volume, certification or results claims. */
export const faqIntro = {
  eyebrow: "FAQ",
  heading: "What businesses ask before getting in touch.",
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
    q: "What types of business processes can Prism Solutions support?",
    a: "Customer support, appointment setting, sales and telemarketing, lead generation and back-office work such as data entry, documentation, data management and administrative coordination. Business Process Outsourcing support can be shaped around your defined workflows and priorities.",
  },
  {
    category: "services",
    q: "Can Prism handle both inbound and outbound customer communication?",
    a: "Yes. Customer support covers inbound enquiries and customer assistance as well as outbound follow-up and communication. Sales and telemarketing and appointment setting involve outbound calling and prospect outreach.",
  },
  {
    category: "services",
    q: "How does Prism support appointment setting and lead qualification?",
    a: "We handle prospect outreach and initial engagement, qualify leads against criteria you agree with us, coordinate calendars, confirm appointments and pass notes to your sales team so each conversation starts informed.",
  },
  {
    category: "services",
    q: "What is included in your digital marketing services?",
    a: "Social media marketing and management, search engine optimisation, paid advertising and campaign management, content creation, brand development and online visibility, graphic design, website design and development, and digital strategy.",
  },
  {
    category: "engagement",
    q: "Can we outsource one specific business function?",
    a: "Yes. You can engage support for a single defined activity or for a broader set of related processes, and the scope can be adjusted as your needs and workloads evolve.",
  },
  {
    category: "engagement",
    q: "What engagement models are available?",
    a: "Project-based support with a defined scope, deliverables, timeline and acceptance criteria; dedicated resource support with assigned personnel; and ongoing managed support with agreed workflows, reporting and review points.",
  },
  {
    category: "engagement",
    q: "How do you determine the scope of a project?",
    a: "We start by understanding your goals, current processes and expectations, then define scope, responsibilities, communication channels and success measures together. Final scope, timelines and commercial terms are confirmed through discussions and written agreements.",
  },
  {
    category: "engagement",
    q: "How are service expectations and performance reviewed?",
    a: "Expectations are documented up front, including scope, deliverables, timelines and responsibilities. Agreed workflows, quality checks and reporting then support consistent delivery, and we review performance periodically to identify practical improvements.",
  },
  {
    category: "start",
    q: "What information do you need before starting an engagement?",
    a: "Your goals, how the work is done today and what you expect from the service. Depending on the service, we may also need your ideal customer profile, target geography, industry, company size and decision-maker criteria, approved scripts, and the access agreed for onboarding and training.",
  },
  {
    category: "start",
    q: "How is client information handled?",
    a: "With respect for your information and in line with the access and data-handling procedures agreed with you. Specific arrangements are confirmed with each client during onboarding.",
  },
];

import type { Service, ServiceGroup } from "@/types";

/**
 * Source: Prism Solutions company portfolio, sections 03–07 (the portfolio's wording and US spelling).
 * Order follows the portfolio's own positioning: customer & business operations first, digital growth last,
 * so the site reads as a BPO / business-solutions company rather than only a digital-marketing agency.
 * Do not add capabilities that are not in the portfolio.
 */

export const serviceGroups: ServiceGroup[] = [
  { id: "customer", label: "Customer & revenue operations" },
  { id: "operations", label: "Business operations" },
  { id: "digital", label: "Digital growth" },
];

export const servicesIntro = {
  eyebrow: "Our Services",
  heading: "BPO and digital services from one partner.",
  text: "Prism Solutions brings complementary services together so clients can access operational, customer-facing, sales, and digital support through one business partner.",
};

export const services: Service[] = [
  {
    id: "customer-support",
    index: "01",
    name: "Customer Support",
    ray: "Customer Support",
    group: "customer",
    tagline: "Inbound inquiries, outbound follow-ups, and customer relationship support.",
    summary: "Support inbound and outbound customer interactions, inquiries, assistance, and relationship management.",
    items: [
      { title: "Inbound customer inquiries", detail: "Inbound inquiry handling and customer assistance." },
      { title: "Customer assistance" },
      { title: "Outbound follow-ups", detail: "Outbound follow-up and customer communication." },
      { title: "Issue triage and escalation coordination", detail: "Basic issue triage, escalation coordination, and service updates." },
      { title: "Customer relationship support", detail: "Customer relationship support and retention-focused engagement." },
    ],
  },
  {
    id: "appointment-setting",
    index: "02",
    name: "Appointment Setting",
    ray: "Appointment Setting",
    group: "customer",
    tagline: "Prospect outreach, qualification, and calendar coordination for your sales team.",
    summary: "Engage prospects, qualify interest, coordinate calendars, and help sales teams create more productive conversations.",
    items: [
      { title: "Prospect outreach", detail: "Prospect outreach and initial engagement." },
      { title: "Lead qualification", detail: "Lead qualification based on agreed criteria." },
      { title: "Calendar coordination", detail: "Calendar coordination and appointment confirmation." },
      { title: "Appointment confirmation" },
      { title: "Follow-up and sales-team handoff", detail: "Follow-up support and handoff notes for sales teams." },
    ],
  },
  {
    id: "sales-telemarketing",
    index: "03",
    name: "Sales & Telemarketing",
    ray: "Sales & Telemarketing",
    group: "customer",
    tagline: "Outbound calling and campaigns that introduce your products and services.",
    summary: "Support outbound sales campaigns, product and service promotion, upselling, and cross-selling activities.",
    items: [
      { title: "Outbound calling", detail: "Outbound calling and campaign execution." },
      { title: "Campaign execution" },
      { title: "Product and service introductions", detail: "Product and service introductions based on approved scripts." },
      { title: "Upselling and cross-selling support", detail: "Upselling and cross-selling support where appropriate." },
      { title: "Prospect feedback and reporting", detail: "Prospect feedback capture and sales activity reporting." },
    ],
  },
  {
    id: "lead-generation",
    index: "04",
    name: "Lead Generation",
    ray: "Lead Generation",
    group: "customer",
    tagline: "Target market research, prospect identification, and lead qualification.",
    summary: "Research target markets, identify prospects, organize data, and support lead qualification and business development.",
    note: "The process can be aligned with a defined ideal customer profile, target geography, industry, company size, and decision-maker criteria.",
    items: [
      { title: "Target market research", detail: "Target market and account research." },
      { title: "Prospect identification", detail: "Prospect identification and contact data organization." },
      { title: "Lead qualification", detail: "Lead qualification against client-defined criteria." },
      { title: "CRM and pipeline support", detail: "CRM updates, list hygiene, and pipeline support." },
      { title: "Research summaries and reporting", detail: "Research summaries and agreed campaign reporting." },
    ],
  },
  {
    id: "back-office-support",
    index: "05",
    name: "Back-Office Support",
    ray: "Back-Office Support",
    group: "operations",
    tagline: "Data entry, documentation, and administrative coordination.",
    summary: "Provide administrative assistance, data entry, documentation, and data management support.",
    note: "Designed to reduce administrative workload and help internal teams maintain organized, consistent processes.",
    items: [
      { title: "Data entry", detail: "Data entry, formatting, and record maintenance." },
      { title: "Document preparation", detail: "Document preparation and digital filing." },
      { title: "Data management", detail: "Data management and information organization." },
      { title: "Administrative coordination", detail: "Administrative coordination and task support." },
      { title: "Process documentation", detail: "Process documentation and routine operational assistance." },
    ],
  },
  {
    id: "business-process-outsourcing",
    index: "06",
    name: "Business Process Outsourcing",
    ray: "BPO",
    group: "operations",
    tagline: "Flexible outsourcing: project-based, dedicated, or ongoing managed support.",
    summary: "Provide flexible outsourcing support tailored to defined workflows, service requirements, and business priorities.",
    note: "Clients can engage support for a defined activity or a broader set of related processes.",
    items: [
      { title: "Project-based support", detail: "Defined scope, deliverables, timeline, and acceptance criteria." },
      { title: "Dedicated resource support", detail: "Assigned personnel supporting agreed activities and working routines." },
      { title: "Ongoing managed support", detail: "Recurring service delivery with agreed workflows, reporting, and review points." },
    ],
  },
  {
    id: "digital-marketing",
    index: "07",
    name: "Digital Marketing",
    ray: "Digital Marketing",
    group: "digital",
    tagline: "Social media, SEO, paid campaigns, content, design, and websites.",
    summary: "Build and strengthen digital presence through strategic marketing, creative content, campaign support, and online visibility.",
    note: "We help businesses communicate their value, connect with relevant audiences, and maintain a consistent digital presence.",
    items: [
      { title: "Social Media Marketing and Management", detail: "Content planning, publishing coordination, community engagement, and account support." },
      { title: "Search Engine Optimization", detail: "Foundational on-page optimization, keyword research support, and content recommendations." },
      { title: "Paid Advertising and Campaign Management", detail: "Campaign setup support, audience targeting, creative coordination, and performance monitoring." },
      { title: "Content Creation and Marketing", detail: "Content calendars, copywriting, campaign messaging, and promotional content." },
      { title: "Brand Development and Online Visibility", detail: "Brand consistency, messaging, and digital presence support." },
      { title: "Graphic Design and Creative Solutions", detail: "Marketing graphics, promotional assets, and visual content." },
      { title: "Website Design and Development", detail: "Business websites and digital experiences aligned with client requirements." },
      { title: "Digital Strategy and Business Growth", detail: "Practical planning to connect marketing activity with business objectives." },
    ],
  },
];

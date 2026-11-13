import type { Service, ServiceGroup } from "@/types";

/** Source: Prism Solutions company portfolio, sections 03–07. Do not add capabilities that are not in the portfolio. */

export const serviceGroups: ServiceGroup[] = [
  { id: "digital", label: "Digital growth" },
  { id: "customer", label: "Customer & revenue operations" },
  { id: "operations", label: "Business operations" },
];

export const services: Service[] = [
  {
    id: "digital-marketing",
    index: "01",
    name: "Digital Marketing",
    ray: "Digital Marketing",
    group: "digital",
    summary:
      "Build and strengthen digital presence through strategic marketing, creative content, campaign support and online visibility.",
    items: [
      { title: "Social media marketing and management", detail: "Content planning, publishing coordination, community engagement and account support." },
      { title: "Search engine optimisation", detail: "Foundational on-page optimisation, keyword research support and content recommendations." },
      { title: "Paid advertising and campaign management", detail: "Campaign setup support, audience targeting, creative coordination and performance monitoring." },
      { title: "Content creation and marketing", detail: "Content calendars, copywriting, campaign messaging and promotional content." },
      { title: "Brand development and online visibility", detail: "Brand consistency, messaging and digital presence support." },
      { title: "Graphic design", detail: "Marketing graphics, promotional assets and visual content." },
      { title: "Website design and development", detail: "Business websites and digital experiences aligned with client requirements." },
      { title: "Digital strategy", detail: "Practical planning that connects marketing activity with business objectives." },
    ],
  },
  {
    id: "customer-support",
    index: "02",
    name: "Customer Support",
    ray: "Customer Support",
    group: "customer",
    summary: "Support inbound and outbound customer interactions, enquiries, assistance and relationship management.",
    items: [
      { title: "Inbound customer enquiries", detail: "Inbound enquiry handling and customer assistance." },
      { title: "Customer assistance" },
      { title: "Outbound follow-ups", detail: "Outbound follow-up and customer communication." },
      { title: "Issue triage and escalation coordination", detail: "Basic issue triage, escalation coordination and service updates." },
      { title: "Customer relationship support", detail: "Relationship support and retention-focused engagement." },
    ],
  },
  {
    id: "appointment-setting",
    index: "03",
    name: "Appointment Setting",
    ray: "Appointment Setting",
    group: "customer",
    summary:
      "Engage prospects, qualify interest, coordinate calendars and help sales teams create more productive conversations.",
    items: [
      { title: "Prospect outreach", detail: "Prospect outreach and initial engagement." },
      { title: "Lead qualification", detail: "Qualification based on agreed criteria." },
      { title: "Calendar coordination" },
      { title: "Appointment confirmation" },
      { title: "Follow-up and sales-team handoff", detail: "Follow-up support and handoff notes for sales teams." },
    ],
  },
  {
    id: "sales-telemarketing",
    index: "04",
    name: "Sales & Telemarketing",
    ray: "Sales & Telemarketing",
    group: "customer",
    summary:
      "Support outbound sales campaigns, product and service promotion, upselling and cross-selling activities.",
    items: [
      { title: "Outbound calling" },
      { title: "Campaign execution" },
      { title: "Product and service introductions", detail: "Based on approved scripts." },
      { title: "Upselling and cross-selling support", detail: "Where appropriate." },
      { title: "Prospect feedback and reporting", detail: "Prospect feedback capture and sales activity reporting." },
    ],
  },
  {
    id: "lead-generation",
    index: "05",
    name: "Lead Generation",
    ray: "Lead Generation",
    group: "customer",
    summary:
      "Build and organise prospect pipelines through focused research and qualification, aligned with your ideal customer profile, geography, industry, company size and decision-maker criteria.",
    items: [
      { title: "Target market research", detail: "Target market and account research." },
      { title: "Prospect identification" },
      { title: "Contact data organisation" },
      { title: "Lead qualification", detail: "Against client-defined criteria." },
      { title: "CRM and pipeline support", detail: "CRM updates, list hygiene and pipeline support, with research summaries and agreed campaign reporting." },
    ],
  },
  {
    id: "back-office-support",
    index: "06",
    name: "Back-Office Support",
    ray: "Back-Office Support",
    group: "operations",
    summary:
      "Reduce administrative workload and help internal teams maintain organised, consistent processes.",
    items: [
      { title: "Data entry", detail: "Data entry, formatting and record maintenance." },
      { title: "Document preparation", detail: "Document preparation and digital filing." },
      { title: "Data management", detail: "Data management and information organisation." },
      { title: "Administrative coordination", detail: "Administrative coordination and task support." },
      { title: "Process documentation", detail: "Process documentation and routine operational assistance." },
    ],
  },
  {
    id: "business-process-outsourcing",
    index: "07",
    name: "Business Process Outsourcing",
    ray: "BPO",
    group: "operations",
    summary:
      "Flexible outsourcing support shaped around your workload, operating model and service objectives. Engage support for a defined activity or a broader set of related processes.",
    items: [
      { title: "Project-based support", detail: "Defined scope, deliverables, timeline and acceptance criteria." },
      { title: "Dedicated resource support", detail: "Assigned personnel supporting agreed activities and working routines." },
      { title: "Ongoing managed support", detail: "Recurring service delivery with agreed workflows, reporting and review points." },
    ],
  },
];

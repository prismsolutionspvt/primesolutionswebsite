import type { Service } from "@/types";

export const services: Service[] = [
  {
    id: "digital-marketing",
    index: "01",
    name: "Digital Marketing",
    short: "Digital Marketing",
    ray: "Digital",
    core: true,
    summary:
      "Strategic digital solutions that help businesses improve visibility, reach relevant audiences and strengthen their online presence.",
    items: [
      "Social media marketing and management",
      "Search engine optimisation",
      "Paid advertising",
      "Content marketing",
      "Brand development",
      "Graphic design",
      "Website design and development",
      "Digital strategy",
    ],
    fit: "For businesses that want one team to plan, create and run their online presence rather than coordinating several freelancers.",
  },
  {
    id: "customer-support",
    index: "02",
    name: "Customer Support",
    short: "Customer Support",
    ray: "Support",
    summary:
      "Responsive, courteous support that keeps your customers heard, informed and looked after, before and after they buy.",
    items: [
      "Inbound customer support",
      "Outbound customer follow-ups",
      "Customer enquiry handling",
      "Customer assistance",
      "Relationship management",
      "Complaint handling and escalation",
    ],
    fit: "For teams that need dependable customer communication without building a support department in-house.",
  },
  {
    id: "appointment-setting",
    index: "03",
    name: "Appointment Setting",
    short: "Appointment Setting",
    ray: "Appointments",
    summary:
      "Qualified conversations turned into confirmed meetings, so your sales team spends its time with people who are ready to talk.",
    items: [
      "Lead qualification",
      "Appointment scheduling",
      "Prospect engagement",
      "Follow-up coordination",
      "Sales pipeline support",
    ],
    fit: "For sales teams that want a fuller calendar and fewer unqualified calls.",
  },
  {
    id: "sales-telemarketing",
    index: "04",
    name: "Sales & Telemarketing",
    short: "Sales & Telemarketing",
    ray: "Sales",
    summary:
      "Structured outbound campaigns that introduce your products and services to the right people and keep the conversation moving.",
    items: [
      "Outbound sales campaigns",
      "Customer engagement",
      "Product and service promotion",
      "Upselling and cross-selling support",
      "Sales development",
    ],
    fit: "For businesses that want to extend their sales reach with a campaign-based team.",
  },
  {
    id: "lead-generation",
    index: "05",
    name: "Lead Generation",
    short: "Lead Generation",
    ray: "Leads",
    summary:
      "Research-led prospecting that identifies, qualifies and organises opportunities, ready for your team to pursue.",
    items: [
      "Prospect research",
      "Data collection",
      "Lead qualification",
      "B2B and B2C outreach",
      "Opportunity identification",
    ],
    fit: "For companies entering new segments or markets that need a steady, organised flow of prospects.",
  },
  {
    id: "back-office-support",
    index: "06",
    name: "Back-Office Support",
    short: "Back-Office Support",
    ray: "Back-office",
    summary:
      "The behind-the-scenes work that keeps a business running smoothly, handled accurately and kept organised.",
    items: [
      "Data entry",
      "Documentation",
      "Data management",
      "Administrative assistance",
      "Operational support",
    ],
    fit: "For owners and managers who want routine administration off their desks.",
  },
  {
    id: "business-process-outsourcing",
    index: "07",
    name: "Business Process Outsourcing",
    short: "Business Process Outsourcing",
    ray: "BPO",
    summary:
      "Flexible outsourcing arrangements shaped around your processes, volumes and the pace at which your business is growing.",
    items: [
      "Flexible outsourcing solutions",
      "Campaign-based support",
      "Dedicated operational assistance",
      "Customer communication support",
      "Scalable business processes",
    ],
    fit: "For businesses that want to scale operations up or down without carrying fixed overheads.",
  },
];

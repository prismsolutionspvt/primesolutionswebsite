import type { Industry } from "@/types";

export const industries: Industry[] = [
  {
    id: "ecommerce",
    name: "E-commerce & Retail",
    blurb:
      "Online shops and retailers compete on visibility and on how customers feel after they click buy.",
    help: [
      "Social, search and paid campaigns that bring relevant shoppers to the store",
      "Order and product enquiry handling for customers",
      "Outbound follow-ups to keep customers engaged",
    ],
    art: "grid",
  },
  {
    id: "real-estate",
    name: "Real Estate & Property Services",
    blurb:
      "Property businesses live on timely conversations with buyers, sellers and tenants.",
    help: [
      "Lead research and qualification for listings and developments",
      "Viewing and appointment scheduling",
      "Content and design for property marketing",
    ],
    art: "roofs",
  },
  {
    id: "healthcare",
    name: "Healthcare & Wellness",
    blurb:
      "Clinics and wellness providers need approachable communication and well-organised administration.",
    help: [
      "Appointment scheduling and reminders",
      "Enquiry handling for prospective patients and clients",
      "Records, documentation and data management support",
    ],
    art: "pulse",
  },
  {
    id: "education",
    name: "Education & Training",
    blurb:
      "Institutions and training providers need to reach learners and guide them from interest to enrolment.",
    help: [
      "Prospect outreach and enquiry follow-up",
      "Campaign support for intake periods",
      "Administrative and data support for enrolment processes",
    ],
    art: "lines",
  },
  {
    id: "technology",
    name: "Technology & Professional Services",
    blurb:
      "Specialist firms need a steady pipeline of qualified conversations with the right decision-makers.",
    help: [
      "B2B prospect research and outreach",
      "Appointment setting for sales and consulting teams",
      "Brand, website and content support",
    ],
    art: "nodes",
  },
  {
    id: "local-services",
    name: "Home Services & Local Businesses",
    blurb:
      "Local businesses win on being easy to find, easy to reach and quick to respond.",
    help: [
      "Local visibility through search and social media",
      "Call handling and customer follow-up",
      "Booking coordination and admin support",
    ],
    art: "arches",
  },
];

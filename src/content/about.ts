import type { PositioningPillar, Value } from "@/types";

/** Source: portfolio sections 01–02. Mission, vision and values are the portfolio's own wording. */
export const about = {
  eyebrow: "About Prism Solutions",
  heading: "A BPO and Digital Services partner built for business growth.",
  overview: [
    "Prism Solutions is a US-based Business Process Outsourcing (BPO) and Digital Services company dedicated to helping businesses streamline operations, strengthen their market presence, enhance customer experiences and achieve sustainable growth.",
    "We bring together professional service delivery, practical digital capabilities and dedicated human resources to support the day-to-day needs and growth objectives of our clients, shaped around each organisation's requirements, operating environment and customer expectations.",
  ],
  mission:
    "To become a trusted global business solutions partner by delivering high-quality BPO, digital marketing, customer support and sales services that help businesses grow, operate efficiently and build lasting customer relationships.",
  vision:
    "To establish Prism Solutions as a globally recognised BPO and Digital Services company, empowering businesses across industries through innovative marketing strategies, exceptional customer experiences, professional outsourcing solutions and reliable business partnerships.",
};

export const positioning: PositioningPillar[] = [
  { title: "Business process support", text: "Flexible operational and administrative assistance." },
  { title: "Customer experience", text: "Professional engagement across customer touchpoints." },
  { title: "Sales enablement", text: "Prospecting, qualification, appointment setting and outreach." },
  { title: "Digital growth", text: "Marketing, creative and online presence support." },
];

export const values: Value[] = [
  { word: "Quality", line: "Accurate, consistent and professional service delivery." },
  { word: "Commitment", line: "Responsibility for agreed work, timelines and communication." },
  { word: "Performance", line: "Useful outcomes and continuous improvement." },
  { word: "Trust", line: "Transparency, respect and dependable partnerships." },
  { word: "Adaptability", line: "Support shaped around client priorities and workflows." },
];

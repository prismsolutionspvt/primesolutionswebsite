import type { PositioningPillar, Value } from "@/types";

/** Source: portfolio sections 01–02. Overview, mission, vision and values are the portfolio's own wording. */
export const about = {
  eyebrow: "About Prism Solutions",
  heading: "A US-based BPO and Digital Services company.",
  overview: [
    "Prism Solutions is a US-based Business Process Outsourcing (BPO) and Digital Services company dedicated to helping businesses streamline operations, strengthen their market presence, enhance customer experiences, and achieve sustainable growth.",
    "We bring together professional service delivery, practical digital capabilities, and dedicated human resources to support the day-to-day needs and growth objectives of our clients. Our solutions are designed around each organization’s requirements, operating environment, and customer expectations.",
  ],
  principlesLine:
    "Our work is guided by three core principles: Quality, Commitment, and Performance. We value clear communication, dependable execution, and long-term working relationships.",
};

export const direction = {
  mission: {
    label: "Our Mission",
    text: "To become a trusted global business solutions partner by delivering high-quality BPO, digital marketing, customer support, and sales services that help businesses grow, operate efficiently, and build lasting customer relationships.",
    /** Phrases that glow in the accent colour as the sentence is read */
    highlights: ["trusted global business solutions partner", "grow, operate efficiently, and build lasting customer relationships"],
  },
  vision: {
    label: "Our Vision",
    text: "To establish Prism Solutions as a globally recognized BPO and Digital Services company, empowering businesses across industries through innovative marketing strategies, exceptional customer experiences, professional outsourcing solutions, and reliable business partnerships.",
    highlights: ["globally recognized BPO and Digital Services company", "reliable business partnerships"],
  },
};

export const positioning: PositioningPillar[] = [
  { title: "Business process support", text: "Flexible operational and administrative assistance." },
  { title: "Customer experience", text: "Professional engagement across customer touchpoints." },
  { title: "Sales enablement", text: "Prospecting, qualification, appointment setting, and outreach." },
  { title: "Digital growth", text: "Marketing, creative, and online presence support." },
];

export const valuesIntro = {
  eyebrow: "Our Core Values",
  heading: "What guides our work.",
};

export const values: Value[] = [
  { word: "Quality", line: "Accurate, consistent, and professional service delivery." },
  { word: "Commitment", line: "Responsibility for agreed work, timelines, and communication." },
  { word: "Performance", line: "Useful outcomes and continuous improvement." },
  { word: "Trust", line: "Transparency, respect, and dependable partnerships." },
  { word: "Adaptability", line: "Support shaped around client priorities and workflows." },
];

import type { Stage } from "@/types";

/** Source: portfolio section 07, "How we work". */
export const approach = {
  eyebrow: "Our Approach",
  heading: "How we work.",
  text: "Five stages from first conversation to continuous improvement.",
  stages: [
    { n: "01", name: "Understand", text: "Understand goals, current processes and service expectations." },
    { n: "02", name: "Define", text: "Define scope, responsibilities, communication channels and success measures." },
    { n: "03", name: "Agree", text: "Agree onboarding, access, training and quality requirements." },
    { n: "04", name: "Deliver", text: "Deliver the agreed services and share progress through defined reporting." },
    { n: "05", name: "Review", text: "Review performance and identify practical improvements." },
  ] satisfies Stage[],
};

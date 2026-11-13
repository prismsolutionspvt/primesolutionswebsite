import type { Commitment } from "@/types";

/** Source: portfolio sections 10–11. */
export const cta = {
  heading: "Let's Build Something That Moves Your Business Forward.",
  text: "Tell us about your business goals, operational challenges or customer experience priorities. We would welcome the opportunity to understand your requirements and discuss how Prism Solutions may support your team.",
  button: "Start a Conversation",
};

export const commitment = {
  heading: "Built on Trust. Focused on Progress.",
  text: "We believe our success is measured by the success and satisfaction of our clients. We aim to build professional relationships, create growth opportunities and provide dependable support that helps businesses move forward.",
  items: [
    { title: "Clear communication", text: "Agreed points of contact, updates and escalation routes." },
    { title: "Defined expectations", text: "Documented scope, deliverables, timelines and responsibilities." },
    { title: "Responsible handling", text: "Respect for client information and adherence to agreed access and data-handling procedures." },
    { title: "Quality reviews", text: "Checks and feedback loops appropriate to the service being delivered." },
    { title: "Continuous improvement", text: "Periodic review of workflows and opportunities to improve." },
  ] satisfies Commitment[],
};

import type { Founder } from "@/types";

/**
 * Founder / leadership message.
 * Fill ALL fields to publish the section; while name or message is empty the section is not rendered at all
 * (no empty placeholder is ever shown). Later this is managed from the admin panel.
 * `photoUrl` is a /public path (e.g. "/founder/portrait.jpg") or an absolute URL.
 */
export const founder: Founder = {
  name: "",
  designation: "",
  message: "",
  photoUrl: "",
};

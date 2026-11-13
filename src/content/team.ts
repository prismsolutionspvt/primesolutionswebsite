import type { TeamMember } from "@/types";

/**
 * "Meet the People Behind Prism" — three profile slots.
 * Every field is admin-editable later. NOTHING here may be invented: names, designations, descriptions and photos
 * are supplied by the client. While a field is empty the layout shows an elegant placeholder for it.
 * `photoUrl` is a /public path (e.g. "/team/member-1.jpg") or an absolute URL.
 */
export const teamIntro = {
  eyebrow: "Our team",
  heading: "Meet the People Behind Prism",
  text: "Behind every successful connection is a team that believes in understanding people, delivering with purpose and building lasting business relationships. Meet the people helping bring the Prism vision to life.",
};

export const team: TeamMember[] = [
  { id: "member-1", name: "", designation: "", description: "", photoUrl: "" },
  { id: "member-2", name: "", designation: "", description: "", photoUrl: "" },
  { id: "member-3", name: "", designation: "", description: "", photoUrl: "" },
];

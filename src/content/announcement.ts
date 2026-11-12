import type { Announcement } from "@/types";

/** Announcement popup. Disabled until enabled here (later: by the admin panel). */
export const announcement: Announcement = {
  enabled: false,
  showOnLoad: true,
  heading: "",
  text: "",
  dismissDays: 7,
};

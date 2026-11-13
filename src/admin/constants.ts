/** Shared (non-"use server") constants for the admin. */
export const ENQUIRY_STATUSES = ["new", "contacted", "in_progress", "converted", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  converted: "Converted",
  closed: "Closed",
};

/** Colours for status chips (text on a tinted background; each pair passes contrast in light and dark). */
export const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: "bg-[#F28A1E]/15 text-[#B05800] dark:text-[#F7A83B]",
  contacted: "bg-[#5B72B0]/15 text-[#3A4F8A] dark:text-[#A9BBEA]",
  in_progress: "bg-[#E3A23B]/20 text-[#8A5A00] dark:text-[#F2C46B]",
  converted: "bg-[#2F8071]/15 text-[#1F6154] dark:text-[#7FD3C0]",
  closed: "bg-ink/10 text-muted",
};

export type Enquiry = {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

/** "saved" = stored in the database; "preview" = Supabase is not configured, nothing was stored. */
export type EnquiryResult = { ok: true; mode: "saved" | "preview" } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type Enquiry = {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

export type EnquiryResult = { ok: true; mode: "delivered" | "preview" } | { ok: false; error: string };

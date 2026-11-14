/**
 * Field definitions for the admin forms. These are plain, serialisable objects: the SAME definition renders the form
 * in the browser (components/admin/FormFields.tsx) and validates the submission on the server (admin/parse.ts), so a
 * rule can never exist in one place and be missing from the other.
 */
export type Opt = { value: string; label: string };
export type MediaFolder = "logos" | "team" | "services" | "industries" | "testimonials" | "announcements" | "website";

type Base = {
  /** database column (or "extra.key" for a value stored inside a site_sections.extra JSON column) */
  name: string;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  /** 2 = full width in the two-column form grid */
  span?: 1 | 2;
};

export type FieldDef = Base &
  (
    | { kind: "text"; max?: number }
    | { kind: "combo"; max?: number; suggestions: string[] }
    | { kind: "textarea"; max?: number; rows?: number }
    /** text[] column, edited as paragraphs separated by a blank line */
    | { kind: "paragraphs"; max?: number; maxItems?: number; rows?: number }
    /** text[] column, edited as one item per line */
    | { kind: "lines"; max?: number; maxItems?: number; rows?: number }
    | { kind: "number"; min?: number; max?: number; default?: number }
    | { kind: "switch" }
    | { kind: "select"; options: Opt[] }
    /** several values chosen from a list that the page supplies at runtime (e.g. the services an industry fits) */
    | { kind: "multi"; optionsFrom: string }
    | { kind: "image"; folder: MediaFolder }
    | { kind: "datetime" }
    /** http(s) / site-relative / #anchor / mailto: / tel:  — never javascript: */
    | { kind: "url"; nullable?: boolean; httpOnly?: boolean }
    | { kind: "slug"; from?: string }
    | { kind: "email" }
    | { kind: "phone" }
    | { kind: "digits"; max?: number }
    | { kind: "pairs"; titleLabel?: string; textLabel?: string; maxItems?: number }
  );

export type FormSection = { title: string; description?: string; fields: string[] };

/** A child list edited inside its parent's editor (e.g. a service's subcategories). */
export type ChildDef = {
  table: string;
  fk: string;
  singular: string;
  plural: string;
  fields: FieldDef[];
  titleField: string;
};

export type ResourceDef = {
  key: string;
  table: string;
  singular: string;
  plural: string;
  description: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  fields: FieldDef[];
  sections?: FormSection[];
  /** has a sort_order column and Up / Down controls */
  order: boolean;
  /** the on/off column that publishes the record */
  flag?: { column: string; on: string; off: string };
  /** extra columns the list may toggle directly (whitelist for the quick-toggle action) */
  quick?: Record<string, string[] | "boolean">;
  children?: ChildDef;
  /** filter tabs over a status column */
  tabs?: { column: string; options: Opt[] };
  /** form values pre-filled for a NEW record (anything not listed falls back to the field default) */
  defaults?: Record<string, unknown>;
  /** text shown when the list is empty */
  empty: string;
};

/** Value sent from a form: strings, booleans, string arrays, pair lists. */
export type FormValues = Record<string, unknown>;
export type Pair = { title: string; text: string };

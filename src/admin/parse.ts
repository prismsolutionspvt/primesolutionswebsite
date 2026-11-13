import { z } from "zod";
import type { FieldDef, FormValues, Pair } from "./fields";

/**
 * SERVER-SIDE validation of an admin form submission. The browser also checks (for fast feedback), but this is the
 * authority: whatever arrives is cleaned, length-limited and shape-checked here before it reaches the database
 * (which then enforces the same limits again with CHECK constraints).
 */
const CTL_SINGLE = /[\u0000-\u001F\u007F]/g;
const CTL_MULTI = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const MEDIA_RE = /^[a-z0-9][a-z0-9/_.-]{0,200}$/;
// a site-relative link must be a single slash followed by a non-slash ("//host" and "/\\host" are really other sites)
const URL_RE = /^(https?:\/\/[^\s]+|\/([^/\\\s][^\s]*)?|#[^\s]*|mailto:[^\s]+|tel:[+0-9() .-]+)$/i;
const HTTP_RE = /^https?:\/\/[^\s]+$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const single = (v: unknown) => (typeof v === "string" ? v.replace(CTL_SINGLE, "").replace(/[ \t]+/g, " ").trim() : "");
const multi = (v: unknown) => (typeof v === "string" ? v.replace(CTL_MULTI, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() : "");
const asText = (v: unknown) => (Array.isArray(v) ? v.join("\n") : v);

export type ParseResult = { ok: true; data: Record<string, unknown> } | { ok: false; errors: Record<string, string> };

export function parseFields(fields: FieldDef[], raw: FormValues): ParseResult {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const fail = (f: FieldDef, msg: string) => {
    errors[f.name] ??= msg;
  };

  for (const f of fields) {
    const v = raw[f.name];
    switch (f.kind) {
      case "text":
      case "combo": {
        const s = single(v);
        if (f.required && !s) fail(f, `${f.label} is required.`);
        else if (s.length > (f.max ?? 200)) fail(f, `Please keep this under ${f.max ?? 200} characters.`);
        data[f.name] = s;
        break;
      }
      case "email": {
        const s = single(v).toLowerCase();
        if (f.required && !s) fail(f, `${f.label} is required.`);
        else if (s && !z.string().email().safeParse(s).success) fail(f, "Please enter a valid email address.");
        else if (s.length > 160) fail(f, "That email address is too long.");
        data[f.name] = s;
        break;
      }
      case "phone": {
        const s = single(v);
        if (s && !/^[+()\d\s.-]{7,24}$/.test(s)) fail(f, "Use digits, spaces, + ( ) - only (7–24 characters).");
        data[f.name] = s;
        break;
      }
      case "digits": {
        const s = single(v);
        if (s && !/^\d+$/.test(s)) fail(f, "Digits only, please.");
        else if (s.length > (f.max ?? 15)) fail(f, `At most ${f.max ?? 15} digits.`);
        data[f.name] = s;
        break;
      }
      case "slug": {
        const s = single(v).toLowerCase();
        if (s && (!SLUG_RE.test(s) || s.length > 60)) fail(f, "Use lowercase letters, numbers and single hyphens only.");
        data[f.name] = s;
        break;
      }
      case "textarea": {
        const s = multi(v);
        if (f.required && !s) fail(f, `${f.label} is required.`);
        else if (s.length > (f.max ?? 2000)) fail(f, `Please keep this under ${f.max ?? 2000} characters.`);
        data[f.name] = s;
        break;
      }
      case "paragraphs":
      case "lines": {
        const text = asText(v);
        const parts = (typeof text === "string" ? text.replace(CTL_MULTI, "") : "")
          .split(f.kind === "paragraphs" ? /\n\s*\n/ : /\n/)
          .map((p) => p.replace(/[ \t]+/g, " ").trim())
          .filter(Boolean);
        const max = f.max ?? 1200;
        if (parts.length > (f.maxItems ?? 12)) fail(f, `At most ${f.maxItems ?? 12} entries.`);
        else if (parts.some((p) => p.length > max)) fail(f, `Each entry must be under ${max} characters.`);
        if (f.required && parts.length === 0) fail(f, `${f.label} is required.`);
        data[f.name] = parts;
        break;
      }
      case "number": {
        if (v === "" || v === null || v === undefined) {
          data[f.name] = f.default ?? null;
          break;
        }
        const n = Number(v);
        if (!Number.isInteger(n)) fail(f, "Please enter a whole number.");
        else if (f.min !== undefined && n < f.min) fail(f, `Must be at least ${f.min}.`);
        else if (f.max !== undefined && n > f.max) fail(f, `Must be at most ${f.max}.`);
        data[f.name] = n;
        break;
      }
      case "switch":
        data[f.name] = v === true || v === "true";
        break;
      case "select": {
        const s = single(v);
        if (!f.options.some((o) => o.value === s)) fail(f, "Please choose one of the options.");
        data[f.name] = s;
        break;
      }
      case "multi": {
        const arr = Array.isArray(v) ? v.map(single) : [];
        if (arr.length > 30 || arr.some((s) => !SLUG_RE.test(s))) fail(f, "Invalid selection.");
        data[f.name] = arr.filter((s) => SLUG_RE.test(s));
        break;
      }
      case "image": {
        const s = single(v);
        if (s && (!MEDIA_RE.test(s) || s.includes(".."))) fail(f, "That image is not valid.");
        data[f.name] = s || null;
        break;
      }
      case "datetime": {
        const s = single(v);
        if (!s) {
          data[f.name] = null;
          break;
        }
        const t = Date.parse(s);
        if (Number.isNaN(t)) fail(f, "Please enter a valid date and time.");
        data[f.name] = Number.isNaN(t) ? null : new Date(t).toISOString();
        break;
      }
      case "url": {
        const s = single(v);
        if (!s) {
          if (f.required) fail(f, `${f.label} is required.`);
          data[f.name] = f.nullable ? null : "";
          break;
        }
        if (s.length > 500 || !(f.httpOnly ? HTTP_RE : URL_RE).test(s)) fail(f, f.httpOnly ? "Please enter a full web address starting with https://" : "Use a full web address (https://…), a site link such as /#contact, a mailto: or a tel: link.");
        data[f.name] = s;
        break;
      }
      case "pairs": {
        const arr = Array.isArray(v) ? v : [];
        const pairs: Pair[] = arr
          .map((p) => ({ title: single((p as Pair)?.title), text: multi((p as Pair)?.text) }))
          .filter((p) => p.title);
        if (pairs.length > (f.maxItems ?? 12)) fail(f, `At most ${f.maxItems ?? 12} entries.`);
        else if (pairs.some((p) => p.title.length > 160 || p.text.length > 600)) fail(f, "One of the entries is too long.");
        data[f.name] = pairs;
        break;
      }
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

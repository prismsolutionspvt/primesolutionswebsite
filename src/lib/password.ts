/**
 * Password rules for the owner account. Length is what matters most, so a passphrase is encouraged.
 * Returns a plain-language problem, or null when the password is acceptable.
 */
const COMMON = ["password", "passw0rd", "12345678", "123456789", "qwerty", "letmein", "welcome", "iloveyou", "admin", "prism", "abc123"];

export function passwordProblem(pw: string, email = ""): string | null {
  if (pw.length < 12) return "Use at least 12 characters. A short sentence of unrelated words works well.";
  if (pw.length > 128) return "That password is too long (128 characters at most).";
  if (new Set(pw).size < 6) return "Use a wider mix of characters.";
  const lower = pw.toLowerCase();
  if (COMMON.some((w) => lower.includes(w))) return "That is too easy to guess. Avoid common words such as “password”, “admin” or the company name.";
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (local.length >= 4 && lower.includes(local)) return "Do not include the name from your email address.";
  return null;
}

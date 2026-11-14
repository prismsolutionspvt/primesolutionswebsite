/**
 * Link audit of the RENDERED public site.   node scripts/link-audit.mjs [baseUrl]
 * Checks every <a> on the home page and the legal pages: in-page anchors have a target, mailto/tel are well-formed,
 * external links open safely (rel) and answer, no empty or placeholder hrefs, and every <button>/<a> has an accessible name.
 * Run against a running production server (npm run build && npm start).
 */
const base = (process.argv[2] ?? "http://localhost:5200").replace(/\/$/, "");
const pages = ["/", "/privacy", "/terms"];
const problems = [];
const notes = [];
const externals = new Map();

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"))?.slice(2).find((x) => x !== undefined);
const text = (html) => html.replace(/<svg[\s\S]*?<\/svg>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

for (const p of pages) {
  const res = await fetch(base + p);
  if (!res.ok) problems.push(`${p}: HTTP ${res.status}`);
  const html = await res.text();
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  let links = 0;
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    links++;
    const open = `<a${m[1]}>`;
    const href = attr(open, "href");
    const name = attr(open, "aria-label") || text(m[2]) || attr(m[2], "alt") || "";
    const where = `${p} › "${(name || "(no name)").slice(0, 40)}" → ${href}`;
    if (href === undefined || href === "" || href === "#") problems.push(`${where}: empty/placeholder link`);
    if (!name) problems.push(`${where}: link has no accessible name`);
    if (!href) continue;
    if (/^javascript:/i.test(href)) problems.push(`${where}: javascript: link`);
    else if (href.startsWith("mailto:")) {
      if (!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(href)) problems.push(`${where}: malformed mailto`);
    } else if (href.startsWith("tel:")) {
      if (!/^tel:\+?[\d]{6,}$/.test(href)) problems.push(`${where}: malformed tel`);
    } else if (/^https?:\/\//.test(href)) {
      externals.set(href, (externals.get(href) ?? 0) + 1);
      const rel = attr(open, "rel") ?? "";
      if (attr(open, "target") === "_blank" && !/noopener/.test(rel)) problems.push(`${where}: target=_blank without rel=noopener`);
    } else {
      const [path, hash] = href.split("#");
      if (path && path !== "/" && !pages.includes(path)) problems.push(`${where}: internal path that is not a page`);
      if (hash && (path === "" || path === "/" || path === p) && !ids.has(hash)) problems.push(`${where}: no element with id="${hash}"`);
    }
  }
  let buttons = 0;
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    buttons++;
    const open = `<button${m[1]}>`;
    if (!(attr(open, "aria-label") || attr(open, "aria-labelledby") || text(m[2]))) problems.push(`${p}: <button${(attr(open, "class") ?? "").slice(0, 40)}> has no accessible name`);
    if (!attr(open, "type")) notes.push(`${p}: a <button> without type (fine inside no <form>)`);
  }
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) if (attr(`<img${m[1]}>`, "alt") === undefined) problems.push(`${p}: <img> without alt`);
  console.log(`${p}: ${links} links, ${buttons} buttons checked`);
}

for (const [url, n] of externals) {
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (r.status === 405 || r.status === 403) r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    console.log(`external ${r.status} ${url} (×${n})`);
    if (!r.ok) problems.push(`external link ${url} answered ${r.status}`);
  } catch (e) {
    problems.push(`external link ${url} unreachable: ${e.message}`);
  }
}
if (notes.length) console.log(`notes: ${notes.length} (non-blocking)`);
console.log(problems.length ? `\n${problems.length} PROBLEM(S):\n- ${problems.join("\n- ")}` : "\nNo problems found.");
process.exit(problems.length ? 1 : 0);

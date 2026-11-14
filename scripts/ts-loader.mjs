/**
 * Loads TypeScript sources directly (no bundler) for the test suites, resolving the "@/" alias.
 * `import type` is erased; nothing is type-checked here (tsc does that).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cache = new Map();

function resolveFile(p) {
  for (const c of [p, `${p}.ts`, `${p}.tsx`, path.join(p, "index.ts")]) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  throw new Error(`cannot resolve ${p}`);
}

export function loadTs(file) {
  file = resolveFile(path.isAbsolute(file) ? file : path.join(root, file));
  if (cache.has(file)) return cache.get(file).exports;
  const out = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mod = { exports: {} };
  cache.set(file, mod);
  const req = (p) => (p.startsWith(".") ? loadTs(path.resolve(path.dirname(file), p)) : p.startsWith("@/") ? loadTs(path.join(root, "src", p.slice(2))) : require(p));
  new Function("require", "module", "exports", out)(req, mod, mod.exports);
  return mod.exports;
}

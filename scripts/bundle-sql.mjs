/**
 * Concatenates every migration (in order) plus the starter-content seed into ONE file you can paste into the
 * Supabase SQL editor:   npm run db:bundle   →   supabase/_bundle.sql   (git-ignored)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "supabase");
const parts = fs
  .readdirSync(path.join(root, "migrations"))
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => `-- ▼▼▼ migrations/${f}\n${fs.readFileSync(path.join(root, "migrations", f), "utf8")}`);
parts.push(`-- ▼▼▼ seed.sql\n${fs.readFileSync(path.join(root, "seed.sql"), "utf8")}`);
fs.writeFileSync(path.join(root, "_bundle.sql"), parts.join("\n\n"));
console.log(`Wrote supabase/_bundle.sql (${parts.length} parts)`);

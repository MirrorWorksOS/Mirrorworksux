#!/usr/bin/env node
/**
 * Validates docs/framer/module-pages-spec.json structure for the module pages plan.
 * Run: node scripts/validate-module-pages-spec.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const specPath = join(root, "docs", "framer", "module-pages-spec.json");

const spec = JSON.parse(readFileSync(specPath, "utf8"));

const errors = [];

if (!spec.framerTemplate?.path || spec.framerTemplate.path !== "/sell") {
  errors.push('framerTemplate.path must be "/sell"');
}
if (!spec.framerTemplate?.pageNodeId) {
  errors.push("framerTemplate.pageNodeId is required");
}

const expected = ["/plan", "/make", "/buy", "/ship", "/book", "/product-studio", "/bridge"];
const pages = spec.pagesToCreateFromTemplate;
if (!Array.isArray(pages) || pages.length !== expected.length) {
  errors.push(`pagesToCreateFromTemplate must have ${expected.length} entries`);
} else {
  for (const p of expected) {
    if (!pages.includes(p)) errors.push(`missing page ${p}`);
  }
}

if (!Array.isArray(spec.modules)) {
  errors.push("modules must be an array");
} else {
  for (const m of spec.modules) {
    if (!m.path) errors.push("module missing path");
    if (!m.hero) errors.push(`${m.path}: missing hero`);
    if (!Array.isArray(m.features) || m.features.length !== 6) {
      errors.push(`${m.path}: expected 6 features, got ${m.features?.length ?? 0}`);
    }
    if (!m.outro?.headline) errors.push(`${m.path}: missing outro.headline`);
    if (!m.recommendedHeroImage?.absolutePath) {
      errors.push(`${m.path}: missing recommendedHeroImage.absolutePath`);
    }
  }
}

if (errors.length) {
  console.error("Validation failed:\n", errors.join("\n"));
  process.exit(1);
}

console.log("module-pages-spec.json OK");
process.exit(0);

#!/usr/bin/env node
/**
 * Fails if Recharts / chart code uses raw hex colours or bypasses shared theme.
 * Run: npm run audit:charts
 *
 * Allowed: CSS variables (var(--...)), theme imports from chart-theme, MW_* tokens.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = [
  join(REPO_ROOT, "apps", "web", "src"),
  join(REPO_ROOT, "src"),
].find((candidate) => existsSync(candidate));

if (!ROOT) {
  console.error("audit-charts: could not locate source directory. Checked apps/web/src and src.");
  process.exit(1);
}

const SKIP_DIRS = new Set(["figma", "node_modules", "assets"]);

/** Hex in JSX/string props that should use tokens.
 * Ignore CSS attribute selectors such as `[stroke='#ccc']` inside className strings.
 */
const HEX_IN_CHART_PROPS =
  /(?<!\[)(?:fill|stroke|backgroundColor)\s*=\s*["'`]#([0-9A-Fa-f]{3,8})["'`]/g;

/** Inline style object with hex */
const HEX_IN_STYLE = /backgroundColor:\s*["']#([0-9A-Fa-f]{3,8})["']/g;

let failures = 0;

function walk(dir, rel = "") {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    const r = rel ? `${rel}/${name}` : name;
    if (st.isDirectory()) {
      walk(full, r);
    } else if (name.endsWith(".tsx") || name.endsWith(".ts")) {
      scan(full, r);
    }
  }
}

function scan(filePath, relPath) {
  const text = readFileSync(filePath, "utf8");
  if (!/from\s+["']recharts["']/.test(text)) {
    return;
  }
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("//") && line.trim().startsWith("//")) continue;
    HEX_IN_CHART_PROPS.lastIndex = 0;
    let m;
    while ((m = HEX_IN_CHART_PROPS.exec(line)) !== null) {
      console.error(`${relPath}:${i + 1}: hex in chart prop — use var(--*) or chart-theme (${m[0].slice(0, 40)}…)`);
      failures++;
    }
    HEX_IN_STYLE.lastIndex = 0;
    while ((m = HEX_IN_STYLE.exec(line)) !== null) {
      console.error(`${relPath}:${i + 1}: hex in style — use CSS variables (${m[0]})`);
      failures++;
    }
  }
}

walk(ROOT);

if (failures > 0) {
  console.error(`\naudit-charts: ${failures} issue(s). See chart-theme.ts and DesignSystem.md §9.`);
  process.exit(1);
}

console.log("audit-charts: no hex literals in chart fill/stroke (checked Recharts-related files).");

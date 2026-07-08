#!/usr/bin/env node
/**
 * Enforces the "SHA-pin GitHub Actions" rule from AGENTS.md: every third-party
 * action referenced by `uses:` in a workflow or composite action must be pinned
 * to the full 40-character commit SHA its tag resolves to, with a trailing
 * `# <version>` comment — e.g. `uses: actions/checkout@9c091bb… # v7.0.0`.
 * Mutable tags/branches are rejected so a re-pointed upstream tag cannot inject
 * code into CI. Local `./…` composite actions are skipped (in-repo, immutable).
 *
 * Recursively scans all `*.{yml,yaml}` files under `.github/workflows/**` and `.github/actions/**`,
 * runs the pure validator on each, and exits 1 with one line per offender;
 * otherwise exits 0. Uses only Node built-ins, so CI runs it with no install.
 */

import { readdirSync, readFileSync } from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";
import { findUnpinnedActionsInText } from "./lib/check-action-pins.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function isYaml(name) {
  return name.endsWith(".yml") || name.endsWith(".yaml");
}

// Collect every `*.{yml,yaml}` under a directory tree (recursively). Returns []
// if the directory does not exist.
function collectYaml(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectYaml(full);
    return entry.isFile() && isYaml(entry.name) ? [full] : [];
  });
}

const files = [
  ...collectYaml(join(root, ".github/workflows")),
  ...collectYaml(join(root, ".github/actions")),
];

const offenders = files.flatMap((file) =>
  findUnpinnedActionsInText(readFileSync(file, "utf8")).map((o) => ({
    ...o,
    file: relative(root, file),
  })),
);

if (offenders.length > 0) {
  console.error(
    `${offenders.length} GitHub Action reference(s) not SHA-pinned:`,
  );
  for (const { file, line, uses, reason } of offenders) {
    console.error(`  ${file}:${line}: ${uses} — ${reason}`);
  }
  console.error(
    "\nPin each external action to the full 40-character commit SHA its tag" +
      " resolves to, with a `# <version>` comment (e.g. `@9c091bb… # v7.0.0`).",
  );
  process.exit(1);
}

console.log("All GitHub Actions are pinned to commit SHAs.");

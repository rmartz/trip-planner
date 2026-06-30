#!/usr/bin/env node
/**
 * Enforces the "full version pin" rule from CLAUDE.md: every registry dependency
 * in package.json must specify a full major.minor.patch version, with an
 * optional `^`/`~` range annotation (e.g. `^4.1.13`, `~1.2.3`, or exact
 * `19.2.7`) — never a bare `^4` or `^4.1`. Non-registry specifiers
 * (workspace:, catalog:, file:, git+, github:, npm: aliases, http(s):) are
 * skipped.
 *
 * Reads the root package.json, runs the pure validator, and exits 1 with one
 * line per offender if any range is underspecified; otherwise exits 0.
 *
 * Uses only Node built-ins, so CI can run it without installing dependencies.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { findUnpinnedDependencies } from "./lib/check-package-pins.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = join(root, "package.json");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const offenders = findUnpinnedDependencies(pkg);

if (offenders.length > 0) {
  console.error(
    `package.json — ${offenders.length} dependency range(s) not fully pinned:`,
  );
  for (const { name, range } of offenders) {
    console.error(
      `  package.json: ${name} "${range}" — must pin full major.minor.patch (e.g. ^1.2.3)`,
    );
  }
  console.error(
    "\nPin each dependency to a full major.minor.patch version (a `^`/`~` range annotation is allowed).",
  );
  process.exit(1);
}

console.log("package.json — all dependency ranges are fully pinned");

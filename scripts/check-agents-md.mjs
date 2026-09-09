#!/usr/bin/env node
/**
 * Enforces the agent directive-file convention from AGENTS.md across the repo:
 *
 *   1. All directives live in AGENTS.md (the single source of truth).
 *   2. Every AGENTS.md has a companion CLAUDE.md in the same directory, and
 *      every CLAUDE.md has a companion AGENTS.md in the same directory.
 *   3. Every CLAUDE.md is a bare wrapper whose only content is the Claude Code
 *      import line `@AGENTS.md` — no directives, no other text, no symlinks.
 *
 * Walks the working tree (skipping vendored / build / VCS directories), builds a
 * descriptor per directory that contains a directive file, runs the pure
 * validator, and reports every violation. Exits 0 when the whole tree is
 * compliant, 1 when any violation is found.
 *
 * Uses only Node built-ins, so CI can run it without installing dependencies.
 */

import { lstatSync, readFileSync, readdirSync } from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";
import { directoryViolations } from "./lib/check-agents-md.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Directories that never contain first-party directive files: VCS internals and
// local worktrees (.git, .git-worktrees, .claude), plus vendored / build output.
const SKIP_DIRS = new Set([
  ".claude",
  ".git",
  ".git-worktrees",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "storybook-static",
]);

// Recursively collect the directories that contain an AGENTS.md or CLAUDE.md.
function collectDirs(dir, found) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectDirs(join(dir, entry.name), found);
    } else if (entry.name === "AGENTS.md" || entry.name === "CLAUDE.md") {
      found.add(dir);
    }
  }
  return found;
}

// True when `name` exists in `dir` (following the convention's lstat semantics:
// a symlink still counts as present so it can be flagged, not silently missed).
function existsInDir(dir, name) {
  try {
    lstatSync(join(dir, name));
    return true;
  } catch {
    return false;
  }
}

// Resolve how a directory's CLAUDE.md is stored on disk into the descriptor the
// pure validator consumes.
function resolveClaude(claudePath) {
  const stat = lstatSync(claudePath);
  const symlink = stat.isSymbolicLink();
  const file = stat.isFile();
  const content = !symlink && file ? readFileSync(claudePath, "utf8") : "";
  return { symlink, file, content };
}

const violations = [];
for (const dir of collectDirs(root, new Set())) {
  const rel = relative(root, dir) || ".";
  const hasAgents = existsInDir(dir, "AGENTS.md");
  const hasClaude = existsInDir(dir, "CLAUDE.md");
  const claude = hasClaude ? resolveClaude(join(dir, "CLAUDE.md")) : undefined;
  for (const violation of directoryViolations({
    hasAgents,
    hasClaude,
    claude,
  })) {
    violations.push(`${rel}: ${violation}`);
  }
}

if (violations.length > 0) {
  console.error("Agent directive-file convention violations:\n");
  for (const violation of violations) console.error(`  ✗ ${violation}`);
  console.error(
    `\n${violations.length} violation(s). Fix them so that every AGENTS.md has a` +
      " companion CLAUDE.md whose only content is `@AGENTS.md`.",
  );
  process.exit(1);
}

console.log("All AGENTS.md / CLAUDE.md pairs are compliant.");

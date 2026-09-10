#!/usr/bin/env node
/**
 * Enforces the docs/ OKF conventions across the repository:
 *
 *   1. Frontmatter — every non-reserved `*.md` under docs/ carries fenced
 *      frontmatter (opening and closing `---`) with a non-empty `type` scalar.
 *      The check validates structural presence only — it does not parse YAML.
 *      `index.md` is exempt from the `type` rule (OKF §8) and instead must
 *      carry no frontmatter beyond an optional bundle-root `okf_version`.
 *   2. Navigability — every content page is listed in its directory's index.md,
 *      and every subdirectory's index.md is linked from its parent's index.md,
 *      so a reader can walk index.md -> sub/index.md -> sub/page.md.
 *
 * Walks the docs/ tree, reads each index.md's markdown links (resolving them to
 * docs-root-relative paths), runs the pure validators, and reports every
 * violation. Exits 0 when compliant, 1 otherwise.
 *
 * Uses only Node built-ins, so CI can run it without installing dependencies.
 */

import { readFileSync, readdirSync } from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";
import {
  INDEX_FILE,
  NON_CONTENT_FILES,
  extractLinkTargets,
  frontmatterError,
  indexFrontmatterError,
  navigationViolations,
} from "./lib/check-docs.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "docs");

// A docs-root-relative posix path for an absolute path inside docs/.
const toRel = (abs) => relative(docsRoot, abs).replaceAll("\\", "/");

// Join docs-root-relative path segments, dropping the empty root segment.
const relJoin = (...parts) => parts.filter((part) => part !== "").join("/");

const mdFilesIn = (absDir) =>
  readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();

const subdirsIn = (absDir) =>
  readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

// A directory "has content" if its subtree holds any non-reserved content page.
function hasContent(absDir) {
  if (mdFilesIn(absDir).some((name) => !NON_CONTENT_FILES.has(name)))
    return true;
  return subdirsIn(absDir).some((name) => hasContent(join(absDir, name)));
}

// Every directory under docsRoot (including docsRoot), depth-first and sorted.
function walkDirs(absDir, acc) {
  acc.push(absDir);
  for (const name of subdirsIn(absDir)) walkDirs(join(absDir, name), acc);
  return acc;
}

// Resolve an index.md's markdown links to the set of docs-root-relative paths
// they point at, dropping external links, anchors, and targets outside docs/.
function resolveLinks(markdown, absDir) {
  const links = new Set();
  for (const rawTarget of extractLinkTargets(markdown)) {
    const target = rawTarget.split("#")[0].trim();
    if (target === "" || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    const abs = target.startsWith("/")
      ? join(docsRoot, target.slice(1))
      : join(absDir, target);
    const rel = toRel(abs);
    if (rel !== "" && !rel.startsWith("..")) links.add(rel);
  }
  return [...links];
}

const allDirs = walkDirs(docsRoot, []);

// Rule 1: frontmatter on every non-reserved page (README.md is a general-doc
// landing file and is exempt). An `index.md` is validated by the §8 rule
// (no frontmatter beyond an optional bundle-root `okf_version`) instead of the
// `type` rule that governs content pages.
const frontmatterViolations = [];
for (const absDir of allDirs) {
  for (const name of mdFilesIn(absDir)) {
    if (name === "README.md") continue;
    const abs = join(absDir, name);
    const content = readFileSync(abs, "utf8");
    const error =
      name === INDEX_FILE
        ? indexFrontmatterError(content, absDir === docsRoot)
        : frontmatterError(content);
    if (error) frontmatterViolations.push(`docs/${toRel(abs)}: ${error}`);
  }
}

// Rule 2: per-directory index navigability, for every directory with content.
const descriptors = [];
for (const absDir of allDirs) {
  if (!hasContent(absDir)) continue;
  const rel = toRel(absDir);
  const names = mdFilesIn(absDir);
  const hasIndex = names.includes(INDEX_FILE);
  descriptors.push({
    rel,
    hasIndex,
    contentFiles: names
      .filter((name) => !NON_CONTENT_FILES.has(name))
      .map((name) => relJoin(rel, name)),
    childIndexes: subdirsIn(absDir)
      .filter((name) => hasContent(join(absDir, name)))
      .map((name) => relJoin(rel, name, INDEX_FILE)),
    indexLinks: hasIndex
      ? resolveLinks(readFileSync(join(absDir, INDEX_FILE), "utf8"), absDir)
      : [],
  });
}

const violations = [
  ...frontmatterViolations,
  ...navigationViolations(descriptors),
];

if (violations.length > 0) {
  console.error("docs/ OKF convention violations:\n");
  for (const violation of violations) console.error(`  ✗ ${violation}`);
  console.error(
    `\n${violations.length} violation(s). Every docs/ page needs OKF frontmatter with a` +
      ` non-empty \`type\`, and must be reachable from docs/index.md through` +
      ` per-directory index.md files.`,
  );
  process.exit(1);
}

console.log("docs/ frontmatter and index navigation are compliant.");

// Pure, dependency-free validation for the docs/ OKF conventions enforced by
// the Docs structure CI check. Two independent rule groups:
//
//   1. Frontmatter — every non-reserved `*.md` under docs/ carries fenced
//      frontmatter (opening and closing `---`) with a non-empty `type` scalar
//      (OKF SPEC §3.1). The check validates structural presence only — it does
//      not parse YAML, so structurally malformed YAML that contains a `type`
//      scalar will pass.
//   2. Navigability — every content page is listed in its directory's index.md,
//      and every subdirectory's index.md is linked from its parent's index.md,
//      so a reader can walk index.md -> sub/index.md -> sub/page.md (OKF §8).
//
// `index.md` and `log.md` are OKF-reserved filenames; `README.md` is treated as
// a general-documentation landing file. All three are exempt from the
// navigability "must be listed" rule. Only `README.md` is exempt from the
// frontmatter rule — the repo convention gives index.md/log.md a `type` too.
//
// The filesystem walk and link resolution live in the CLI wrapper
// (scripts/check-docs.mjs); this module holds the pure decision logic so it can
// be unit-tested from src/ci/check-docs.spec.ts without touching disk.

// OKF-reserved index and log filenames.
export const INDEX_FILE = "index.md";
export const LOG_FILE = "log.md";

// Files that are never "content pages" to be listed in an index: the index
// itself, the reserved change log, and a general-documentation README.
export const NON_CONTENT_FILES = new Set([INDEX_FILE, LOG_FILE, "README.md"]);

// Returns an error string when `content` lacks a well-formed OKF frontmatter
// block with a non-empty `type`, or undefined when it is conformant.
export function frontmatterError(content) {
  const lines = content.split("\n");
  if (lines[0].trim() !== "---") {
    return "missing YAML frontmatter block (must open with `---`)";
  }
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (end === -1) {
    return "frontmatter block is not closed with `---`";
  }
  const typeLine = lines.slice(1, end).find((line) => /^type:\s*/.test(line));
  if (!typeLine) {
    return "frontmatter is missing a `type` field";
  }
  const value = typeLine
    .replace(/^type:\s*/, "")
    .replace(/\s+#.*$/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (value.length === 0) {
    return "frontmatter `type` field is empty";
  }
  return undefined;
}

// Extracts the target of every inline markdown link `[text](target)`, dropping
// an optional `"title"` suffix. Strips fenced code blocks (triple-backtick or
// triple-tilde) before scanning so links inside code examples are not counted
// as real navigability links. Returns raw targets; the caller resolves them.
export function extractLinkTargets(markdown) {
  const stripped = markdown.replace(
    /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm,
    "",
  );
  const targets = [];
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(stripped)) !== null) {
    const raw = match[1].trim();
    const spaceIndex = raw.indexOf(" ");
    targets.push(spaceIndex === -1 ? raw : raw.slice(0, spaceIndex));
  }
  return targets;
}

// Given a descriptor per directory in the docs tree, returns the navigability
// violations. Each descriptor carries docs-root-relative posix paths:
//   rel          — the directory ("" for the docs root)
//   hasIndex     — whether an index.md exists in the directory
//   contentFiles — content pages in the directory that must be listed
//   childIndexes — index.md of each subdirectory that itself has content
//   indexLinks   — targets the directory's index.md links to (resolved, in-tree)
export function navigationViolations(dirs) {
  const violations = [];
  for (const {
    rel,
    hasIndex,
    contentFiles,
    childIndexes,
    indexLinks,
  } of dirs) {
    const dirLabel = rel === "" ? "docs" : `docs/${rel}`;
    if (!hasIndex) {
      violations.push(
        `${dirLabel}: has content (pages or subdirectory indexes) but no ${INDEX_FILE}`,
      );
      continue;
    }
    const indexLabel = `${dirLabel}/${INDEX_FILE}`;
    const linked = new Set(indexLinks);
    for (const contentFile of contentFiles) {
      if (!linked.has(contentFile)) {
        violations.push(
          `${indexLabel}: does not link content page ${contentFile}`,
        );
      }
    }
    for (const childIndex of childIndexes) {
      if (!linked.has(childIndex)) {
        violations.push(
          `${indexLabel}: does not link child index ${childIndex}`,
        );
      }
    }
  }
  return violations;
}

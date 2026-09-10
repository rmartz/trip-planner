import { describe, expect, it } from "vitest";
// The docs check is plain ESM (.mjs) so CI can run it with only Node built-ins
// (no pnpm install). This spec imports that same module directly so the
// frontmatter, link-extraction, and navigability logic is verified under
// TypeScript tooling.
import {
  extractLinkTargets,
  frontmatterError,
  indexFrontmatterError,
  navigationViolations,
} from "../../scripts/lib/check-docs.mjs";

describe("frontmatterError — valid frontmatter passes", () => {
  it("accepts a block with a non-empty type field", () => {
    expect(
      frontmatterError("---\ntype: Script\ntitle: x\n---\n\nBody"),
    ).toBeUndefined();
  });

  it("ignores a trailing YAML comment on the type value", () => {
    expect(
      frontmatterError("---\ntype: Index # the index\n---\n"),
    ).toBeUndefined();
  });
});

describe("frontmatterError — missing frontmatter fails", () => {
  it("flags a file that does not open with a --- fence", () => {
    expect(frontmatterError("# Heading\n\ntype: Script\n")).toBeDefined();
  });
});

describe("frontmatterError — missing or empty type fails", () => {
  it("flags a frontmatter block with no type field", () => {
    expect(
      frontmatterError("---\ntitle: x\ndescription: y\n---\n"),
    ).toBeDefined();
  });

  it("flags a frontmatter block whose type is empty", () => {
    expect(frontmatterError("---\ntype:\n---\n")).toBeDefined();
  });
});

describe("indexFrontmatterError — an index with no frontmatter passes", () => {
  it("accepts a nested index that opens straight into its body", () => {
    expect(
      indexFrontmatterError("# Scripts\n\n- [check-docs](check-docs.md)\n"),
    ).toBeUndefined();
  });
});

describe("indexFrontmatterError — an okf_version-only block passes", () => {
  it("accepts a bundle-root index carrying only okf_version", () => {
    expect(
      indexFrontmatterError(
        '---\nokf_version: "0.2"\n---\n\n# Documentation\n',
      ),
    ).toBeUndefined();
  });
});

describe("indexFrontmatterError — disallowed keys fail", () => {
  it("flags a type/title/description/timestamp block on an index", () => {
    const error = indexFrontmatterError(
      "---\ntype: Index\ntitle: Scripts\ndescription: y\ntimestamp: 2026-09-08\n---\n",
    );

    expect(error).toBeDefined();
    expect(error).toContain("type");
    expect(error).toContain("title");
  });

  it("flags an okf_version block that also carries a second key", () => {
    expect(
      indexFrontmatterError('---\nokf_version: "0.2"\ntitle: Scripts\n---\n'),
    ).toBeDefined();
  });
});

describe("indexFrontmatterError — an unclosed block fails", () => {
  it("flags an index whose frontmatter fence is never closed", () => {
    expect(
      indexFrontmatterError("---\nokf_version: 0.2\n\n# Documentation\n"),
    ).toBeDefined();
  });
});

describe("extractLinkTargets — parses inline links", () => {
  it("returns targets and drops an optional link title", () => {
    const targets = extractLinkTargets(
      'See [a](scripts/index.md) and [b](systems/x.md "title").',
    );

    expect(targets).toEqual(["scripts/index.md", "systems/x.md"]);
  });

  it("ignores links inside fenced code blocks", () => {
    const markdown = [
      "Real link: [page](scripts/check-docs.md)",
      "",
      "```markdown",
      "Example link: [see also](systems/index.md)",
      "```",
      "",
      "~~~",
      "Another example: [other](scripts/index.md)",
      "~~~",
    ].join("\n");

    expect(extractLinkTargets(markdown)).toEqual(["scripts/check-docs.md"]);
  });
});

describe("navigationViolations — compliant tree passes", () => {
  it("returns no violations when the index links every page and child index", () => {
    const violations = navigationViolations([
      {
        rel: "",
        hasIndex: true,
        contentFiles: [],
        childIndexes: ["scripts/index.md"],
        indexLinks: ["scripts/index.md"],
      },
      {
        rel: "scripts",
        hasIndex: true,
        contentFiles: ["scripts/check-docs.md"],
        childIndexes: [],
        indexLinks: ["scripts/check-docs.md"],
      },
    ]);

    expect(violations).toEqual([]);
  });
});

describe("navigationViolations — missing index fails", () => {
  it("flags a directory that has content but no index.md", () => {
    const violations = navigationViolations([
      {
        rel: "scripts",
        hasIndex: false,
        contentFiles: ["scripts/x.md"],
        childIndexes: [],
        indexLinks: [],
      },
    ]);

    expect(violations).toEqual([
      "docs/scripts: has content (pages or subdirectory indexes) but no index.md",
    ]);
  });
});

describe("navigationViolations — unlisted page fails", () => {
  it("flags a content page the directory index does not link", () => {
    const violations = navigationViolations([
      {
        rel: "scripts",
        hasIndex: true,
        contentFiles: ["scripts/x.md", "scripts/y.md"],
        childIndexes: [],
        indexLinks: ["scripts/x.md"],
      },
    ]);

    expect(violations).toEqual([
      "docs/scripts/index.md: does not link content page scripts/y.md",
    ]);
  });
});

describe("navigationViolations — unlinked child index fails", () => {
  it("flags a child directory index the parent index does not link", () => {
    const violations = navigationViolations([
      {
        rel: "",
        hasIndex: true,
        contentFiles: [],
        childIndexes: ["scripts/index.md", "systems/index.md"],
        indexLinks: ["scripts/index.md"],
      },
    ]);

    expect(violations).toEqual([
      "docs/index.md: does not link child index systems/index.md",
    ]);
  });
});

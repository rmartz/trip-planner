import { describe, expect, it } from "vitest";
// The docs check is plain ESM (.mjs) so CI can run it with only Node built-ins
// (no pnpm install). This spec imports that same module directly so the
// frontmatter, link-extraction, and navigability logic is verified under
// TypeScript tooling.
import {
  extractLinkTargets,
  frontmatterError,
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

describe("extractLinkTargets — parses inline links", () => {
  it("returns targets and drops an optional link title", () => {
    const targets = extractLinkTargets(
      'See [a](scripts/index.md) and [b](systems/x.md "title").',
    );

    expect(targets).toEqual(["scripts/index.md", "systems/x.md"]);
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
      "docs/scripts: has content pages but no index.md",
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

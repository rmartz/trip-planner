import { describe, expect, it } from "vitest";
// The pins check is plain ESM (.mjs) so CI can run it with only Node built-ins
// (no pnpm install). This spec imports that same module directly so the
// exact major.minor.patch detection logic is verified under TypeScript tooling.
import { findUnpinnedDependencies } from "../../scripts/lib/check-package-pins.mjs";

describe("findUnpinnedDependencies — exact pins pass", () => {
  it("accepts exact and prerelease pins with no range operator", () => {
    const pkg = {
      dependencies: {
        "exact-full": "19.2.7",
        "prerelease-full": "1.2.3-rc.1",
      },
    };

    expect(findUnpinnedDependencies(pkg)).toEqual([]);
  });
});

describe("findUnpinnedDependencies — caret range fails", () => {
  it("flags a caret range even with a full major.minor.patch base", () => {
    const pkg = { dependencies: { "caret-full": "^4.3.1" } };

    expect(findUnpinnedDependencies(pkg)).toEqual([
      { name: "caret-full", range: "^4.3.1" },
    ]);
  });
});

describe("findUnpinnedDependencies — tilde range fails", () => {
  it("flags a tilde range even with a full major.minor.patch base", () => {
    const pkg = { devDependencies: { "tilde-full": "~1.2.3" } };

    expect(findUnpinnedDependencies(pkg)).toEqual([
      { name: "tilde-full", range: "~1.2.3" },
    ]);
  });
});

describe("findUnpinnedDependencies — abbreviated version fails", () => {
  it("flags a version missing the patch component", () => {
    const pkg = { dependencies: { "major-minor": "4.1" } };

    expect(findUnpinnedDependencies(pkg)).toEqual([
      { name: "major-minor", range: "4.1" },
    ]);
  });
});

describe("findUnpinnedDependencies — non-registry specifiers skipped", () => {
  it("ignores workspace, file, github, and catalog specifiers", () => {
    const pkg = {
      dependencies: {
        "ws-dep": "workspace:*",
        "file-dep": "file:../x",
        "gh-dep": "github:o/r",
        "catalog-dep": "catalog:",
      },
    };

    expect(findUnpinnedDependencies(pkg)).toEqual([]);
  });
});

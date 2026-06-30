import { describe, expect, it } from "vitest";
// The pins check is plain ESM (.mjs) so CI can run it with only Node built-ins
// (no pnpm install). This spec imports that same module directly so the
// full-major.minor.patch detection logic is verified under TypeScript tooling.
import { findUnpinnedDependencies } from "../../scripts/lib/check-package-pins.mjs";

describe("findUnpinnedDependencies — full pins pass", () => {
  it("accepts caret, tilde, exact, and prerelease full pins", () => {
    const pkg = {
      dependencies: {
        "caret-full": "^4.3.1",
        "exact-full": "19.2.7",
        "tilde-full": "~1.2.3",
        "prerelease-full": "^1.2.3-rc.1",
      },
    };

    expect(findUnpinnedDependencies(pkg)).toEqual([]);
  });
});

describe("findUnpinnedDependencies — bare major fails", () => {
  it("flags a caret range with only a major version", () => {
    const pkg = { dependencies: { "bare-major": "^4" } };

    expect(findUnpinnedDependencies(pkg)).toEqual([
      { name: "bare-major", range: "^4" },
    ]);
  });
});

describe("findUnpinnedDependencies — major.minor fails", () => {
  it("flags a caret range missing the patch version", () => {
    const pkg = { devDependencies: { "major-minor": "^4.1" } };

    expect(findUnpinnedDependencies(pkg)).toEqual([
      { name: "major-minor", range: "^4.1" },
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

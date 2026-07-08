import { describe, expect, it } from "vitest";
// The pins check is plain ESM (.mjs) so CI can run it with only Node built-ins
// (no pnpm install). This spec imports that same module directly so the
// SHA-pin detection logic is verified under TypeScript tooling.
import { findUnpinnedActionsInText } from "../../scripts/lib/check-action-pins.mjs";

const SHA = "9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0";

describe("findUnpinnedActionsInText — SHA-pinned refs pass", () => {
  it("accepts a full commit SHA with a version comment", () => {
    const yaml = `      - uses: actions/checkout@${SHA} # v7.0.0`;
    expect(findUnpinnedActionsInText(yaml)).toEqual([]);
  });

  it("accepts a reusable-workflow ref pinned by SHA with a comment", () => {
    const yaml = `      uses: owner/repo/.github/workflows/x.yml@${SHA} # v1.2.3`;
    expect(findUnpinnedActionsInText(yaml)).toEqual([]);
  });

  it("accepts a full semver without the v prefix and with a prerelease", () => {
    const noV = `      - uses: a/b@${SHA} # 1.2.3`;
    const prerelease = `      - uses: a/b@${SHA} # v1.2.3-rc.1`;
    expect(findUnpinnedActionsInText(noV)).toEqual([]);
    expect(findUnpinnedActionsInText(prerelease)).toEqual([]);
  });
});

describe("findUnpinnedActionsInText — local and docker refs are skipped", () => {
  it("skips a local composite action", () => {
    const yaml = `      - uses: ./.github/actions/setup`;
    expect(findUnpinnedActionsInText(yaml)).toEqual([]);
  });

  it("skips a docker ref", () => {
    const yaml = `      - uses: docker://alpine:3.20`;
    expect(findUnpinnedActionsInText(yaml)).toEqual([]);
  });
});

describe("findUnpinnedActionsInText — mutable refs fail", () => {
  it("flags a major tag", () => {
    const yaml = `      - uses: actions/checkout@v7`;
    const offenders = findUnpinnedActionsInText(yaml);
    expect(offenders).toHaveLength(1);
    expect(offenders[0]).toMatchObject({
      line: 1,
      uses: "actions/checkout@v7",
    });
    expect(offenders[0]?.reason).toContain("commit SHA");
  });

  it("flags a full semver tag", () => {
    const yaml = `      - uses: pnpm/action-setup@v5.0.0`;
    expect(findUnpinnedActionsInText(yaml)).toHaveLength(1);
  });

  it("flags a branch ref", () => {
    const yaml = `      - uses: some/action@main`;
    expect(findUnpinnedActionsInText(yaml)).toHaveLength(1);
  });

  it("flags an external action with no ref at all", () => {
    const yaml = `      - uses: some/action`;
    expect(findUnpinnedActionsInText(yaml)).toHaveLength(1);
  });
});

describe("findUnpinnedActionsInText — the version comment is required and must be semver", () => {
  it("flags a SHA pin with no trailing comment", () => {
    const yaml = `      - uses: actions/checkout@${SHA}`;
    const offenders = findUnpinnedActionsInText(yaml);
    expect(offenders).toHaveLength(1);
    expect(offenders[0]?.reason).toContain("comment");
  });

  it("flags a non-version comment (Dependabot cannot parse a version from it)", () => {
    const yaml = `      - uses: actions/checkout@${SHA} # pinned upstream`;
    const offenders = findUnpinnedActionsInText(yaml);
    expect(offenders).toHaveLength(1);
    expect(offenders[0]?.reason).toContain("semver");
  });

  it("flags a partial version comment (`v7` / `v7.0`) — full major.minor.patch required", () => {
    const major = `      - uses: actions/checkout@${SHA} # v7`;
    const majorMinor = `      - uses: actions/checkout@${SHA} # v7.0`;
    expect(findUnpinnedActionsInText(major)).toHaveLength(1);
    expect(findUnpinnedActionsInText(majorMinor)).toHaveLength(1);
  });
});

describe("findUnpinnedActionsInText — reports the correct line across a file", () => {
  it("reports the 1-indexed line of the offending ref", () => {
    const yaml = [
      "jobs:",
      "  build:",
      "    steps:",
      `      - uses: actions/checkout@${SHA} # v7.0.0`,
      "      - uses: some/action@v1",
    ].join("\n");
    const offenders = findUnpinnedActionsInText(yaml);
    expect(offenders).toHaveLength(1);
    expect(offenders[0]).toMatchObject({ line: 5, uses: "some/action@v1" });
  });
});

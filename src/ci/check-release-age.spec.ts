import { describe, expect, it } from "vitest";
// The release-age gate is plain ESM (.mjs) so CI can run it with only Node
// built-ins (no pnpm install). This spec imports the parser helpers directly so
// their behavior is verified under TypeScript tooling.
import {
  lockedPackages,
  parseKey,
} from "../../scripts/lib/check-release-age.mjs";

// Minimal pnpm v9 lockfile with a `packages:` block and a `snapshots:` block.
// Only entries under `packages:` should be returned; `snapshots:` entries that
// carry peer-dep suffixes must be excluded.
const SAMPLE_LOCKFILE = `\
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true

packages:

  lodash@4.17.21:

  react@18.3.1:

  'react-dom@18.3.1':

  '@scope/pkg@1.0.0':

snapshots:

  react@18.3.1(react-dom@18.3.1):
`;

describe("lockedPackages — packages block", () => {
  it("returns an entry for each key in the packages block", () => {
    const result = lockedPackages(SAMPLE_LOCKFILE);
    expect(result.has("lodash@4.17.21")).toBe(true);
    expect(result.has("react@18.3.1")).toBe(true);
    expect(result.has("@scope/pkg@1.0.0")).toBe(true);
  });

  it("strips surrounding quotes from quoted keys", () => {
    const result = lockedPackages(SAMPLE_LOCKFILE);
    expect(result.has("react-dom@18.3.1")).toBe(true);
    expect(result.has("'react-dom@18.3.1'")).toBe(false);
  });

  it("excludes entries from the snapshots block", () => {
    const result = lockedPackages(SAMPLE_LOCKFILE);
    expect(result.has("react@18.3.1(react-dom@18.3.1)")).toBe(false);
  });

  it("returns an empty set for text with no packages block", () => {
    const result = lockedPackages("lockfileVersion: '9.0'\n");
    expect(result.size).toBe(0);
  });
});

describe("parseKey — valid semver versions", () => {
  it("parses a plain name@version key", () => {
    expect(parseKey("lodash@4.17.21")).toEqual({
      name: "lodash",
      version: "4.17.21",
    });
  });

  it("parses a scoped package key", () => {
    expect(parseKey("@scope/pkg@1.0.0")).toEqual({
      name: "@scope/pkg",
      version: "1.0.0",
    });
  });

  it("accepts a version with a prerelease segment", () => {
    expect(parseKey("pkg@1.0.0-rc.1")).toEqual({
      name: "pkg",
      version: "1.0.0-rc.1",
    });
  });

  it("accepts a version with a build-metadata segment", () => {
    expect(parseKey("pkg@1.0.0+build.1")).toEqual({
      name: "pkg",
      version: "1.0.0+build.1",
    });
  });

  it("accepts a version with both prerelease and build-metadata segments", () => {
    expect(parseKey("pkg@1.2.3-rc.1+build.5")).toEqual({
      name: "pkg",
      version: "1.2.3-rc.1+build.5",
    });
  });
});

describe("parseKey — non-semver and invalid keys", () => {
  it("returns undefined for a workspace specifier", () => {
    expect(parseKey("pkg@workspace:*")).toBeUndefined();
  });

  it("returns undefined for a tarball URL specifier", () => {
    expect(parseKey("pkg@https://example.com/pkg.tgz")).toBeUndefined();
  });

  it("returns undefined for a key with no @ separator", () => {
    expect(parseKey("nodash")).toBeUndefined();
  });

  it("returns undefined for a bare scoped name with no version", () => {
    expect(parseKey("@scope/pkg")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
// The gate helper is plain ESM (.mjs) so the Vercel Ignored Build Step can run it
// with only Node built-ins. This spec imports that same module directly so the
// production-only build decision is verified under TypeScript tooling.
import { shouldBuildForEnv } from "../../scripts/lib/vercel-ignore-build.mjs";

describe("shouldBuildForEnv — only production deploys build", () => {
  it("returns true for a production deploy", () => {
    expect(shouldBuildForEnv("production")).toBe(true);
  });

  it("returns false for a preview deploy (previews are label-gated)", () => {
    expect(shouldBuildForEnv("preview")).toBe(false);
  });

  it("returns false for a development environment", () => {
    expect(shouldBuildForEnv("development")).toBe(false);
  });

  it("returns false when the environment is unset", () => {
    expect(shouldBuildForEnv(undefined)).toBe(false);
  });

  it("returns false for an unrecognized environment", () => {
    expect(shouldBuildForEnv("staging")).toBe(false);
  });
});

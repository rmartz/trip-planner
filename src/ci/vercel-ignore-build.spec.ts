import { describe, expect, it } from "vitest";
// The gate helper is plain ESM (.mjs) so the Vercel Ignored Build Step can run it
// with only Node built-ins. This spec imports that same module directly so the
// feat/fix title detection is verified under TypeScript tooling.
import { shouldDeployForTitle } from "../../scripts/lib/vercel-ignore-build.mjs";

describe("shouldDeployForTitle — feat/fix titles deploy", () => {
  it("returns true for a plain feat title", () => {
    expect(shouldDeployForTitle("feat: add lodging map")).toBe(true);
  });

  it("returns true for a plain fix title", () => {
    expect(shouldDeployForTitle("fix: correct timezone offset")).toBe(true);
  });

  it("returns true for a scoped feat title", () => {
    expect(shouldDeployForTitle("feat(scope): add panel")).toBe(true);
  });

  it("returns true for a scoped fix title", () => {
    expect(shouldDeployForTitle("fix(api): handle 404")).toBe(true);
  });

  it("returns true for a breaking feat title", () => {
    expect(shouldDeployForTitle("feat!: drop legacy auth")).toBe(true);
  });

  it("returns true for a scoped breaking feat title", () => {
    expect(shouldDeployForTitle("feat(scope)!: drop legacy auth")).toBe(true);
  });
});

describe("shouldDeployForTitle — non-feat/fix titles skip", () => {
  it("returns false for a chore title", () => {
    expect(shouldDeployForTitle("chore: bump deps")).toBe(false);
  });

  it("returns false for a docs title", () => {
    expect(shouldDeployForTitle("docs: update readme")).toBe(false);
  });

  it("returns false for a refactor title", () => {
    expect(shouldDeployForTitle("refactor: extract helper")).toBe(false);
  });

  it("returns false for a ci title", () => {
    expect(shouldDeployForTitle("ci: gate preview deploys")).toBe(false);
  });

  it("returns false for a test title", () => {
    expect(shouldDeployForTitle("test: add spec")).toBe(false);
  });

  it("returns false for a non-conventional title", () => {
    expect(shouldDeployForTitle("Update stuff")).toBe(false);
  });
});

describe("shouldDeployForTitle — match is case-sensitive", () => {
  it("returns false for a capitalized Feat title", () => {
    expect(shouldDeployForTitle("Feat: add panel")).toBe(false);
  });

  it("returns false for an uppercase FIX title", () => {
    expect(shouldDeployForTitle("FIX: correct offset")).toBe(false);
  });
});

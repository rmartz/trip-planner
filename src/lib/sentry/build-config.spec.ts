import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getSentryBuildOptions } from "./build-config";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe("getSentryBuildOptions — source maps not served publicly", () => {
  it("sets hideSourceMaps to true", () => {
    expect(getSentryBuildOptions().hideSourceMaps).toBe(true);
  });
});

describe("getSentryBuildOptions — upload gated on SENTRY_AUTH_TOKEN", () => {
  it("passes authToken from SENTRY_AUTH_TOKEN when set", () => {
    process.env["SENTRY_AUTH_TOKEN"] = "sntryu_test-token";
    expect(getSentryBuildOptions().authToken).toBe("sntryu_test-token");
  });

  it("authToken is undefined when SENTRY_AUTH_TOKEN is not set", () => {
    delete process.env["SENTRY_AUTH_TOKEN"];
    expect(getSentryBuildOptions().authToken).toBeUndefined();
  });
});

describe("getSentryBuildOptions — reads org and project from env", () => {
  it("passes SENTRY_ORG to org", () => {
    process.env["SENTRY_ORG"] = "reedmartz";
    expect(getSentryBuildOptions().org).toBe("reedmartz");
  });

  it("passes SENTRY_PROJECT to project", () => {
    process.env["SENTRY_PROJECT"] = "trip-planner";
    expect(getSentryBuildOptions().project).toBe("trip-planner");
  });
});

describe("getSentryBuildOptions — widens source file coverage", () => {
  it("sets widenClientFileUpload to true for complete stack traces", () => {
    expect(getSentryBuildOptions().widenClientFileUpload).toBe(true);
  });
});

describe("getSentryBuildOptions — release version for commit tracking", () => {
  it("passes SENTRY_RELEASE as the release name when set", () => {
    process.env["SENTRY_RELEASE"] = "abc1234def5678";
    expect(getSentryBuildOptions().release).toEqual({ name: "abc1234def5678" });
  });

  it("release is undefined when SENTRY_RELEASE is not set", () => {
    delete process.env["SENTRY_RELEASE"];
    expect(getSentryBuildOptions().release).toBeUndefined();
  });
});

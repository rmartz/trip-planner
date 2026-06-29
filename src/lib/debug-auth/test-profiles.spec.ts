import { describe, expect, it } from "vitest";
import {
  hasSyntheticPrefix,
  isEligibleTestUid,
  SYNTHETIC_UID_PREFIX,
  TEST_PROFILE_UIDS,
  TEST_PROFILES,
} from "./test-profiles";

describe("test profiles use the reserved synthetic prefix", () => {
  it("uses 'synthetic:' as the reserved prefix", () => {
    expect(SYNTHETIC_UID_PREFIX).toBe("synthetic:");
  });

  it("gives every seeded profile a synthetic-prefixed uid", () => {
    expect(TEST_PROFILES.every((profile) => hasSyntheticPrefix(profile.uid)));
    expect(TEST_PROFILES.length).toBeGreaterThan(0);
    for (const profile of TEST_PROFILES) {
      expect(profile.uid.startsWith(SYNTHETIC_UID_PREFIX)).toBe(true);
    }
  });

  it("gives every seeded profile a display name and email", () => {
    for (const profile of TEST_PROFILES) {
      expect(profile.displayName.length).toBeGreaterThan(0);
      expect(profile.email.length).toBeGreaterThan(0);
    }
  });
});

describe("hasSyntheticPrefix distinguishes synthetic uids from real ones", () => {
  it("returns false for a real 28-char Firebase uid", () => {
    expect(hasSyntheticPrefix("aRealFirebaseUid000000000001")).toBe(false);
  });

  it("returns true for a synthetic-prefixed uid", () => {
    expect(hasSyntheticPrefix("synthetic:anything")).toBe(true);
  });
});

describe("isEligibleTestUid requires both prefix and allowlist membership", () => {
  it("returns true for a seeded synthetic uid", () => {
    expect(isEligibleTestUid(TEST_PROFILE_UIDS[0] ?? "")).toBe(true);
  });

  it("returns false for a synthetic uid not in the allowlist", () => {
    expect(isEligibleTestUid("synthetic:intruder")).toBe(false);
  });

  it("returns false for a real uid", () => {
    expect(isEligibleTestUid("aRealFirebaseUid000000000001")).toBe(false);
  });
});

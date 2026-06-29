import testProfilesData from "./test-profiles.json";

/**
 * A synthetic user profile used only by the staging/preview debug-auth mode.
 *
 * The canonical list lives in `test-profiles.json` so that the `.mjs` seed
 * script (which cannot import `@/`-aliased TypeScript) and the TypeScript app
 * code read from a single source of truth. The seed script imports the same
 * JSON by relative path, so the uids and allowlist can never drift apart.
 */
export interface TestProfile {
  uid: string;
  displayName: string;
  email: string;
}

/**
 * The reserved uid prefix that marks a uid as synthetic. Firebase-generated
 * real uids are 28-character random strings that never contain a colon and we
 * never assign custom uids in production, so a real user's uid can never match
 * this prefix.
 */
export const SYNTHETIC_UID_PREFIX: string = testProfilesData.reservedPrefix;

export const TEST_PROFILES: readonly TestProfile[] = testProfilesData.profiles;

/** The allowlist of uids eligible for impersonation. */
export const TEST_PROFILE_UIDS: readonly string[] = TEST_PROFILES.map(
  (profile) => profile.uid,
);

/** Whether a uid carries the reserved synthetic prefix. */
export function hasSyntheticPrefix(uid: string): boolean {
  return uid.startsWith(SYNTHETIC_UID_PREFIX);
}

/** Whether a uid is both synthetic-prefixed and in the seeded allowlist. */
export function isEligibleTestUid(uid: string): boolean {
  return hasSyntheticPrefix(uid) && TEST_PROFILE_UIDS.includes(uid);
}

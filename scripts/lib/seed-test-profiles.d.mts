// Type declarations for the plain-ESM seed-test-profiles helpers so the
// TypeScript spec (src/lib/debug-auth/seed-test-profiles.spec.ts) can import them
// under strict type checking. Keep in sync with seed-test-profiles.mjs.

import type { Timestamp } from "firebase-admin/firestore";

export const PRODUCTION_PROJECT_ID: string;

export function assertNotProduction(projectId: string | undefined): void;

export function testProfileDoc(profile: {
  uid: string;
  displayName: string;
  email: string;
}): {
  displayName: string;
  email: string;
  createdAt: Timestamp;
  synthetic: boolean;
};

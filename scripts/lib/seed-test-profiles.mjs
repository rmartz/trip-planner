// Pure, dependency-free helpers for the seed-test-profiles admin script, kept in
// plain ESM so both the `.mjs` seed script and the TypeScript spec
// (src/lib/debug-auth/seed-test-profiles.spec.ts) can import them.
//
// The canonical list of synthetic profiles lives in
// src/lib/debug-auth/test-profiles.json — the single source of truth shared by
// the TS app code (endpoint + switcher UI) and this seed script, so the uids and
// allowlist can never drift. This file holds only the project-id safety guard
// and the Firestore document shaping; the actual Admin SDK wiring lives in
// scripts/seed-test-profiles.mjs.

import { Timestamp } from "firebase-admin/firestore";

// The production Firebase project id. The seed script must never run against it;
// synthetic profiles belong only in the isolated staging project.
export const PRODUCTION_PROJECT_ID = "trip-planner-ae59d";

/**
 * Aborts if the resolved Firebase project id is production (or unknown). This is
 * a hard guard independent of the credential source: even with production
 * application-default credentials, seeding synthetic profiles is refused.
 *
 * @param {string | undefined} projectId
 */
export function assertNotProduction(projectId) {
  if (!projectId) {
    throw new Error(
      "Refusing to seed: could not resolve a Firebase project id. " +
        "Set FIREBASE_PROJECT_ID (must be the staging project).",
    );
  }
  if (projectId === PRODUCTION_PROJECT_ID) {
    throw new Error(
      `Refusing to seed test profiles against the production project ` +
        `(${PRODUCTION_PROJECT_ID}). This script only runs against staging.`,
    );
  }
}

/**
 * Shapes the Firestore `users/{uid}` document for a synthetic test profile.
 * Mirrors userProfileToFirebase plus a `synthetic: true` marker so seeded docs
 * are distinguishable from real accounts.
 *
 * @param {{ uid: string, displayName: string, email: string }} profile
 */
export function testProfileDoc(profile) {
  return {
    displayName: profile.displayName,
    email: profile.email,
    createdAt: Timestamp.now(),
    synthetic: true,
  };
}

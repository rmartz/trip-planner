#!/usr/bin/env node

// Seeds synthetic Firestore user profiles for the staging/preview debug-auth
// mode (see GitHub issue #379). Idempotent and re-runnable. Refuses to run
// against the production Firebase project.
//
// The canonical profile list is src/lib/debug-auth/test-profiles.json — the same
// file the impersonation endpoint and switcher UI read, so the seeded uids can
// never drift from the allowlist.

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  assertNotProduction,
  testProfileDoc,
} from "./lib/seed-test-profiles.mjs";
import testProfilesData from "../src/lib/debug-auth/test-profiles.json" with { type: "json" };

function parseArgs(argv) {
  return { dryRun: argv.includes("--dry-run") };
}

function resolveProjectId() {
  return process.env["FIREBASE_PROJECT_ID"];
}

function getCredential() {
  const projectId = process.env["FIREBASE_PROJECT_ID"];
  const clientEmail = process.env["FIREBASE_CLIENT_EMAIL"];
  const privateKey = process.env["FIREBASE_PRIVATE_KEY"]?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }

  return applicationDefault();
}

function initializeAdminApp() {
  const existing = getApps().find((app) => app.name === "[DEFAULT]");
  if (existing) {
    return existing;
  }

  return initializeApp({
    credential: getCredential(),
    projectId: process.env["FIREBASE_PROJECT_ID"],
  });
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));

  const projectId = resolveProjectId();
  // Hard safety guard: never seed synthetic profiles into production.
  assertNotProduction(projectId);

  initializeAdminApp();
  const db = getFirestore();
  const bulkWriter = db.bulkWriter();

  const { profiles } = testProfilesData;
  for (const profile of profiles) {
    const ref = db.collection("users").doc(profile.uid);
    if (!dryRun) {
      // merge:true keeps the write idempotent across re-runs.
      bulkWriter.set(ref, testProfileDoc(profile), { merge: true });
    }
    console.log(`profile=${profile.uid} name=${profile.displayName}`);
  }

  await bulkWriter.close();
  if (dryRun) {
    console.log("Dry run mode: no documents were written.");
  }

  console.log(
    `Completed seeding ${profiles.length} synthetic profile(s) into ${projectId}.`,
  );
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});

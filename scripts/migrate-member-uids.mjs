#!/usr/bin/env node

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const tripId = argv.find((arg) => arg.startsWith("--trip-id="))?.slice(10);
  return { dryRun, tripId };
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

function collectMemberUids(memberDocs) {
  const memberUidSet = new Set();

  for (const memberDoc of memberDocs) {
    const data = memberDoc.data();
    const uidFromField = data["uid"];
    if (typeof uidFromField === "string") {
      memberUidSet.add(uidFromField);
      continue;
    }

    memberUidSet.add(memberDoc.id);
  }

  return [...memberUidSet].sort();
}

async function getTripDocs(db, tripId) {
  if (!tripId) {
    const tripsSnapshot = await db.collection("trips").get();
    return tripsSnapshot.docs;
  }

  const tripDoc = await db.collection("trips").doc(tripId).get();
  return tripDoc.exists ? [tripDoc] : [];
}

async function backfillTrip(bulkWriter, tripDoc, dryRun) {
  const tripRef = tripDoc.ref;
  const [membersSnapshot, stopsSnapshot, legsSnapshot] = await Promise.all([
    tripRef.collection("members").get(),
    tripRef.collection("stops").get(),
    tripRef.collection("legs").get(),
  ]);

  const memberUids = collectMemberUids(membersSnapshot.docs);

  const refsToUpdate = [
    tripRef,
    ...membersSnapshot.docs.map((doc) => doc.ref),
    ...stopsSnapshot.docs.map((doc) => doc.ref),
    ...legsSnapshot.docs.map((doc) => doc.ref),
  ];

  if (dryRun) {
    return {
      refsUpdated: refsToUpdate.length,
      membersUpdated: membersSnapshot.size,
      stopsUpdated: stopsSnapshot.size,
      legsUpdated: legsSnapshot.size,
      memberUidsCount: memberUids.length,
    };
  }

  for (const ref of refsToUpdate) {
    bulkWriter.set(ref, { memberUids }, { merge: true });
  }

  return {
    refsUpdated: refsToUpdate.length,
    membersUpdated: membersSnapshot.size,
    stopsUpdated: stopsSnapshot.size,
    legsUpdated: legsSnapshot.size,
    memberUidsCount: memberUids.length,
  };
}

async function main() {
  const { dryRun, tripId } = parseArgs(process.argv.slice(2));

  initializeAdminApp();
  const db = getFirestore();
  const bulkWriter = db.bulkWriter();

  const tripDocs = await getTripDocs(db, tripId);
  if (tripDocs.length === 0) {
    console.log(
      tripId
        ? `No trip found for --trip-id=${tripId}`
        : "No trips found; nothing to migrate.",
    );
    await bulkWriter.close();
    return;
  }

  let tripsProcessed = 0;
  let totalRefsUpdated = 0;

  for (const tripDoc of tripDocs) {
    const summary = await backfillTrip(bulkWriter, tripDoc, dryRun);
    tripsProcessed += 1;
    totalRefsUpdated += summary.refsUpdated;

    console.log(
      [
        `trip=${tripDoc.id}`,
        `memberUids=${summary.memberUidsCount}`,
        `members=${summary.membersUpdated}`,
        `stops=${summary.stopsUpdated}`,
        `legs=${summary.legsUpdated}`,
        `docs=${summary.refsUpdated}`,
      ].join(" "),
    );
  }

  await bulkWriter.close();
  if (dryRun) {
    console.log("Dry run mode: no documents were written.");
  }

  console.log(
    `Completed memberUids migration for ${tripsProcessed} trip(s); ${totalRefsUpdated} document(s) processed.`,
  );
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});

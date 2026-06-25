#!/usr/bin/env node

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { computeTransportGapCountFromDocs } from "./lib/transport-gap.mjs";

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

async function getTripDocs(db, tripId) {
  if (!tripId) {
    const tripsSnapshot = await db.collection("trips").get();
    return tripsSnapshot.docs;
  }

  const tripDoc = await db.collection("trips").doc(tripId).get();
  return tripDoc.exists ? [tripDoc] : [];
}

// Mirrors getLegsForTrip: only active legs participate in the gap computation.
function activeLegs(legsSnapshot) {
  return legsSnapshot.docs
    .filter((doc) => doc.data()["isActive"] !== false)
    .map((doc) => ({ legId: doc.id }));
}

// Mirrors getTransportationEntriesForTrip + firebaseToTransportationEntry: the
// fields the gap computation reads (legId, uid, status, ridingWithUid, seatCount).
function transportationEntries(transportationSnapshot) {
  return transportationSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      legId: data["legId"],
      uid: data["uid"],
      status: data["status"],
      ridingWithUid: data["ridingWithUid"],
      seatCount: data["seatCount"],
    };
  });
}

// Mirrors getTripMemberUids: member uids are the member subcollection doc ids.
function memberUids(membersSnapshot) {
  return [
    ...new Set(membersSnapshot.docs.map((doc) => doc.id).filter(Boolean)),
  ];
}

async function backfillTrip(bulkWriter, tripDoc, dryRun) {
  const tripRef = tripDoc.ref;
  const [legsSnapshot, transportationSnapshot, membersSnapshot] =
    await Promise.all([
      tripRef.collection("legs").get(),
      tripRef.collection("transportation").get(),
      tripRef.collection("members").get(),
    ]);

  const transportGapCount = computeTransportGapCountFromDocs(
    activeLegs(legsSnapshot),
    transportationEntries(transportationSnapshot),
    memberUids(membersSnapshot),
  );

  const previous = tripDoc.data()["transportGapCount"];
  const changed = previous !== transportGapCount;

  // Idempotent: skip the write when the stored value already matches.
  if (!dryRun && changed) {
    bulkWriter.update(tripRef, { transportGapCount });
  }

  return { previous, transportGapCount, changed };
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
        : "No trips found; nothing to backfill.",
    );
    await bulkWriter.close();
    return;
  }

  let tripsProcessed = 0;
  let tripsChanged = 0;

  for (const tripDoc of tripDocs) {
    const summary = await backfillTrip(bulkWriter, tripDoc, dryRun);
    tripsProcessed += 1;
    if (summary.changed) tripsChanged += 1;

    console.log(
      [
        `trip=${tripDoc.id}`,
        `previous=${summary.previous ?? "unset"}`,
        `computed=${summary.transportGapCount}`,
        `changed=${summary.changed}`,
      ].join(" "),
    );
  }

  await bulkWriter.close();
  if (dryRun) {
    console.log("Dry run mode: no documents were written.");
  }

  console.log(
    `Completed transportGapCount backfill for ${tripsProcessed} trip(s); ${tripsChanged} document(s) ${dryRun ? "would change" : "updated"}.`,
  );
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});

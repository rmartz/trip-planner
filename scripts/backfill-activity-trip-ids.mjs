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
  const stopsSnapshot = await tripRef.collection("stops").get();

  let activitiesScanned = 0;
  let activitiesUpdated = 0;

  for (const stopDoc of stopsSnapshot.docs) {
    const activitiesSnapshot = await stopDoc.ref.collection("activities").get();

    for (const activityDoc of activitiesSnapshot.docs) {
      activitiesScanned += 1;
      const alreadySet = activityDoc.data()["tripId"] !== undefined;

      if (!alreadySet) {
        activitiesUpdated += 1;
        if (!dryRun) {
          bulkWriter.set(
            activityDoc.ref,
            { tripId: tripDoc.id },
            { merge: true },
          );
        }
      }
    }
  }

  return {
    stopsScanned: stopsSnapshot.size,
    activitiesScanned,
    activitiesUpdated,
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
        : "No trips found; nothing to backfill.",
    );
    await bulkWriter.close();
    return;
  }

  let tripsProcessed = 0;
  let totalActivitiesUpdated = 0;

  for (const tripDoc of tripDocs) {
    const summary = await backfillTrip(bulkWriter, tripDoc, dryRun);
    tripsProcessed += 1;
    totalActivitiesUpdated += summary.activitiesUpdated;

    console.log(
      [
        `trip=${tripDoc.id}`,
        `stops=${summary.stopsScanned}`,
        `activities=${summary.activitiesScanned}`,
        `updated=${summary.activitiesUpdated}`,
      ].join(" "),
    );
  }

  await bulkWriter.close();
  if (dryRun) {
    console.log("Dry run mode: no documents were written.");
  }

  console.log(
    `Completed tripId backfill for ${tripsProcessed} trip(s); ${totalActivitiesUpdated} activity document(s) ${dryRun ? "would be updated" : "updated"}.`,
  );
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});

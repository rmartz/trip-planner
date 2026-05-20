import { randomBytes } from "crypto";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { computeTransportGapCount } from "@/lib/trips/transport";
import { TripRole } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";
import { getLegsForTrip } from "./legs";
import {
  computeLegSummary,
  getTransportationEntriesForTrip,
} from "./transportation";

export async function getTripById(tripId: string): Promise<Trip | undefined> {
  const db = getAdminFirestore();
  const doc = await db.collection("trips").doc(tripId).get();
  if (!doc.exists) return undefined;
  return firebaseToTrip(doc.id, doc.data() ?? {});
}

export async function getTripMemberUids(tripId: string): Promise<string[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("members")
    .get();
  return [...new Set(snapshot.docs.map((doc) => doc.id).filter(Boolean))];
}

export async function getTripMemberRole(
  tripId: string,
  uid: string,
): Promise<TripRole | undefined> {
  const db = getAdminFirestore();
  const memberDoc = await db
    .collection("trips")
    .doc(tripId)
    .collection("members")
    .doc(uid)
    .get();

  if (!memberDoc.exists) return undefined;
  return (memberDoc.data()?.["role"] as TripRole | undefined) ?? TripRole.Guest;
}

export async function getTripsForUser(uid: string): Promise<Trip[]> {
  const db = getAdminFirestore();
  const memberDocs = await db
    .collectionGroup("members")
    .where("uid", "==", uid)
    .get();

  const tripRefs = memberDocs.docs.flatMap((doc) =>
    doc.ref.parent.parent ? [doc.ref.parent.parent] : [],
  );

  if (tripRefs.length === 0) {
    return [];
  }

  const tripDocs = await db.getAll(...tripRefs);
  return tripDocs.flatMap((tripDoc) =>
    tripDoc.exists ? [firebaseToTrip(tripDoc.id, tripDoc.data() ?? {})] : [],
  );
}

export async function createTripForUser(
  uid: string,
  name: string,
  startDate: Date,
  endDate: Date,
): Promise<string> {
  if (!name.trim()) throw new Error("name is required");
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
    throw new Error("startDate and endDate must be valid dates");
  if (startDate > endDate)
    throw new Error("startDate must be before or equal to endDate");

  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc();
  const memberRef = tripRef.collection("members").doc(uid);

  const now = new Date();
  const inviteToken = randomBytes(8).toString("base64url");
  const batch = db.batch();
  batch.set(tripRef, {
    name,
    startDate,
    endDate,
    createdAt: now,
    createdBy: uid,
    inviteToken,
  });
  batch.set(memberRef, { uid, role: TripRole.Planner, joinedAt: now });
  await batch.commit();

  return tripRef.id;
}

export async function recomputeTransportGapCount(
  tripId: string,
): Promise<void> {
  const [legs, entries, memberUids] = await Promise.all([
    getLegsForTrip(tripId),
    getTransportationEntriesForTrip(tripId),
    getTripMemberUids(tripId),
  ]);

  const entriesByLegId = new Map<string, typeof entries>();
  for (const entry of entries) {
    const bucket = entriesByLegId.get(entry.legId) ?? [];
    bucket.push(entry);
    entriesByLegId.set(entry.legId, bucket);
  }

  const legSummaries = legs.map((leg) => {
    const legEntries = entriesByLegId.get(leg.legId) ?? [];
    return computeLegSummary(memberUids, legEntries, {});
  });
  const transportGapCount = computeTransportGapCount(legSummaries);

  const db = getAdminFirestore();
  await db.collection("trips").doc(tripId).update({ transportGapCount });
}

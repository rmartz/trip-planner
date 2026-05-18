import { randomBytes } from "crypto";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { TripRole } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";

export async function getTripById(tripId: string): Promise<Trip | undefined> {
  const db = getAdminFirestore();
  const doc = await db.collection("trips").doc(tripId).get();
  if (!doc.exists) return undefined;
  return firebaseToTrip(doc.id, doc.data() ?? {});
}

export async function getTripMemberUids(tripId: string): Promise<string[]> {
  const db = getAdminFirestore();
  const doc = await db.collection("trips").doc(tripId).get();
  return (doc.data()?.["memberUids"] as string[] | undefined) ?? [];
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

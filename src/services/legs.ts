import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLeg } from "@/lib/firebase/schema/trip";
import { TripRole } from "@/lib/types/trip";
import type { Leg } from "@/lib/types/trip";

export async function getLegsForTrip(tripId: string): Promise<Leg[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("legs")
    .orderBy("order")
    .get();
  return snapshot.docs.map((doc) => firebaseToLeg(doc.id, tripId, doc.data()));
}

export async function getLegMemberRole(
  uid: string,
  tripId: string,
): Promise<TripRole | null> {
  const db = getAdminFirestore();
  const memberDoc = await db
    .collection("trips")
    .doc(tripId)
    .collection("members")
    .doc(uid)
    .get();
  if (!memberDoc.exists) return null;
  return (memberDoc.data()?.["role"] as TripRole | undefined) ?? null;
}

export async function addLeg(
  uid: string,
  tripId: string,
  fromStopId: string,
  toStopId: string,
): Promise<string> {
  if (!fromStopId.trim()) throw new Error("fromStopId is required");
  if (!toStopId.trim()) throw new Error("toStopId is required");
  if (fromStopId === toStopId)
    throw new Error("fromStopId and toStopId must be different");

  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new Error("Only Planners can add legs");
  }

  const tripDoc = await tripRef.get();
  const memberUids =
    (tripDoc.data()?.["memberUids"] as string[] | undefined) ?? [];

  const existingLegs = await tripRef
    .collection("legs")
    .orderBy("order", "desc")
    .limit(1)
    .get();
  const nextOrder = existingLegs.empty
    ? 0
    : ((existingLegs.docs[0]?.data()["order"] as number | undefined) ?? 0) + 1;

  const legRef = tripRef.collection("legs").doc();
  await legRef.set({
    fromStopId,
    toStopId,
    order: nextOrder,
    memberUids,
  });

  return legRef.id;
}

export async function updateLeg(
  uid: string,
  tripId: string,
  legId: string,
  fields: { fromStopId?: string; toStopId?: string },
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new Error("Only Planners can edit legs");
  }

  const updates: Record<string, unknown> = {};
  if (fields.fromStopId !== undefined) {
    if (!fields.fromStopId.trim()) throw new Error("fromStopId is required");
    updates["fromStopId"] = fields.fromStopId;
  }
  if (fields.toStopId !== undefined) {
    if (!fields.toStopId.trim()) throw new Error("toStopId is required");
    updates["toStopId"] = fields.toStopId;
  }

  if (Object.keys(updates).length === 0) return;

  await tripRef.collection("legs").doc(legId).update(updates);
}

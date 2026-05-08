import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToStop } from "@/lib/firebase/schema/trip";
import { TripRole } from "@/lib/types/trip";
import type { Stop } from "@/lib/types/trip";

export async function getStopsForTrip(tripId: string): Promise<Stop[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("stops")
    .orderBy("order")
    .get();
  return snapshot.docs.map((doc) => firebaseToStop(doc.id, tripId, doc.data()));
}

export async function getStopMemberRole(
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

export async function addStop(
  uid: string,
  tripId: string,
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
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new Error("Only Planners can add stops");
  }

  const tripDoc = await tripRef.get();
  const memberUids =
    (tripDoc.data()?.["memberUids"] as string[] | undefined) ?? [];

  const existingStops = await tripRef
    .collection("stops")
    .orderBy("order", "desc")
    .limit(1)
    .get();
  const nextOrder = existingStops.empty
    ? 0
    : ((existingStops.docs[0]?.data()["order"] as number | undefined) ?? 0) + 1;

  const stopRef = tripRef.collection("stops").doc();
  await stopRef.set({
    name: name.trim(),
    startDate,
    endDate,
    order: nextOrder,
    memberUids,
  });

  return stopRef.id;
}

export async function updateStop(
  uid: string,
  tripId: string,
  stopId: string,
  fields: { name?: string; startDate?: Date; endDate?: Date },
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new Error("Only Planners can edit stops");
  }

  const updates: Record<string, unknown> = {};
  if (fields.name !== undefined) {
    if (!fields.name.trim()) throw new Error("name is required");
    updates["name"] = fields.name.trim();
  }
  if (fields.startDate !== undefined) updates["startDate"] = fields.startDate;
  if (fields.endDate !== undefined) updates["endDate"] = fields.endDate;

  if (Object.keys(updates).length === 0) return;

  await tripRef.collection("stops").doc(stopId).update(updates);
}

export async function reorderStops(
  uid: string,
  tripId: string,
  stopIds: string[],
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new Error("Only Planners can reorder stops");
  }

  const batch = db.batch();
  stopIds.forEach((stopId, index) => {
    batch.update(tripRef.collection("stops").doc(stopId), { order: index });
  });
  await batch.commit();
}

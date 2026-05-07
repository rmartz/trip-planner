import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { TripRole } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";

export async function getTripsForUser(uid: string): Promise<Trip[]> {
  const db = getAdminFirestore();
  const memberDocs = await db
    .collectionGroup("members")
    .where("uid", "==", uid)
    .get();

  const tripIds = memberDocs.docs.map((doc) => doc.ref.parent.parent?.id);

  const trips = await Promise.all(
    tripIds.flatMap((tripId) => {
      if (!tripId) return [];
      return [
        db
          .collection("trips")
          .doc(tripId)
          .get()
          .then((snap) =>
            snap.exists ? firebaseToTrip(tripId, snap.data() ?? {}) : undefined,
          ),
      ];
    }),
  );

  return trips.filter((t): t is Trip => t !== undefined);
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
  const batch = db.batch();
  batch.set(tripRef, {
    name,
    startDate,
    endDate,
    createdAt: now,
    createdBy: uid,
  });
  batch.set(memberRef, { uid, role: TripRole.Planner, joinedAt: now });
  await batch.commit();

  return tripRef.id;
}

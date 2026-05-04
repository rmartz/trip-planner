import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
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

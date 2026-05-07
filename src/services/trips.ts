import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import type { Trip } from "@/lib/types/trip";

export async function getTripsForUser(uid: string): Promise<Trip[]> {
  const db = getAdminFirestore();
  const memberDocs = await db
    .collectionGroup("members")
    .where("uid", "==", uid)
    .get();

  const tripRefs = memberDocs.docs.flatMap((doc) => {
    const tripId = doc.ref.parent.parent?.id;
    if (!tripId) return [];
    return [db.collection("trips").doc(tripId)];
  });

  if (tripRefs.length === 0) {
    return [];
  }

  const tripDocs = await db.getAll(...tripRefs);
  return tripDocs.flatMap((tripDoc) =>
    tripDoc.exists ? [firebaseToTrip(tripDoc.id, tripDoc.data() ?? {})] : [],
  );
}

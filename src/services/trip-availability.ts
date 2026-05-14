import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  firebaseToTripAvailability,
  tripAvailabilityToFirebase,
} from "@/lib/firebase/schema/trip-availability";
import { getLegMemberRole } from "@/services/legs";
import { TripRole } from "@/lib/types/trip";
import { PlannerOnlyError } from "./errors";
import type { TripAvailability } from "@/lib/types/trip-availability";

export async function getTripAvailability(
  tripId: string,
): Promise<TripAvailability[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("availability")
    .get();
  return snapshot.docs.map((doc) =>
    firebaseToTripAvailability(doc.id, tripId, doc.data()),
  );
}

export async function setMyTripAvailability(
  uid: string,
  tripId: string,
  availableDates: string[],
): Promise<void> {
  const role = await getLegMemberRole(uid, tripId);
  if (role !== TripRole.Planner) {
    throw new PlannerOnlyError("Only Planners can set availability for a trip");
  }

  const db = getAdminFirestore();
  await db
    .collection("trips")
    .doc(tripId)
    .collection("availability")
    .doc(uid)
    .set(tripAvailabilityToFirebase(availableDates));
}

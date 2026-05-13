import { getAdminFirestore } from "@/lib/firebase/admin";
import { TripRole } from "@/lib/types/trip";
import type { TripDestination } from "@/lib/types/destination";
import { NotFoundError, PlannerOnlyError } from "./errors";

export async function attachDestinationToStop(
  uid: string,
  tripId: string,
  stopId: string,
  destinationId: string,
  catalogUid: string,
  destinationName: string,
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new PlannerOnlyError("Only Planners can attach destinations");
  }

  const stopRef = tripRef.collection("stops").doc(stopId);
  const stopDoc = await stopRef.get();
  if (!stopDoc.exists) {
    throw new NotFoundError("Stop not found");
  }

  const stopName = (stopDoc.data()?.["name"] as string | undefined) ?? "";

  await stopRef.collection("destinations").doc(destinationId).set({
    destinationId,
    catalogUid,
    name: destinationName,
    stopId,
    stopName,
    tripId,
  });
}

export async function getTripDestinations(
  tripId: string,
): Promise<TripDestination[]> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);
  const stopsSnapshot = await tripRef.collection("stops").get();

  const results: TripDestination[] = [];
  for (const stopDoc of stopsSnapshot.docs) {
    const destinationsSnapshot = await stopDoc.ref
      .collection("destinations")
      .get();
    for (const destDoc of destinationsSnapshot.docs) {
      const data = destDoc.data();
      results.push({
        destinationId:
          (data["destinationId"] as string | undefined) ?? destDoc.id,
        catalogUid: (data["catalogUid"] as string | undefined) ?? "",
        name: (data["name"] as string | undefined) ?? "",
        stopId: (data["stopId"] as string | undefined) ?? stopDoc.id,
        stopName: (data["stopName"] as string | undefined) ?? "",
        tripId,
      });
    }
  }

  return results;
}

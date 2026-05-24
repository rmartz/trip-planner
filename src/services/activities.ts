import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToActivity } from "@/lib/firebase/schema/activity";
import type { Activity } from "@/lib/types/activity";

export async function getActivitiesForTrip(
  tripId: string,
): Promise<Activity[]> {
  const db = getAdminFirestore();
  const stopsSnapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("stops")
    .get();

  const allActivities = await Promise.all(
    stopsSnapshot.docs.map(async (stopDoc) => {
      const activitiesSnapshot = await stopDoc.ref
        .collection("activities")
        .get();
      return activitiesSnapshot.docs.map((activityDoc) =>
        firebaseToActivity(
          activityDoc.id,
          stopDoc.id,
          tripId,
          activityDoc.data(),
        ),
      );
    }),
  );
  return allActivities.flat();
}

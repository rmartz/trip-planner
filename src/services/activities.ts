import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToActivity } from "@/lib/firebase/schema/activity";
import type { Activity } from "@/lib/types/activity";
import { MalformedActivityError } from "./errors";

export async function getActivitiesForTrip(
  tripId: string,
): Promise<Activity[]> {
  const db = getAdminFirestore();
  const activitiesSnapshot = await db
    .collectionGroup("activities")
    .where("tripId", "==", tripId)
    .get();

  return activitiesSnapshot.docs.map((activityDoc) => {
    const stopId = activityDoc.ref.parent.parent?.id;
    if (!stopId) {
      throw new MalformedActivityError(activityDoc.id);
    }
    return firebaseToActivity(
      activityDoc.id,
      stopId,
      tripId,
      activityDoc.data(),
    );
  });
}

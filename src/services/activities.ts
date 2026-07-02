import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToActivity } from "@/lib/firebase/schema/activity";
import type { Activity } from "@/lib/types/activity";

export async function getActivitiesForTrip(
  tripId: string,
): Promise<Activity[]> {
  const db = getAdminFirestore();
  const activitiesSnapshot = await db
    .collectionGroup("activities")
    .where("tripId", "==", tripId)
    .get();

  return activitiesSnapshot.docs.map((activityDoc) =>
    firebaseToActivity(
      activityDoc.id,
      activityDoc.ref.parent.parent?.id ?? "",
      tripId,
      activityDoc.data(),
    ),
  );
}

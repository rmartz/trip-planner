import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToActivity } from "@/lib/firebase/schema/activity";
import type { Activity } from "@/lib/types/activity";

export async function getActivitiesForTrip(tripId: string): Promise<Activity[]> {
  const db = getAdminFirestore();
  const stopsSnapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("stops")
    .get();

  const allActivities: Activity[] = [];
  for (const stopDoc of stopsSnapshot.docs) {
    const activitiesSnapshot = await stopDoc.ref.collection("activities").get();
    for (const activityDoc of activitiesSnapshot.docs) {
      allActivities.push(
        firebaseToActivity(activityDoc.id, stopDoc.id, tripId, activityDoc.data()),
      );
    }
  }
  return allActivities;
}

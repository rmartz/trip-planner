import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { ScheduleStatus } from "@/lib/types/schedule";
import { TripRole } from "@/lib/types/trip";
import { writeNotificationsForSchedulePublish } from "./notify-schedule";

export class PublishScheduleForbiddenError extends Error {
  constructor() {
    super("Only Planners can publish a schedule");
  }
}

/**
 * Persists a stop's published activity schedule and transitions its status to
 * "published". Only a Planner may publish. When the status actually flips from
 * unpublished to published, the schedule-published notification is fanned out to
 * the stop's attending Guests; a re-publish (already published) skips the
 * notification so Guests are not spammed. A notification failure never breaks
 * the publish itself.
 */
export async function publishSchedule(
  publisherUid: string,
  tripId: string,
  stopId: string,
  orderedActivityIds: string[],
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(publisherUid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new PublishScheduleForbiddenError();
  }

  const stopRef = tripRef.collection("stops").doc(stopId);
  const stopSnap = await stopRef.get();
  const previousStatus = stopSnap.data()?.["scheduleStatus"] as
    | ScheduleStatus
    | undefined;

  await stopRef.update({
    scheduleActivityOrder: orderedActivityIds,
    schedulePublishedAt: FieldValue.serverTimestamp(),
    scheduleStatus: "published",
  });

  if (previousStatus === "published") return;

  try {
    await writeNotificationsForSchedulePublish(publisherUid, tripId, stopId);
  } catch (notificationError) {
    console.error(
      "Failed to write schedule-published notifications",
      notificationError,
    );
  }
}

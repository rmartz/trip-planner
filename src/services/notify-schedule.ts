import { ServerValue } from "firebase-admin/database";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { getUnreadCountPath } from "@/lib/firebase/schema/unread-count";
import { NotificationType } from "@/lib/types/notification";
import { TripRole } from "@/lib/types/trip";

/**
 * Resolves the Guests who attend a stop, excluding the publishing Planner. A
 * stop's `memberUids` are its attendees; each is kept only when their trip
 * membership role is Guest, so Planners (including the actor) are never
 * notified of their own publish.
 */
async function getAttendingGuestsForStop(
  publisherUid: string,
  tripId: string,
  stopId: string,
): Promise<{ recipientUids: string[]; stopName: string }> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const stopSnap = await tripRef.collection("stops").doc(stopId).get();
  const stopData = stopSnap.data();
  const stopName = (stopData?.["name"] as string | undefined) ?? "";
  const attendeeUids = (
    (stopData?.["memberUids"] as string[] | undefined) ?? []
  ).filter((uid) => uid !== publisherUid);

  if (attendeeUids.length === 0) return { recipientUids: [], stopName };

  const membersRef = tripRef.collection("members");
  const memberDocs = await Promise.all(
    attendeeUids.map((uid) => membersRef.doc(uid).get()),
  );

  const recipientUids = memberDocs
    .filter(
      (memberDoc) =>
        ((memberDoc.data()?.["role"] as TripRole | undefined) ??
          TripRole.Guest) === TripRole.Guest,
    )
    .map((memberDoc) => memberDoc.id);

  return { recipientUids, stopName };
}

/**
 * Writes a schedule-published notification for each Guest who attends the
 * stop, incrementing each recipient's unread count. The notification links to
 * the stop's published schedule and RSVP flow. The publishing Planner is not
 * self-notified.
 */
export async function writeNotificationsForSchedulePublish(
  publisherUid: string,
  tripId: string,
  stopId: string,
): Promise<void> {
  const { recipientUids, stopName } = await getAttendingGuestsForStop(
    publisherUid,
    tripId,
    stopId,
  );
  if (recipientUids.length === 0) return;

  const db = getAdminFirestore();
  const rtdb = getAdminDatabase();
  await Promise.all(
    recipientUids.map(async (uid) => {
      const userRef = db.collection("users").doc(uid);
      const notificationRef = userRef.collection("notifications").doc();
      const batch = db.batch();
      batch.set(notificationRef, {
        createdAt: FieldValue.serverTimestamp(),
        read: false,
        title: stopName,
        tripId,
        triggerType: NotificationType.SchedulePublished,
        type: NotificationType.SchedulePublished,
        uid,
      });
      batch.set(
        userRef,
        { unreadCount: FieldValue.increment(1) },
        { merge: true },
      );
      await batch.commit();
      await rtdb.ref(getUnreadCountPath(uid)).set(ServerValue.increment(1));
    }),
  );
}

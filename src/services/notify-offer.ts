import { ServerValue } from "firebase-admin/database";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { getUnreadCountPath } from "@/lib/firebase/schema/unread-count";
import { NotificationType } from "@/lib/types/notification";

async function writeOfferNotifications(
  tripId: string,
  title: string,
  recipientUids: string[],
  type: NotificationType,
): Promise<void> {
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
        title,
        tripId,
        triggerType: type,
        type,
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

/**
 * Writes a lodging-offer notification for each guest a host has newly surfaced
 * their lodging availability to, incrementing each guest's unread count. The
 * notification links to the trip's lodging logistics view.
 */
export async function writeNotificationsForLodgingOffer(
  tripId: string,
  stopName: string,
  newlyInvitedUids: string[],
): Promise<void> {
  await writeOfferNotifications(
    tripId,
    stopName,
    newlyInvitedUids,
    NotificationType.LodgingOffer,
  );
}

/**
 * Writes a transport-offer notification for each guest a driver has newly
 * surfaced their seat availability to, incrementing each guest's unread count.
 * The notification links to the trip's transport logistics view.
 */
export async function writeNotificationsForTransportOffer(
  tripId: string,
  legName: string,
  newlyOfferedUids: string[],
): Promise<void> {
  await writeOfferNotifications(
    tripId,
    legName,
    newlyOfferedUids,
    NotificationType.TransportOffer,
  );
}

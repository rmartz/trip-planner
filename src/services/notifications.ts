import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToNotification } from "@/lib/firebase/schema/notification";
import {
  getUnreadCountPath,
  serializeUnreadCount,
} from "@/lib/firebase/schema/unread-count";
import type { Notification } from "@/lib/types/notification";

export async function getNotificationsForUser(
  uid: string,
): Promise<Notification[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("notifications")
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) =>
    firebaseToNotification(doc.id, uid, doc.data()),
  );
}

async function syncUnreadCount(uid: string): Promise<void> {
  const db = getAdminFirestore();
  const unreadSnapshot = await db
    .collection("users")
    .doc(uid)
    .collection("notifications")
    .where("read", "==", false)
    .get();
  const unreadCount = serializeUnreadCount(unreadSnapshot.docs.length);
  await db.collection("users").doc(uid).update({ unreadCount });
  await getAdminDatabase().ref(getUnreadCountPath(uid)).set(unreadCount);
}

export async function markNotificationRead(
  uid: string,
  notificationId: string,
): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection("users")
    .doc(uid)
    .collection("notifications")
    .doc(notificationId)
    .update({ read: true });
  await syncUnreadCount(uid);
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  const db = getAdminFirestore();
  const unreadSnapshot = await db
    .collection("users")
    .doc(uid)
    .collection("notifications")
    .where("read", "==", false)
    .get();

  const batch = db.batch();
  for (const doc of unreadSnapshot.docs) {
    batch.update(doc.ref, { read: true });
  }
  await batch.commit();

  await db.collection("users").doc(uid).update({ unreadCount: 0 });
  await getAdminDatabase()
    .ref(getUnreadCountPath(uid))
    .set(serializeUnreadCount(0));
}

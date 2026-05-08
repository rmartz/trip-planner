import { Timestamp } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { NotificationType } from "@/lib/types/notification";
import type { Notification } from "@/lib/types/notification";

export function firebaseToNotification(
  notificationId: string,
  uid: string,
  data: DocumentData,
): Notification {
  const createdAt = data["createdAt"] as Timestamp | null | undefined;
  return {
    notificationId,
    uid,
    type:
      (data["type"] as NotificationType | undefined) ??
      NotificationType.VoteReceived,
    read: (data["read"] as boolean | undefined) ?? false,
    createdAt: createdAt?.toDate() ?? new Date(),
    title: (data["title"] as string | undefined) ?? "",
    tripId: (data["tripId"] as string | undefined) ?? "",
    triggerType:
      (data["triggerType"] as NotificationType | undefined) ??
      NotificationType.VoteReceived,
  };
}

export function notificationToFirebase(
  notification: Omit<Notification, "notificationId">,
): {
  uid: string;
  type: NotificationType;
  read: boolean;
  createdAt: Timestamp;
  title: string;
  tripId: string;
  triggerType: NotificationType;
} {
  return {
    uid: notification.uid,
    type: notification.type,
    read: notification.read,
    createdAt: Timestamp.fromDate(notification.createdAt),
    title: notification.title,
    tripId: notification.tripId,
    triggerType: notification.triggerType,
  };
}

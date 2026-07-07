import { Timestamp } from "firebase-admin/firestore";
import type { DocumentData } from "firebase/firestore";
import { NotificationType } from "@/lib/types/notification";
import type { Notification } from "@/lib/types/notification";
import { toDate, toEnumWithDefault } from "./helpers";

export function firebaseToNotification(
  notificationId: string,
  uid: string,
  data: DocumentData,
): Notification {
  return {
    notificationId,
    uid,
    type: toEnumWithDefault(
      NotificationType,
      data["type"],
      NotificationType.VoteReceived,
      "type",
    ),
    read: (data["read"] as boolean | undefined) ?? false,
    createdAt: toDate(data["createdAt"], "createdAt"),
    title: (data["title"] as string | undefined) ?? "",
    tripId: (data["tripId"] as string | undefined) ?? "",
    triggerType: toEnumWithDefault(
      NotificationType,
      data["triggerType"],
      NotificationType.VoteReceived,
      "triggerType",
    ),
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

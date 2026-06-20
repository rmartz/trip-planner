import { NotificationType as DomainNotificationType } from "@/lib/types/notification";
import type { Notification } from "@/lib/types/notification";
import {
  type NotificationListItem,
  NotificationType as ViewNotificationType,
} from "./NotificationsListPageView";

/**
 * Maps a domain notification type (the serialized Firestore schema) to the
 * view's display category, which selects the row icon. The view enum carries
 * more display categories than the domain currently emits; the domain values
 * map onto the closest existing category.
 */
const DOMAIN_TO_VIEW_TYPE: Record<
  DomainNotificationType,
  ViewNotificationType
> = {
  [DomainNotificationType.LegRemoved]: ViewNotificationType.LegRemoved,
  [DomainNotificationType.LodgingOffer]: ViewNotificationType.LodgingOffer,
  [DomainNotificationType.TransportOffer]: ViewNotificationType.TransportOffer,
  [DomainNotificationType.TripInvite]: ViewNotificationType.TripInvitation,
  [DomainNotificationType.VoteReceived]: ViewNotificationType.ActivityScheduled,
};

export function notificationToListItem(
  notification: Notification,
): NotificationListItem {
  return {
    body: "",
    notificationId: notification.notificationId,
    occurredAt: notification.createdAt,
    read: notification.read,
    title: notification.title,
    tripId: notification.tripId,
    type: DOMAIN_TO_VIEW_TYPE[notification.type],
  };
}

/**
 * Resolves the in-app route a notification links to, based on its domain type
 * and trip. Returns undefined when the notification has no navigable target.
 */
export function notificationLinkPath(
  notification: Notification,
): string | undefined {
  if (!notification.tripId) return undefined;
  switch (notification.type) {
    case DomainNotificationType.LegRemoved:
      return `/trips/${notification.tripId}/archive`;
    case DomainNotificationType.LodgingOffer:
      return `/trips/${notification.tripId}/lodging`;
    case DomainNotificationType.TransportOffer:
      return `/trips/${notification.tripId}/transport`;
    case DomainNotificationType.TripInvite:
    case DomainNotificationType.VoteReceived:
      return `/trips/${notification.tripId}`;
  }
}

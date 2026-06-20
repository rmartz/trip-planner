export enum NotificationType {
  LegRemoved = "leg_removed",
  LodgingOffer = "lodging_offer",
  TransportOffer = "transport_offer",
  TripInvite = "trip_invite",
  VoteReceived = "vote_received",
}

export interface Notification {
  notificationId: string;
  uid: string;
  /** The category used to render this notification (e.g. which icon and template to display). */
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  title: string;
  tripId: string;
  /**
   * The underlying event that caused this notification to be created.
   * Usually matches `type`, but can differ when one user action produces a
   * notification displayed under a different category — for example, a
   * trip-admin action that surfaces as a `TripInvite` notification but was
   * triggered by a `VoteReceived` event.
   */
  triggerType: NotificationType;
}

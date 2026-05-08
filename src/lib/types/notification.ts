export enum NotificationType {
  TripInvite = "trip_invite",
  VoteReceived = "vote_received",
}

export interface Notification {
  notificationId: string;
  uid: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  title: string;
  tripId: string;
  triggerType: NotificationType;
}

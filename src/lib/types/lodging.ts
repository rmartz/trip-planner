export enum LodgingStatus {
  NeedLodging = "need_lodging",
  SecuredCapacity = "secured_capacity",
  SecuredPrivate = "secured_private",
  SharingWith = "sharing_with",
}

export interface LodgingRecord {
  uid: string;
  stopId: string;
  status: LodgingStatus;
  guestCount?: number;
  invitedUids?: string[];
  sharingWithUid?: string;
  updatedAt: Date;
}

import { Timestamp } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";

export function firebaseToLodging(
  uid: string,
  stopId: string,
  data: DocumentData,
): LodgingRecord {
  return {
    uid,
    stopId,
    status:
      (data["status"] as LodgingStatus | undefined) ??
      LodgingStatus.NeedLodging,
    ...(data["guestCount"] !== undefined
      ? { guestCount: data["guestCount"] as number }
      : {}),
    ...(data["sharingWithUid"] !== undefined
      ? { sharingWithUid: data["sharingWithUid"] as string }
      : {}),
    updatedAt:
      (data["updatedAt"] as Timestamp | undefined)?.toDate() ?? new Date(),
  };
}

export function lodgingToFirebase(record: LodgingRecord): {
  status: LodgingStatus;
  updatedAt: Timestamp;
  guestCount?: number;
  sharingWithUid?: string;
} {
  return {
    status: record.status,
    updatedAt: Timestamp.fromDate(record.updatedAt),
    ...(record.guestCount !== undefined
      ? { guestCount: record.guestCount }
      : {}),
    ...(record.sharingWithUid !== undefined
      ? { sharingWithUid: record.sharingWithUid }
      : {}),
  };
}

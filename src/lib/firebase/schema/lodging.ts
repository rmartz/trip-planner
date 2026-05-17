import { Timestamp } from "firebase-admin/firestore";
import type { DocumentData } from "firebase/firestore";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";

function isTimestampLike(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>)["toDate"] === "function"
  );
}

const LODGING_STATUS_VALUES = new Set(Object.values(LodgingStatus));

function isLodgingStatus(value: unknown): value is LodgingStatus {
  return LODGING_STATUS_VALUES.has(value as LodgingStatus);
}

export function firebaseToLodging(
  uid: string,
  stopId: string,
  data: DocumentData,
): LodgingRecord {
  const statusValue = data["status"] as unknown;
  const status = isLodgingStatus(statusValue)
    ? statusValue
    : LodgingStatus.NeedLodging;

  const updatedAtValue = data["updatedAt"] as unknown;
  if (!isTimestampLike(updatedAtValue)) {
    throw new Error("Lodging record is missing a valid updatedAt Timestamp.");
  }

  const rawInvitedUids = data["invitedUids"] as unknown;
  const invitedUids =
    Array.isArray(rawInvitedUids) &&
    rawInvitedUids.every((u): u is string => typeof u === "string")
      ? rawInvitedUids
      : undefined;

  return {
    uid,
    stopId,
    status,
    ...(data["guestCount"] !== undefined
      ? { guestCount: data["guestCount"] as number }
      : {}),
    ...(invitedUids !== undefined ? { invitedUids } : {}),
    ...(data["sharingWithUid"] !== undefined
      ? { sharingWithUid: data["sharingWithUid"] as string }
      : {}),
    updatedAt: updatedAtValue.toDate(),
  };
}

export function lodgingToFirebase(record: LodgingRecord): {
  status: LodgingStatus;
  updatedAt: Timestamp;
  guestCount?: number;
  invitedUids?: string[];
  sharingWithUid?: string;
} {
  return {
    status: record.status,
    updatedAt: Timestamp.fromDate(record.updatedAt),
    ...(record.guestCount !== undefined
      ? { guestCount: record.guestCount }
      : {}),
    ...(record.invitedUids !== undefined
      ? { invitedUids: record.invitedUids }
      : {}),
    ...(record.sharingWithUid !== undefined
      ? { sharingWithUid: record.sharingWithUid }
      : {}),
  };
}

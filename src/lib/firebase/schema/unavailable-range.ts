import { Timestamp } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import type { UnavailableRange } from "@/lib/types/unavailable-range";

function toDate(value: Timestamp | null | undefined): Date {
  return value?.toDate() ?? new Date();
}

export function firebaseToUnavailableRange(
  rangeId: string,
  uid: string,
  data: DocumentData,
): UnavailableRange {
  return {
    rangeId,
    uid,
    startDate: toDate(data["startDate"] as Timestamp | null | undefined),
    endDate: toDate(data["endDate"] as Timestamp | null | undefined),
    note: data["note"] as string | undefined,
  };
}

export function unavailableRangeToFirebase(
  range: Omit<UnavailableRange, "rangeId" | "uid">,
): {
  startDate: Date;
  endDate: Date;
  note?: string;
} {
  return {
    startDate: range.startDate,
    endDate: range.endDate,
    ...(range.note !== undefined ? { note: range.note } : {}),
  };
}

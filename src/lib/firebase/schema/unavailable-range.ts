import type { DocumentData } from "firebase/firestore";
import type { UnavailableRange } from "@/lib/types/unavailable-range";
import { toDate } from "./helpers";

export function firebaseToUnavailableRange(
  rangeId: string,
  uid: string,
  data: DocumentData,
): UnavailableRange {
  return {
    rangeId,
    uid,
    startDate: toDate(data["startDate"], "startDate"),
    endDate: toDate(data["endDate"], "endDate"),
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

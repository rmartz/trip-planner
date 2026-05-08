import type { DocumentData } from "firebase/firestore";
import { TransportationStatus } from "@/lib/types/transportation";
import type { TransportationEntry } from "@/lib/types/transportation";

export function firebaseToTransportationEntry(
  entryId: string,
  legId: string,
  uid: string,
  data: DocumentData,
): TransportationEntry {
  return {
    entryId,
    legId,
    uid,
    status:
      (data["status"] as TransportationStatus | undefined) ??
      TransportationStatus.NeedTransportation,
    routeName: (data["routeName"] as string | undefined) ?? "",
    ...(data["seatCount"] !== undefined
      ? { seatCount: data["seatCount"] as number }
      : {}),
    ...(data["ridingWithUid"] !== undefined
      ? { ridingWithUid: data["ridingWithUid"] as string }
      : {}),
  };
}

export function transportationEntryToFirebase(
  entry: Omit<TransportationEntry, "entryId" | "legId" | "uid">,
): {
  status: TransportationStatus;
  routeName: string;
  seatCount?: number;
  ridingWithUid?: string;
} {
  return {
    status: entry.status,
    routeName: entry.routeName,
    ...(entry.seatCount !== undefined ? { seatCount: entry.seatCount } : {}),
    ...(entry.ridingWithUid !== undefined
      ? { ridingWithUid: entry.ridingWithUid }
      : {}),
  };
}

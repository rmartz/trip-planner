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
    status: Object.values(TransportationStatus).includes(
      data["status"] as TransportationStatus,
    )
      ? (data["status"] as TransportationStatus)
      : TransportationStatus.NeedTransportation,
    routeName: (data["routeName"] as string | undefined) ?? "",
    ...(data["seatCount"] !== undefined
      ? { seatCount: data["seatCount"] as number }
      : {}),
    ...(Array.isArray(data["offeredToUids"])
      ? { offeredToUids: data["offeredToUids"] as string[] }
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
  offeredToUids?: string[];
  ridingWithUid?: string;
  seatCount?: number;
} {
  return {
    status: entry.status,
    routeName: entry.routeName,
    ...(entry.offeredToUids !== undefined
      ? { offeredToUids: entry.offeredToUids }
      : {}),
    ...(entry.ridingWithUid !== undefined
      ? { ridingWithUid: entry.ridingWithUid }
      : {}),
    ...(entry.seatCount !== undefined ? { seatCount: entry.seatCount } : {}),
  };
}

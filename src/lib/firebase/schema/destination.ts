import type { DocumentData } from "firebase/firestore";
import type { Destination } from "@/lib/types/destination";

export function firebaseToDestination(
  destinationId: string,
  uid: string,
  data: DocumentData,
): Destination {
  return {
    destinationId,
    uid,
    name: (data["name"] as string | undefined) ?? "",
    seasonality: data["seasonality"] as string | undefined,
    tripIds: (data["tripIds"] as string[] | undefined) ?? [],
  };
}

export function destinationToFirebase(
  destination: Omit<Destination, "destinationId" | "uid">,
): {
  name: string;
  seasonality?: string;
  tripIds: string[];
} {
  return {
    name: destination.name,
    ...(destination.seasonality !== undefined
      ? { seasonality: destination.seasonality }
      : {}),
    tripIds: destination.tripIds,
  };
}

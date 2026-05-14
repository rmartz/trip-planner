import type { DocumentData } from "firebase/firestore";
import type { TripAvailability } from "@/lib/types/trip-availability";

export function firebaseToTripAvailability(
  uid: string,
  tripId: string,
  data: DocumentData,
): TripAvailability {
  return {
    uid,
    tripId,
    availableDates: (data["availableDates"] as string[] | undefined) ?? [],
  };
}

export function tripAvailabilityToFirebase(availableDates: string[]): {
  availableDates: string[];
} {
  return { availableDates };
}

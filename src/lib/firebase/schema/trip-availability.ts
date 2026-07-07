import type { DocumentData } from "firebase/firestore";
import type { TripAvailability } from "@/lib/types/trip-availability";
import { toStringArray } from "./helpers";

export function firebaseToTripAvailability(
  uid: string,
  tripId: string,
  data: DocumentData,
): TripAvailability {
  return {
    uid,
    tripId,
    availableDates: toStringArray(data["availableDates"], "availableDates"),
  };
}

export function tripAvailabilityToFirebase(availableDates: string[]): {
  availableDates: string[];
} {
  return { availableDates };
}

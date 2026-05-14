import type { DocumentData } from "firebase/firestore";
import type { TripAvailability } from "@/lib/types/trip-availability";

function toAvailableDates(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export function firebaseToTripAvailability(
  uid: string,
  tripId: string,
  data: DocumentData,
): TripAvailability {
  return {
    uid,
    tripId,
    availableDates: toAvailableDates(data["availableDates"]),
  };
}

export function tripAvailabilityToFirebase(availableDates: string[]): {
  availableDates: string[];
} {
  return { availableDates };
}

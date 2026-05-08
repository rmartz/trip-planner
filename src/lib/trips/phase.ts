import { TripPhase } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";

export function getTripPhase(trip: Trip): TripPhase {
  if (trip.endDate < new Date()) {
    if (trip.settledAt !== undefined) {
      return TripPhase.Settled;
    }
    return TripPhase.SettlingUp;
  }
  if (trip.memberUids.length > 1) {
    return TripPhase.Coordination;
  }
  return TripPhase.Planning;
}

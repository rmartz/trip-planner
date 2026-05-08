import { TripPhase } from "@/lib/types/trip";

export const PHASE_PILL_COPY = {
  [TripPhase.Coordination]: "Coordination",
  [TripPhase.Planning]: "Planning",
  [TripPhase.Settled]: "Settled",
  [TripPhase.SettlingUp]: "Settling Up",
} as const;

import type { Stop } from "@/lib/types/trip";

export function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Austin",
    startDate: new Date("2025-06-01T00:00:00Z"),
    endDate: new Date("2025-06-03T00:00:00Z"),
    order: 0,
    memberUids: ["uid-1"],
    ...overrides,
  };
}

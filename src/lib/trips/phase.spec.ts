import { describe, it, expect } from "vitest";
import { getTripPhase } from "./phase";
import { TripPhase } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  const now = new Date();
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    tripId: "trip-1",
    name: "Test Trip",
    startDate: now,
    endDate: future,
    createdAt: now,
    createdBy: "uid-1",
    memberUids: ["uid-1"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

describe("getTripPhase — Planning phase", () => {
  it("returns Planning when only one member and end date is in the future", () => {
    const trip = makeTrip({ memberUids: ["uid-1"] });
    expect(getTripPhase(trip)).toBe(TripPhase.Planning);
  });
});

describe("getTripPhase — Coordination phase", () => {
  it("returns Coordination when more than one member and end date is in the future", () => {
    const trip = makeTrip({ memberUids: ["uid-1", "uid-2"] });
    expect(getTripPhase(trip)).toBe(TripPhase.Coordination);
  });

  it("returns Coordination for three or more members", () => {
    const trip = makeTrip({ memberUids: ["uid-1", "uid-2", "uid-3"] });
    expect(getTripPhase(trip)).toBe(TripPhase.Coordination);
  });
});

describe("getTripPhase — SettlingUp phase", () => {
  it("returns SettlingUp when end date is in the past and only one member", () => {
    const past = new Date("2020-01-01T00:00:00Z");
    const trip = makeTrip({ endDate: past, memberUids: ["uid-1"] });
    expect(getTripPhase(trip)).toBe(TripPhase.SettlingUp);
  });

  it("returns SettlingUp when end date is in the past with multiple members", () => {
    const past = new Date("2020-01-01T00:00:00Z");
    const trip = makeTrip({ endDate: past, memberUids: ["uid-1", "uid-2"] });
    expect(getTripPhase(trip)).toBe(TripPhase.SettlingUp);
  });
});

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

describe("getTripPhase — Settled phase", () => {
  it("returns Settled when settledAt is set and end date is in the past", () => {
    const past = new Date("2020-01-01T00:00:00Z");
    const settledAt = new Date("2020-01-15T00:00:00Z");
    const trip = makeTrip({ endDate: past, settledAt });
    expect(getTripPhase(trip)).toBe(TripPhase.Settled);
  });

  it("returns Settled when settledAt is set with multiple members", () => {
    const past = new Date("2020-01-01T00:00:00Z");
    const settledAt = new Date("2020-01-15T00:00:00Z");
    const trip = makeTrip({
      endDate: past,
      memberUids: ["uid-1", "uid-2"],
      settledAt,
    });
    expect(getTripPhase(trip)).toBe(TripPhase.Settled);
  });

  it("does not return Settled when settledAt is absent", () => {
    const past = new Date("2020-01-01T00:00:00Z");
    const trip = makeTrip({ endDate: past });
    expect(getTripPhase(trip)).toBe(TripPhase.SettlingUp);
  });

  it("does not return Settled when settledAt is set but end date is in the future", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const settledAt = new Date();
    const trip = makeTrip({ endDate: future, settledAt });
    expect(getTripPhase(trip)).not.toBe(TripPhase.Settled);
  });
});

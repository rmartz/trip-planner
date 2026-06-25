import { describe, expect, it } from "vitest";
// The backfill script is plain ESM (.mjs) so it can run under firebase-admin
// without TypeScript tooling. This spec imports that same module directly so the
// script's gap math is verified to match the TS runtime logic in
// src/services/transportation.ts and src/lib/trips/transport.ts.
import { computeTransportGapCountFromDocs } from "../../../scripts/lib/transport-gap.mjs";
import type {
  TransportGapEntry,
  TransportGapLeg,
} from "../../../scripts/lib/transport-gap.mjs";

describe("computeTransportGapCountFromDocs — demand vs supply", () => {
  it("counts the seat deficit when need exceeds offered seats on a leg", () => {
    const legs: TransportGapLeg[] = [{ legId: "leg-1" }];
    const entries: TransportGapEntry[] = [
      { legId: "leg-1", uid: "rider-a", status: "need-transportation" },
      { legId: "leg-1", uid: "rider-b", status: "need-transportation" },
      { legId: "leg-1", uid: "rider-c", status: "need-transportation" },
      {
        legId: "leg-1",
        uid: "driver-a",
        status: "driving-with-seats",
        seatCount: 1,
      },
    ];
    const memberUids = ["rider-a", "rider-b", "rider-c", "driver-a"];

    expect(computeTransportGapCountFromDocs(legs, entries, memberUids)).toBe(2);
  });
});

describe("computeTransportGapCountFromDocs — non-member entries", () => {
  it("ignores need-transportation entries whose uid is not a trip member", () => {
    const legs: TransportGapLeg[] = [{ legId: "leg-1" }];
    const entries: TransportGapEntry[] = [
      { legId: "leg-1", uid: "member-rider", status: "need-transportation" },
      { legId: "leg-1", uid: "stranger", status: "need-transportation" },
    ];
    const memberUids = ["member-rider"];

    expect(computeTransportGapCountFromDocs(legs, entries, memberUids)).toBe(1);
  });
});

describe("computeTransportGapCountFromDocs — riding-with seat deduction", () => {
  it("reduces a driver's offered seats by the riders assigned to them", () => {
    const legs: TransportGapLeg[] = [{ legId: "leg-1" }];
    const entries: TransportGapEntry[] = [
      { legId: "leg-1", uid: "rider-a", status: "need-transportation" },
      { legId: "leg-1", uid: "rider-b", status: "need-transportation" },
      {
        legId: "leg-1",
        uid: "passenger",
        status: "riding-with",
        ridingWithUid: "driver-a",
      },
      {
        legId: "leg-1",
        uid: "driver-a",
        status: "driving-with-seats",
        seatCount: 3,
      },
    ];
    // 2 need a ride; driver offers 3 seats minus 1 committed passenger = 2 open
    // seats, so the gap is 0.
    const memberUids = ["rider-a", "rider-b", "passenger", "driver-a"];

    expect(computeTransportGapCountFromDocs(legs, entries, memberUids)).toBe(0);
  });
});

describe("computeTransportGapCountFromDocs — multiple legs", () => {
  it("sums per-leg deficits without offsetting surplus from another leg", () => {
    const legs: TransportGapLeg[] = [{ legId: "leg-1" }, { legId: "leg-2" }];
    const entries: TransportGapEntry[] = [
      {
        legId: "leg-1",
        uid: "driver-a",
        status: "driving-with-seats",
        seatCount: 5,
      },
      { legId: "leg-1", uid: "rider-a", status: "need-transportation" },
      { legId: "leg-2", uid: "rider-a", status: "need-transportation" },
      { legId: "leg-2", uid: "rider-b", status: "need-transportation" },
    ];
    // leg-1: 1 need, 5 seats -> 0 gap (surplus not carried over);
    // leg-2: 2 need, 0 seats -> 2 gap.
    const memberUids = ["driver-a", "rider-a", "rider-b"];

    expect(computeTransportGapCountFromDocs(legs, entries, memberUids)).toBe(2);
  });
});

describe("computeTransportGapCountFromDocs — unknown status", () => {
  it("treats an unrecognized status as need-transportation (matching the schema fallback)", () => {
    const legs: TransportGapLeg[] = [{ legId: "leg-1" }];
    const entries: TransportGapEntry[] = [
      { legId: "leg-1", uid: "rider-a", status: "totally-bogus-status" },
    ];
    const memberUids = ["rider-a"];

    expect(computeTransportGapCountFromDocs(legs, entries, memberUids)).toBe(1);
  });
});

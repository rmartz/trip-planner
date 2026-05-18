import { describe, expect, it } from "vitest";
import {
  type TransportLegSummary,
  TransportOfferVisibility,
} from "@/components/transport/TransportPlannerOverviewView";
import type { Leg } from "@/lib/types/trip";
import { computeTransportGapCount } from "./transport";

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    fromStopId: "stop-1",
    isActive: true,
    legId: "leg-1",
    memberUids: ["uid-1"],
    name: "Austin → Wimberley",
    order: 0,
    toStopId: "stop-2",
    tripId: "trip-1",
    ...overrides,
  };
}

function makeLegSummary(
  overrides: Partial<TransportLegSummary> = {},
): TransportLegSummary {
  return {
    demand: { driving: 0, needRide: 0, noReply: 0, skipLeg: 0 },
    leg: makeLeg(),
    supply: [],
    ...overrides,
  };
}

describe("computeTransportGapCount — no legs", () => {
  it("returns 0 when the leg list is empty", () => {
    expect(computeTransportGapCount([])).toBe(0);
  });
});

describe("computeTransportGapCount — balanced leg", () => {
  it("returns 0 when available seats exactly meet demand", () => {
    const summary = makeLegSummary({
      demand: { driving: 0, needRide: 3, noReply: 0, skipLeg: 0 },
      supply: [
        {
          driverName: "Marco",
          routeName: "Marco's car",
          seatCount: 3,
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    expect(computeTransportGapCount([summary])).toBe(0);
  });

  it("returns 0 when available seats exceed demand", () => {
    const summary = makeLegSummary({
      demand: { driving: 0, needRide: 2, noReply: 0, skipLeg: 0 },
      supply: [
        {
          driverName: "Tara",
          routeName: "Tara's SUV",
          seatCount: 5,
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    expect(computeTransportGapCount([summary])).toBe(0);
  });
});

describe("computeTransportGapCount — single gapped leg", () => {
  it("returns the seat deficit when demand exceeds supply", () => {
    const summary = makeLegSummary({
      demand: { driving: 0, needRide: 5, noReply: 0, skipLeg: 0 },
      supply: [
        {
          driverName: "Marco",
          routeName: "Marco's car",
          seatCount: 2,
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    expect(computeTransportGapCount([summary])).toBe(3);
  });

  it("returns demand as deficit when there is no supply at all", () => {
    const summary = makeLegSummary({
      demand: { driving: 0, needRide: 4, noReply: 0, skipLeg: 0 },
      supply: [],
    });
    expect(computeTransportGapCount([summary])).toBe(4);
  });
});

describe("computeTransportGapCount — multiple legs", () => {
  it("sums deficits across all gapped legs", () => {
    const legA = makeLegSummary({
      demand: { driving: 0, needRide: 4, noReply: 0, skipLeg: 0 },
      leg: makeLeg({ legId: "leg-a" }),
      supply: [
        {
          driverName: "Marco",
          routeName: "Marco's car",
          seatCount: 2,
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    const legB = makeLegSummary({
      demand: { driving: 0, needRide: 3, noReply: 0, skipLeg: 0 },
      leg: makeLeg({ legId: "leg-b" }),
      supply: [
        {
          driverName: "Tara",
          routeName: "Tara's SUV",
          seatCount: 1,
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    expect(computeTransportGapCount([legA, legB])).toBe(4);
  });

  it("does not subtract surplus from one leg to offset deficit in another", () => {
    const surplus = makeLegSummary({
      demand: { driving: 0, needRide: 1, noReply: 0, skipLeg: 0 },
      leg: makeLeg({ legId: "leg-surplus" }),
      supply: [
        {
          driverName: "Marco",
          routeName: "Marco's car",
          seatCount: 10,
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    const deficit = makeLegSummary({
      demand: { driving: 0, needRide: 5, noReply: 0, skipLeg: 0 },
      leg: makeLeg({ legId: "leg-deficit" }),
      supply: [],
    });
    expect(computeTransportGapCount([surplus, deficit])).toBe(5);
  });

  it("returns 0 when all legs are balanced", () => {
    const legA = makeLegSummary({
      demand: { driving: 0, needRide: 2, noReply: 0, skipLeg: 0 },
      leg: makeLeg({ legId: "leg-a" }),
      supply: [
        {
          driverName: "Marco",
          routeName: "Marco's car",
          seatCount: 2,
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    const legB = makeLegSummary({
      demand: { driving: 0, needRide: 0, noReply: 0, skipLeg: 0 },
      leg: makeLeg({ legId: "leg-b" }),
      supply: [],
    });
    expect(computeTransportGapCount([legA, legB])).toBe(0);
  });
});

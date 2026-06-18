import { describe, expect, it } from "vitest";
import { computeTransportGapCount } from "./transport";

interface LegSummaryFixture {
  demand: { needRide: number };
  supply: { seatCount: number }[];
}

function makeLegSummary(
  overrides: Partial<LegSummaryFixture> = {},
): LegSummaryFixture {
  return {
    demand: { needRide: 0 },
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
      demand: { needRide: 3 },
      supply: [{ seatCount: 3 }],
    });
    expect(computeTransportGapCount([summary])).toBe(0);
  });

  it("returns 0 when available seats exceed demand", () => {
    const summary = makeLegSummary({
      demand: { needRide: 2 },
      supply: [{ seatCount: 5 }],
    });
    expect(computeTransportGapCount([summary])).toBe(0);
  });
});

describe("computeTransportGapCount — single gapped leg", () => {
  it("returns the seat deficit when demand exceeds supply", () => {
    const summary = makeLegSummary({
      demand: { needRide: 5 },
      supply: [{ seatCount: 2 }],
    });
    expect(computeTransportGapCount([summary])).toBe(3);
  });

  it("returns demand as deficit when there is no supply at all", () => {
    const summary = makeLegSummary({
      demand: { needRide: 4 },
      supply: [],
    });
    expect(computeTransportGapCount([summary])).toBe(4);
  });
});

describe("computeTransportGapCount — multiple legs", () => {
  it("sums deficits across all gapped legs", () => {
    const legA = makeLegSummary({
      demand: { needRide: 4 },
      supply: [{ seatCount: 2 }],
    });
    const legB = makeLegSummary({
      demand: { needRide: 3 },
      supply: [{ seatCount: 1 }],
    });
    expect(computeTransportGapCount([legA, legB])).toBe(4);
  });

  it("does not subtract surplus from one leg to offset deficit in another", () => {
    const surplus = makeLegSummary({
      demand: { needRide: 1 },
      supply: [{ seatCount: 10 }],
    });
    const deficit = makeLegSummary({
      demand: { needRide: 5 },
      supply: [],
    });
    expect(computeTransportGapCount([surplus, deficit])).toBe(5);
  });

  it("returns 0 when all legs are balanced", () => {
    const legA = makeLegSummary({
      demand: { needRide: 2 },
      supply: [{ seatCount: 2 }],
    });
    const legB = makeLegSummary({
      demand: { needRide: 0 },
      supply: [],
    });
    expect(computeTransportGapCount([legA, legB])).toBe(0);
  });
});

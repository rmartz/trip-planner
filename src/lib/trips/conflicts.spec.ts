import { describe, expect, it } from "vitest";
import {
  getConflictDateKeys,
  getConflictSourcesForDate,
  getFirstWindowConflict,
} from "./conflicts";
import type { Trip } from "@/lib/types/trip";
import type { UnavailableRange } from "@/lib/types/unavailable-range";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date("2025-06-10T00:00:00"),
    endDate: new Date("2025-06-20T00:00:00"),
    createdAt: new Date("2025-01-01T00:00:00"),
    createdBy: "uid-1",
    memberUids: ["uid-1"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

function makeRange(
  overrides: Partial<UnavailableRange> = {},
): UnavailableRange {
  return {
    rangeId: "range-1",
    uid: "uid-1",
    startDate: new Date("2025-06-05T00:00:00"),
    endDate: new Date("2025-06-07T00:00:00"),
    ...overrides,
  };
}

// ─── getConflictSourcesForDate ───────────────────────────────────────────────

describe("getConflictSourcesForDate — no conflicts", () => {
  it("returns empty array when user has no trips and no personal blocks", () => {
    const result = getConflictSourcesForDate(
      new Date("2025-06-15T00:00:00"),
      [],
      [],
    );
    expect(result).toEqual([]);
  });

  it("returns empty when the date is blocked but no trips overlap the block", () => {
    // Block: Jun 5–7. Trip: Jun 10–20. Date: Jun 6 (blocked, no trip overlap).
    const result = getConflictSourcesForDate(
      new Date("2025-06-06T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-05T00:00:00"),
          endDate: new Date("2025-06-07T00:00:00"),
        }),
      ],
    );
    expect(result).toEqual([]);
  });

  it("returns empty when the date is on a trip but no personal block covers it", () => {
    // Trip: Jun 10–20. Block: Jun 5–7 (doesn't overlap trip). Date: Jun 15.
    const result = getConflictSourcesForDate(
      new Date("2025-06-15T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-05T00:00:00"),
          endDate: new Date("2025-06-07T00:00:00"),
        }),
      ],
    );
    expect(result).toEqual([]);
  });

  it("returns empty when the date is outside all trips and blocks", () => {
    const result = getConflictSourcesForDate(
      new Date("2025-07-01T00:00:00"),
      [makeTrip()],
      [makeRange()],
    );
    expect(result).toEqual([]);
  });
});

describe("getConflictSourcesForDate — personal block overlapping trip", () => {
  it("returns a trip conflict when a blocked date overlaps an active trip", () => {
    // Block: Jun 12–14. Trip: Jun 10–20. Date: Jun 13.
    const result = getConflictSourcesForDate(
      new Date("2025-06-13T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-12T00:00:00"),
          endDate: new Date("2025-06-14T00:00:00"),
        }),
      ],
    );
    expect(result.length).toBe(1);
    expect(result[0]!.kind).toBe("trip");
    expect(result[0]!.name).toBe("Paris Trip");
  });

  it("returns a conflict on the first day of the block", () => {
    // Block: Jun 10–12. Trip: Jun 10–20. Date: Jun 10 (boundary day).
    const result = getConflictSourcesForDate(
      new Date("2025-06-10T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-12T00:00:00"),
        }),
      ],
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.kind).toBe("trip");
  });

  it("returns a conflict on the last day of the block", () => {
    // Block: Jun 18–20. Trip: Jun 10–20. Date: Jun 20 (boundary day).
    const result = getConflictSourcesForDate(
      new Date("2025-06-20T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-18T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.kind).toBe("trip");
  });
});

describe("getConflictSourcesForDate — per-user isolation", () => {
  it("only reports conflicts from the provided trips and ranges (caller responsibility)", () => {
    // Trip A: Jun 10–20. Block B: Jun 12–14 (overlaps trip A). Date: Jun 13.
    const tripA = makeTrip({ tripId: "trip-a", name: "Trip A" });
    const blockB = makeRange({
      rangeId: "block-b",
      startDate: new Date("2025-06-12T00:00:00"),
      endDate: new Date("2025-06-14T00:00:00"),
    });

    const result = getConflictSourcesForDate(
      new Date("2025-06-13T00:00:00"),
      [tripA],
      [blockB],
    );

    expect(result.length).toBe(1);
    expect(result[0]!.name).toBe("Trip A");
  });
});

// ─── getConflictDateKeys ─────────────────────────────────────────────────────

describe("getConflictDateKeys — date range enumeration", () => {
  it("returns empty Set when there are no conflicts in the window", () => {
    const keys = getConflictDateKeys(
      new Date("2025-06-01T00:00:00"),
      new Date("2025-06-30T00:00:00"),
      [],
      [],
    );
    expect(keys.size).toBe(0);
  });

  it("returns only the days inside the block, not the whole trip window", () => {
    // Block: Jun 12–14. Trip: Jun 10–20. Window: Jun 1–30.
    // Only Jun 12, 13, 14 are in the block (and block overlaps trip), so only those conflict.
    const keys = getConflictDateKeys(
      new Date("2025-06-01T00:00:00"),
      new Date("2025-06-30T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-12T00:00:00"),
          endDate: new Date("2025-06-14T00:00:00"),
        }),
      ],
    );
    expect(keys.has("2025-06-12")).toBe(true);
    expect(keys.has("2025-06-13")).toBe(true);
    expect(keys.has("2025-06-14")).toBe(true);
    expect(keys.has("2025-06-11")).toBe(false);
    expect(keys.has("2025-06-15")).toBe(false);
  });

  it("uses YYYY-MM-DD format with zero-padded month and day", () => {
    // Block: May 5 only. Trip: May 1–10.
    const keys = getConflictDateKeys(
      new Date("2025-05-01T00:00:00"),
      new Date("2025-05-10T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-05-01T00:00:00"),
          endDate: new Date("2025-05-10T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-05-05T00:00:00"),
          endDate: new Date("2025-05-05T00:00:00"),
        }),
      ],
    );
    expect(keys.has("2025-05-05")).toBe(true);
  });

  it("returns empty Set when the block-trip overlap is outside the query window", () => {
    // Block: Jun 12–14. Trip: Jun 10–20. Window: Jun 1–Jun 11 (conflict dates outside window).
    const keys = getConflictDateKeys(
      new Date("2025-06-01T00:00:00"),
      new Date("2025-06-11T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-12T00:00:00"),
          endDate: new Date("2025-06-14T00:00:00"),
        }),
      ],
    );
    expect(keys.size).toBe(0);
  });
});

// ─── getFirstWindowConflict ──────────────────────────────────────────────────

describe("getFirstWindowConflict — Best windows callout", () => {
  it("returns undefined when no conflict in the window", () => {
    // Window: Jun 22–24. Trip: Jun 10–20 (no overlap). No blocks.
    const result = getFirstWindowConflict(
      new Date("2025-06-22T00:00:00"),
      new Date("2025-06-24T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [],
    );
    expect(result).toBeUndefined();
  });

  it("returns a personal-block conflict when block overlaps the window and a trip", () => {
    // Window: Jun 22–24. Block: Jun 21–23 (with note). Trip: Jun 22–28.
    const result = getFirstWindowConflict(
      new Date("2025-06-22T00:00:00"),
      new Date("2025-06-24T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-22T00:00:00"),
          endDate: new Date("2025-06-28T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-21T00:00:00"),
          endDate: new Date("2025-06-23T00:00:00"),
          note: "family reunion",
        }),
      ],
    );
    expect(result).toBeDefined();
    expect(result!.kind).toBe("personal-block");
    expect(result!.name).toBe("family reunion");
  });

  it("returns trip name as the name when block has no note", () => {
    // Window: Jun 22–24. Block: Jun 21–23 (no note). Trip: Jun 22–28 named "Bach".
    const result = getFirstWindowConflict(
      new Date("2025-06-22T00:00:00"),
      new Date("2025-06-24T00:00:00"),
      [
        makeTrip({
          name: "Bach",
          startDate: new Date("2025-06-22T00:00:00"),
          endDate: new Date("2025-06-28T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-21T00:00:00"),
          endDate: new Date("2025-06-23T00:00:00"),
        }),
      ],
    );
    expect(result).toBeDefined();
    expect(result!.name).toBe("Bach");
  });

  it("returns a trip conflict when window overlaps a trip and there are no personal blocks", () => {
    // Window: Jun 15–17. Trip: Jun 10–20. No blocks.
    const result = getFirstWindowConflict(
      new Date("2025-06-15T00:00:00"),
      new Date("2025-06-17T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [],
    );
    expect(result).toBeDefined();
    expect(result!.kind).toBe("trip");
    expect(result!.name).toBe("Paris Trip");
  });

  it("returns undefined when trips and blocks exist but none overlap the window", () => {
    // Window: Jul 1–5. Trip: Jun 10–20. Block: Jun 12–14.
    const result = getFirstWindowConflict(
      new Date("2025-07-01T00:00:00"),
      new Date("2025-07-05T00:00:00"),
      [
        makeTrip({
          startDate: new Date("2025-06-10T00:00:00"),
          endDate: new Date("2025-06-20T00:00:00"),
        }),
      ],
      [
        makeRange({
          startDate: new Date("2025-06-12T00:00:00"),
          endDate: new Date("2025-06-14T00:00:00"),
        }),
      ],
    );
    expect(result).toBeUndefined();
  });
});

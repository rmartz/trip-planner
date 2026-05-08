import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ScreenAvailabilityView } from "./ScreenAvailabilityView";
import { SCREEN_AVAILABILITY_COPY } from "./ScreenAvailabilityView.copy";
import type { Trip } from "@/lib/types/trip";
import type { UnavailableRange } from "@/lib/types/unavailable-range";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date("2025-06-10T00:00:00"),
    endDate: new Date("2025-06-20T00:00:00"),
    createdAt: new Date("2025-01-01T00:00:00"),
    createdBy: "uid-1",
    memberUids: ["uid-1", "uid-2"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

function makeRange(overrides: Partial<UnavailableRange> = {}): UnavailableRange {
  return {
    rangeId: "range-1",
    uid: "uid-1",
    startDate: new Date("2025-06-12T00:00:00"),
    endDate: new Date("2025-06-14T00:00:00"),
    note: "family reunion",
    ...overrides,
  };
}

// Dates for Jun 10–20
const JUN_10_TO_20 = Array.from({ length: 11 }, (_, i) => {
  const d = new Date("2025-06-10T00:00:00");
  d.setDate(d.getDate() + i);
  return d;
});

// ─── Criterion 1: conflict dates render with warn style ──────────────────────

describe("Criterion 1: conflict markers on dates that clash with user's trips or blocks", () => {
  it("renders a date cell with data-conflict attribute when the date is in a conflicting block", () => {
    // Block Jun 12–14 overlaps trip Jun 10–20. Jun 13 is in the block → conflict.
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={{ "2025-06-13": 2 }}
        currentUserTrips={[makeTrip()]}
        currentUserRanges={[makeRange()]}
        isLoading={false}
        isError={false}
      />,
    );

    const cell = screen.getByTestId("avail-cell-2025-06-13");
    expect(cell.dataset["conflict"]).toBe("true");
  });

  it("does not set data-conflict on a date outside any personal block", () => {
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={{ "2025-06-11": 2 }}
        currentUserTrips={[makeTrip()]}
        currentUserRanges={[makeRange()]}
        isLoading={false}
        isError={false}
      />,
    );

    const cell = screen.getByTestId("avail-cell-2025-06-11");
    expect(cell.dataset["conflict"]).toBeUndefined();
  });

  it("does not set data-conflict when the block does not overlap any trip", () => {
    // Block Jun 5–7. Trip Jun 10–20. No overlap.
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={{ "2025-06-05": 2 }}
        currentUserTrips={[makeTrip({ startDate: new Date("2025-06-10T00:00:00"), endDate: new Date("2025-06-20T00:00:00") })]}
        currentUserRanges={[makeRange({ startDate: new Date("2025-06-05T00:00:00"), endDate: new Date("2025-06-07T00:00:00") })]}
        isLoading={false}
        isError={false}
      />,
    );

    // Jun 10 is in the trip but NOT in the block (Jun 5–7) — no conflict.
    const cell = screen.getByTestId("avail-cell-2025-06-10");
    expect(cell.dataset["conflict"]).toBeUndefined();
  });
});

// ─── Criterion 2: Best windows callouts show conflict sub-line ───────────────

describe("Criterion 2: Best windows callouts show conflict warning for overlapping personal blocks", () => {
  it("renders a conflict warning in the best-windows section when a window overlaps a block+trip", () => {
    // Window Jun 12–14 (best window). Block Jun 12–14. Trip Jun 10–20.
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={Object.fromEntries(
          JUN_10_TO_20.map((d) => {
            const k = `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            return [k, 2];
          }),
        )}
        currentUserTrips={[makeTrip()]}
        currentUserRanges={[makeRange()]}
        isLoading={false}
        isError={false}
      />,
    );

    const section = screen.getByTestId("best-windows-section");
    expect(section.textContent).toContain(SCREEN_AVAILABILITY_COPY.conflictWarningPrefix);
  });

  it("does not show a conflict warning in a best-window that does not overlap any personal block", () => {
    // No blocks for the user.
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={Object.fromEntries(
          JUN_10_TO_20.map((d) => {
            const k = `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            return [k, 2];
          }),
        )}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );

    const section = screen.getByTestId("best-windows-section");
    expect(section.textContent).not.toContain(
      SCREEN_AVAILABILITY_COPY.conflictWarningPrefix,
    );
  });
});

// ─── Criterion 3: conflicts are per-user ────────────────────────────────────

describe("Criterion 3: conflicts reflect only the current user's data (per-user)", () => {
  it("shows no conflict when the current user has no trips or blocks", () => {
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={4}
        freeCountByDate={{ "2025-06-13": 2 }}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );

    const cell = screen.getByTestId("avail-cell-2025-06-13");
    expect(cell.dataset["conflict"]).toBeUndefined();
  });
});

// ─── Criterion 4: both signal sources produce the same warn style ─────────────

describe("Criterion 4: both platform trips and personal day-off blocks produce the same conflict style", () => {
  it("marks a conflict cell with data-conflict=true regardless of the source kind", () => {
    // Block Jun 12–14 overlaps trip → conflict on Jun 13.
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={{ "2025-06-13": 1 }}
        currentUserTrips={[makeTrip()]}
        currentUserRanges={[makeRange()]}
        isLoading={false}
        isError={false}
      />,
    );

    const cell = screen.getByTestId("avail-cell-2025-06-13");
    expect(cell.dataset["conflict"]).toBe("true");
  });
});

// ─── Loading / error states ──────────────────────────────────────────────────

describe("ScreenAvailabilityView — loading and error states", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <ScreenAvailabilityView
        dates={[]}
        memberCount={2}
        freeCountByDate={{}}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={true}
        isError={false}
      />,
    );

    expect(screen.getByText(SCREEN_AVAILABILITY_COPY.loadingText)).toBeDefined();
  });

  it("renders error text when isError is true", () => {
    render(
      <ScreenAvailabilityView
        dates={[]}
        memberCount={2}
        freeCountByDate={{}}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={true}
      />,
    );

    expect(screen.getByText(SCREEN_AVAILABILITY_COPY.errorText)).toBeDefined();
  });
});

// ─── Date grid renders ────────────────────────────────────────────────────────

describe("ScreenAvailabilityView — date grid renders", () => {
  it("renders a cell for each date in the provided dates array", () => {
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={{}}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );

    // All 11 dates (Jun 10–20) should have cells
    expect(screen.getByTestId("avail-cell-2025-06-10")).toBeDefined();
    expect(screen.getByTestId("avail-cell-2025-06-20")).toBeDefined();
  });

  it("renders the legend items", () => {
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={{}}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText(SCREEN_AVAILABILITY_COPY.legendConflictsYou)).toBeDefined();
    expect(screen.getByText(SCREEN_AVAILABILITY_COPY.legendAllFree)).toBeDefined();
  });

  it("renders the best windows section heading", () => {
    render(
      <ScreenAvailabilityView
        dates={JUN_10_TO_20}
        memberCount={2}
        freeCountByDate={{}}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText(SCREEN_AVAILABILITY_COPY.bestWindowsSectionTitle)).toBeDefined();
  });
});

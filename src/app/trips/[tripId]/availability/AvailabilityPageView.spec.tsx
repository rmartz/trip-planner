import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AvailabilityPageView } from "./AvailabilityPageView";
import { AVAILABILITY_PAGE_COPY } from "./AvailabilityPageView.copy";
import { SCREEN_AVAILABILITY_COPY } from "@/components/trips/ScreenAvailabilityView.copy";
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
    endDate: new Date("2025-06-13T00:00:00"),
    createdAt: new Date("2025-01-01T00:00:00"),
    createdBy: "uid-1",
    memberUids: ["uid-1", "uid-2", "uid-3"],
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
    startDate: new Date("2025-06-11T00:00:00"),
    endDate: new Date("2025-06-12T00:00:00"),
    note: "doctor",
    ...overrides,
  };
}

describe("AvailabilityPageView — loading state", () => {
  it("renders the loading text when isLoading is true", () => {
    render(
      <AvailabilityPageView
        trip={undefined}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={true}
        isError={false}
      />,
    );
    expect(screen.getByText(AVAILABILITY_PAGE_COPY.loadingText)).toBeDefined();
  });
});

describe("AvailabilityPageView — error state", () => {
  it("renders the error text when isError is true", () => {
    render(
      <AvailabilityPageView
        trip={undefined}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={true}
      />,
    );
    expect(screen.getByText(AVAILABILITY_PAGE_COPY.errorText)).toBeDefined();
  });
});

describe("AvailabilityPageView — not-found state", () => {
  it("renders the not-found text when trip is undefined and not loading/erroring", () => {
    render(
      <AvailabilityPageView
        trip={undefined}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(screen.getByText(AVAILABILITY_PAGE_COPY.notFoundText)).toBeDefined();
  });
});

describe("AvailabilityPageView — heatmap rendering", () => {
  it("renders one date cell per day in the trip's date range", () => {
    render(
      <AvailabilityPageView
        trip={makeTrip()}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );
    // Trip Jun 10–13 → 4 cells
    expect(screen.getByTestId("avail-cell-2025-06-10")).toBeDefined();
    expect(screen.getByTestId("avail-cell-2025-06-11")).toBeDefined();
    expect(screen.getByTestId("avail-cell-2025-06-12")).toBeDefined();
    expect(screen.getByTestId("avail-cell-2025-06-13")).toBeDefined();
  });

  it("renders the legend section once data is loaded", () => {
    render(
      <AvailabilityPageView
        trip={makeTrip()}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(
      screen.getByText(SCREEN_AVAILABILITY_COPY.legendAllFree),
    ).toBeDefined();
  });

  it("renders the best-windows section heading once data is loaded", () => {
    render(
      <AvailabilityPageView
        trip={makeTrip()}
        currentUserTrips={[]}
        currentUserRanges={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(
      screen.getByText(SCREEN_AVAILABILITY_COPY.bestWindowsSectionTitle),
    ).toBeDefined();
  });
});

describe("AvailabilityPageView — free count aggregation from current user's ranges", () => {
  it("subtracts one from the free count on dates inside the current user's unavailable range", () => {
    // Trip Jun 10–13, 3 members. Current user is unavailable Jun 11–12.
    // Expected: Jun 10 = 3/3, Jun 11 = 2/3, Jun 12 = 2/3, Jun 13 = 3/3.
    render(
      <AvailabilityPageView
        trip={makeTrip()}
        currentUserTrips={[]}
        currentUserRanges={[makeRange()]}
        isLoading={false}
        isError={false}
      />,
    );
    const cellInBlock = screen.getByTestId("avail-cell-2025-06-11");
    // The free-count label format is "free/total"
    expect(cellInBlock.textContent).toContain("2/3");

    const cellOutsideBlock = screen.getByTestId("avail-cell-2025-06-10");
    expect(cellOutsideBlock.textContent).toContain("3/3");
  });
});

describe("AvailabilityPageView — conflict overlay for current user", () => {
  it("marks a date as conflicting when the user has a personal block overlapping the trip", () => {
    // Personal block Jun 11–12 overlaps trip Jun 10–13 → conflicts on those dates.
    render(
      <AvailabilityPageView
        trip={makeTrip()}
        currentUserTrips={[makeTrip()]}
        currentUserRanges={[makeRange()]}
        isLoading={false}
        isError={false}
      />,
    );
    const cell = screen.getByTestId("avail-cell-2025-06-11");
    expect(cell.dataset["conflict"]).toBe("true");
  });
});

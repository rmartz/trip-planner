import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import TripsPage from "./page";
import { TRIPS_PAGE_COPY } from "./copy";
import type { Trip } from "@/lib/types/trip";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("@/hooks/use-trips");

import { useTrips } from "@/hooks/use-trips";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date("2026-08-01T12:00:00Z"),
    endDate: new Date("2026-08-08T12:00:00Z"),
    createdAt: new Date("2025-01-01T12:00:00Z"),
    createdBy: "uid-x",
    memberUids: ["uid-x"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

describe("/trips exists as a separate drilled-in list page", () => {
  it("renders the Upcoming section heading", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [makeTrip()],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripsPage />);
    expect(screen.getByText(TRIPS_PAGE_COPY.upcomingHeading)).toBeDefined();
  });

  it("renders the Archived section heading when there are past trips", () => {
    const pastTrip = makeTrip({
      tripId: "trip-past",
      name: "Rome Trip",
      startDate: new Date("2024-01-01T12:00:00Z"),
      endDate: new Date("2024-01-08T12:00:00Z"),
    });

    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [pastTrip],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripsPage />);
    expect(screen.getByText(TRIPS_PAGE_COPY.archivedHeading)).toBeDefined();
  });

  it("renders the page title", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripsPage />);
    expect(screen.getByText(TRIPS_PAGE_COPY.pageTitle)).toBeDefined();
  });

  it("renders loading state", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useTrips>);

    render(<TripsPage />);
    expect(screen.getByText(TRIPS_PAGE_COPY.loadingText)).toBeDefined();
  });
});
